'use client'

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/lib/wagmi'

const willcallWalletTheme = (() => {
  const theme = darkTheme({
    accentColor: '#d4ff52',
    accentColorForeground: '#050505',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'large',
  })

  return {
    ...theme,
    colors: {
      ...theme.colors,
      actionButtonSecondaryBackground: '#181818',
      closeButton: '#f7f5f5',
      closeButtonBackground: 'rgba(255,255,255,0.06)',
      connectButtonBackground: '#050505',
      connectButtonInnerBackground: '#181818',
      connectButtonText: '#f7f5f5',
      generalBorder: 'rgba(255,255,255,0.12)',
      generalBorderDim: 'rgba(255,255,255,0.07)',
      menuItemBackground: 'rgba(255,255,255,0.045)',
      modalBackdrop: 'rgba(5,5,5,0.78)',
      modalBackground: '#050505',
      modalBorder: 'rgba(212,255,82,0.2)',
      modalText: '#f7f5f5',
      modalTextDim: '#a3a1a8',
      modalTextSecondary: '#ecdffb',
      profileAction: '#181818',
      profileActionHover: '#232323',
      profileForeground: '#181818',
      selectedOptionBorder: '#d4ff52',
    },
    shadows: {
      ...theme.shadows,
      dialog: '0 30px 120px rgba(0,0,0,0.74), 0 0 0 1px rgba(212,255,82,0.16)',
      selectedOption: '0 0 0 1px rgba(212,255,82,0.42), 0 0 32px rgba(212,255,82,0.12)',
      walletLogo: '0 10px 32px rgba(0,0,0,0.46)',
    },
    radii: {
      ...theme.radii,
      actionButton: '14px',
      connectButton: '999px',
      menuButton: '14px',
      modal: '24px',
      modalMobile: '24px 24px 0 0',
    },
  }
})()

export function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider
        theme={willcallWalletTheme}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  )
}
