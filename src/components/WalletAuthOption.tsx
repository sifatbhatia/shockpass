'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAccount, useSignMessage } from 'wagmi'
import { WalletProviders } from '@/components/WalletProviders'
import { Button } from '@/components/ui/Button'
import { BRAND } from '@/lib/brand'

function WalletAuthButton({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter()
  const { update } = useSession()
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const handleWalletAuth = async () => {
    if (!address) return toast.error('Connect your wallet first')

    try {
      const message = `Sign in to ${BRAND.name}\n\nWallet: ${address}\nTimestamp: ${Date.now()}`
      const signature = await signMessageAsync({ message })
      const result = await signIn('wallet', { message, signature, address, redirect: false })

      if (result?.error) {
        toast.error('Could not sign in with wallet')
        return
      }

      toast.success('Signed in with wallet')
      await update()
      router.refresh()
      router.push(callbackUrl)
    } catch {
      toast.error('Signature rejected')
    }
  }

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <Button variant="ghost" className="w-full" onClick={openConnectModal}>
            Connect wallet
          </Button>
        )}
      </ConnectButton.Custom>
    )
  }

  return (
    <Button variant="electric" className="w-full" onClick={handleWalletAuth}>
      Sign in with {address?.slice(0, 6)}...{address?.slice(-4)}
    </Button>
  )
}

export function WalletAuthOption({ callbackUrl }: { callbackUrl: string }) {
  return (
    <WalletProviders>
      <WalletAuthButton callbackUrl={callbackUrl} />
    </WalletProviders>
  )
}
