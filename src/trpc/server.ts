import { appRouter } from './routers/_app'
import { createContext } from './context'

export const serverCaller = async () => {
  const ctx = await createContext()
  return appRouter.createCaller(ctx)
}