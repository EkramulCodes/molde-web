import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decode } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "moldeweb-norway-fixed-secret-key-2026-v1";

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: "Email (use: admin@moldeweb.no)", type: "text", placeholder: "admin@moldeweb.no" },
        password: { label: "Password (use: admin)", type: "password", placeholder: "admin" }
      },
      async authorize(credentials) {
        if (
          (credentials?.email === "admin@moldeweb.no" && credentials?.password === "admin") ||
          (credentials?.email === "admin" && credentials?.password === "admin")
        ) {
          return { id: "1", name: "Admin", email: "admin@moldeweb.no" };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: NEXTAUTH_SECRET,
    async decode(params) {
      try {
        return await decode(params);
      } catch {
        // Return null if JWT decryption fails (e.g., stale or invalid cookie)
        return null;
      }
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  useSecureCookies: true,
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },
};

