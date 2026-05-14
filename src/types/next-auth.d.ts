import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      plan: string
      avatar?: string | null
    }
  }

  interface User {
    role?: string
    plan?: string
    avatar?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
    plan?: string
    avatar?: string | null
  }
}
