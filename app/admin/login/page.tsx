'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLock, FiMail, FiAlertCircle } from 'react-icons/fi';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('admin@moldeweb.no');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid credentials. Use admin@moldeweb.no / admin');
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during sign in.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bento-card p-8 rounded-2xl shadow-xl space-y-6 relative z-10">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center mx-auto mb-4">
          <FiLock size={24} />
        </div>
        <h1 className="font-display font-bold text-2xl text-ink">Admin Sign In</h1>
        <p className="text-xs text-slate font-mono">Enter credentials to access MoldeWeb Admin Panel</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-3 text-red-400 text-xs">
          <FiAlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate">
              <FiMail size={16} />
            </span>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@moldeweb.no"
              className="w-full pl-10 pr-4 py-3 bg-bg-primary/80 border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate">
              <FiLock size={16} />
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
              className="w-full pl-10 pr-4 py-3 bg-bg-primary/80 border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <div className="bg-slate/10 p-3 rounded-lg text-xs text-slate space-y-1 font-mono">
          <p className="font-bold text-ink">Demo Credentials:</p>
          <p>Email: <code className="text-teal font-bold">admin@moldeweb.no</code></p>
          <p>Password: <code className="text-teal font-bold">admin</code></p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="delta-gold-btn w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-gold/20 disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate/10">
        <Link href="/" className="text-xs text-slate hover:text-teal transition-colors font-mono font-bold">
          &larr; Back to Public Website
        </Link>
      </div>
    </div>
  );
}

import Script from 'next/script';

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-bg-deep topographic-bg flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="text-slate text-sm font-mono">Loading login form...</div>}>
        <LoginForm />
      </Suspense>

      {/* Firebase SDK Module Script */}
      <Script id="firebase-login-auth" strategy="afterInteractive" type="module">{`
        // Import the functions you need from the SDKs you need
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";

        // Your web app's Firebase configuration
        const firebaseConfig = {
          apiKey: "AIzaSyBv5CDEmjTkKkm1Dww-tVqzoT9Of5s9NSA",
          authDomain: "molde-web-3dc3e.firebaseapp.com",
          projectId: "molde-web-3dc3e",
          storageBucket: "molde-web-3dc3e.firebasestorage.app",
          messagingSenderId: "930998002896",
          appId: "1:930998002896:web:7e8406f8849c0a86a4ead5",
          measurementId: "G-DKFY521ZQM"
        };

        // Initialize Firebase
        try {
          const app = initializeApp(firebaseConfig);
          if (typeof window !== 'undefined') {
            window.firebaseApp = app;
          }
        } catch (e) {
          console.log("Firebase initialized");
        }
      `}</Script>
    </div>
  );
}
