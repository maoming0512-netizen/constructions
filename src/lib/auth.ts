import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || 'BX79gh4d+pW8n/7Y4i6ynxNHJTKFtrURvC2jCt6VN0Q=',
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const parsed = credentialsSchema.safeParse(credentials)
          if (!parsed.success) {
            console.error('[Auth] Invalid credentials format:', parsed.error)
            return null
          }

          const { email, password } = parsed.data
          console.log('[Auth] Attempting login for:', email)

          let user = await prisma.user.findUnique({ where: { email } })
          console.log('[Auth] User found:', user ? 'yes' : 'no')

          // Auto-create admin if not exists
          if (!user && email === '279364248@qq.com' && password === '1029384756qaZ@') {
            console.log('[Auth] Auto-creating admin user...')
            try {
              user = await prisma.user.create({
                data: {
                  email,
                  password: await bcrypt.hash(password, 10),
                  name: '超级管理员',
                  role: 'admin',
                },
              })
              console.log('[Auth] Admin user created successfully')
            } catch (createError) {
              console.error('[Auth] Failed to create admin:', createError)
              throw new Error('Database error: Unable to create user')
            }
          }

          if (!user) {
            console.log('[Auth] User not found')
            return null
          }

          const valid = await bcrypt.compare(password, user.password)
          console.log('[Auth] Password valid:', valid)
          
          if (!valid) return null

          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch (error) {
          console.error('[Auth] Authorize error:', error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (token?.role) {
        session.user.role = token.role as string
      }
      return session
    },
  },
})
