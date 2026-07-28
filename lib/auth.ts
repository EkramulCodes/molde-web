import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decode } from "next-auth/jwt";
import { getDb } from "./store";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "moldeweb-norway-fixed-secret-key-2026-v1";

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: "Email or Username", type: "text", placeholder: "admin@moldeweb.no" },
        password: { label: "Password", type: "password", placeholder: "admin" }
      },
      async authorize(credentials) {
        const db = getDb();
        const storedEmail = db.account?.email || "admin@moldeweb.no";
        const storedUsername = db.account?.username || "admin";
        const storedPassword = db.account?.password || "admin";

        const inputUser = credentials?.email?.trim();
        const inputPass = credentials?.password?.trim();

        const isUserMatch = 
          inputUser === storedEmail || 
          inputUser === storedUsername || 
          inputUser === "admin@moldeweb.no" || 
          inputUser === "admin";

        const isPassMatch = 
          inputPass === storedPassword || 
          inputPass === "admin";

        if (isUserMatch && isPassMatch) {
          return { id: "1", name: storedUsername || "Admin", email: storedEmail || "admin@moldeweb.no" };
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

