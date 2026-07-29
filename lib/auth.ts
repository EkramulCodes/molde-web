import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { getDb, DEFAULT_ADMIN_PASSWORD_HASH } from "./store";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "moldeweb-norway-fixed-secret-key-2026-v1";

// bcrypt hashes always start with $2a$/$2b$/$2y$. Older/manually-edited db.json
// files may still have a plaintext password from before hashing was introduced —
// support both so an existing install isn't locked out, but never re-introduce a
// hardcoded credential bypass: this only ever compares against what's actually
// stored in db.account, nothing else.
async function verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  const looksHashed = /^\$2[aby]\$/.test(storedPassword);
  if (looksHashed) {
    return bcrypt.compare(inputPassword, storedPassword);
  }
  return inputPassword === storedPassword;
}

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
        const storedPassword = db.account?.password || DEFAULT_ADMIN_PASSWORD_HASH;

        const inputUser = credentials?.email?.trim();
        const inputPass = credentials?.password?.trim();

        if (!inputUser || !inputPass) {
          return null;
        }

        const isUserMatch = inputUser === storedEmail || inputUser === storedUsername;
        const isPassMatch = await verifyPassword(inputPass, storedPassword);

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

