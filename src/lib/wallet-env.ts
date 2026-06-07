export function configuredEnv(value: string | undefined) {
  if (!value) return ''
  if (value.startsWith('your_')) return ''
  return value
}

export const walletConnectProjectId = configuredEnv(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID)
export const alchemyApiKey = configuredEnv(process.env.NEXT_PUBLIC_ALCHEMY_ID)
