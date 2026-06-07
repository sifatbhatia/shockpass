'use client'

import { createConfig, http, fallback } from 'wagmi'
import { mainnet, base, arbitrum, polygon } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  coinbaseWallet,
  rainbowWallet,
  injectedWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { alchemyApiKey, walletConnectProjectId } from '@/lib/wallet-env'

const walletList = [metaMaskWallet, rainbowWallet, coinbaseWallet, injectedWallet]

if (walletConnectProjectId) {
  walletList.splice(3, 0, walletConnectWallet)
}

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: walletList,
    },
  ],
  { projectId: walletConnectProjectId, appName: 'Willcall' }
)

function chainTransports(prefix: string) {
  return alchemyApiKey ? fallback([http(`${prefix}/${alchemyApiKey}`), http()]) : http()
}

export const wagmiConfig = createConfig({
  connectors,
  chains: [mainnet, base, arbitrum, polygon],
  transports: {
    [mainnet.id]: chainTransports('https://eth-mainnet.g.alchemy.com/v2'),
    [base.id]: chainTransports('https://base-mainnet.g.alchemy.com/v2'),
    [arbitrum.id]: chainTransports('https://arb-mainnet.g.alchemy.com/v2'),
    [polygon.id]: chainTransports('https://polygon-mainnet.g.alchemy.com/v2'),
  },
})
