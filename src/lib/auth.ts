import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Apple from 'next-auth/providers/apple'
import { prisma } from './prisma'
import { verifyMessage } from 'viem'
import { UserRole } from '@/generated/prisma/enums'

type AuthUser = {
  role?: string
  walletAddress?: string | null
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role: string
      walletAddress?: string | null
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: string
    walletAddress?: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'email',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text', optional: true },
        accountType: { label: 'Account type', type: 'text', optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        const email = credentials.email as string
        const requestedRole = credentials.accountType === 'organizer' ? UserRole.ORGANIZER : UserRole.ATTENDEE

        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          const name = (credentials.name as string) || email.split('@')[0]
          user = await prisma.user.create({
            data: { email, name, role: requestedRole, authProvider: 'EMAIL' },
          })
        } else if (requestedRole === UserRole.ORGANIZER && user.role === UserRole.ATTENDEE) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: UserRole.ORGANIZER },
          })
        }

        return { id: user.id, email: user.email, name: user.name, image: user.avatarUrl, role: user.role, walletAddress: user.walletAddress }
      },
    }),
    Credentials({
      id: 'wallet',
      name: 'Wallet',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
        address: { label: 'Address', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature) return null
        const address = credentials.address as string
        const signature = credentials.signature as string
        const message = (credentials.message as string) || 'Sign in to Turnstile'

        const valid = verifyMessage({ address: address as `0x${string}`, message, signature: signature as `0x${string}` })

        if (!valid) return null

        let user = await prisma.user.findUnique({ where: { walletAddress: address.toLowerCase() } })
        if (!user) {
          user = await prisma.user.create({
            data: {
              walletAddress: address.toLowerCase(),
              name: `${address.slice(0, 6)}...${address.slice(-4)}`,
              authProvider: 'WALLET',
            },
          })
        }

        return { id: user.id, email: user.email, name: user.name, image: user.avatarUrl, role: user.role, walletAddress: user.walletAddress }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? [
          Apple({
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const authUser = user as AuthUser
        token.id = user.id!
        token.role = authUser.role || 'ATTENDEE'
        token.walletAddress = authUser.walletAddress || null
      }

      if (token.id && (trigger === 'update' || !user)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, walletAddress: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.walletAddress = dbUser.walletAddress
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.walletAddress = token.walletAddress
      }
      return session
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})
