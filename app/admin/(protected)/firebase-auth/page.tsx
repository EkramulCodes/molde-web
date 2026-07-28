'use client';

import { useState, useEffect } from 'react';
import { 
  FiShield, 
  FiKey, 
  FiSave, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiCopy, 
  FiCheck,
  FiBookOpen,
  FiLock,
  FiZap,
  FiGlobe,
  FiMail,
  FiAlertCircle
} from 'react-icons/fi';

interface FirebaseAuthSettings {
  enabled: boolean;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  enableEmailAuth: boolean;
  enableGoogleAuth: boolean;
}

export default function FirebaseAuthIntegrationPage() {
  const [settings, setSettings] = useState<FirebaseAuthSettings>({
    enabled: false,
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    enableEmailAuth: true,
    enableGoogleAuth: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/firebase-auth')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data) {
          setSettings(data);
        }
      })
      .catch((err) => console.error('Failed to load Firebase Auth settings:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/firebase-auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setToast('Firebase Authentication settings saved successfully!');
        setTimeout(() => setToast(''), 4000);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const generateFirebaseInitSnippet = () => {
    return `// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "${settings.apiKey || 'YOUR_API_KEY'}",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "${settings.authDomain || 'YOUR_PROJECT.firebaseapp.com'}",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "${settings.projectId || 'YOUR_PROJECT_ID'}",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "${settings.storageBucket || 'YOUR_PROJECT.appspot.com'}",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "${settings.messagingSenderId || '1234567890'}",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "${settings.appId || '1:1234567890:web:abcdef'}"
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };`;
  };

  const generateEnvSnippet = () => {
    return `# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="${settings.apiKey || 'YOUR_API_KEY'}"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="${settings.authDomain || 'YOUR_PROJECT.firebaseapp.com'}"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="${settings.projectId || 'YOUR_PROJECT_ID'}"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="${settings.storageBucket || 'YOUR_PROJECT.appspot.com'}"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="${settings.messagingSenderId || '1234567890'}"
NEXT_PUBLIC_FIREBASE_APP_ID="${settings.appId || '1:1234567890:web:abcdef'}"`;
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
            <FiShield className="text-teal" size={32} />
            <span>Firebase Authentication Integration</span>
          </h1>
          <p className="text-slate text-sm">Configure Google Firebase Auth for customer portal and team logins.</p>
        </div>
        {toast && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-xl flex items-center space-x-2 animate-fade-in shadow-sm">
            <FiCheckCircle size={16} />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={28} />
          <p className="font-mono text-xs">Loading Firebase Auth configuration...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Form */}
          <form onSubmit={handleSave} className="bg-bg-primary rounded-2xl border border-slate/15 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal/10 text-teal rounded-lg">
                  <FiKey size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-ink">Firebase Auth Status</h3>
                  <p className="text-xs text-slate">Enable user authentication via Firebase project.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.enabled} 
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
              </label>
            </div>

            {/* Config Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">API Key (apiKey)</label>
                <input
                  type="text"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm font-mono focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Auth Domain (authDomain)</label>
                <input
                  type="text"
                  value={settings.authDomain}
                  onChange={(e) => setSettings({ ...settings, authDomain: e.target.value })}
                  placeholder="my-app.firebaseapp.com"
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm font-mono focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Project ID (projectId)</label>
                <input
                  type="text"
                  value={settings.projectId}
                  onChange={(e) => setSettings({ ...settings, projectId: e.target.value })}
                  placeholder="my-app-id"
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm font-mono focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Storage Bucket (storageBucket)</label>
                <input
                  type="text"
                  value={settings.storageBucket}
                  onChange={(e) => setSettings({ ...settings, storageBucket: e.target.value })}
                  placeholder="my-app.appspot.com"
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm font-mono focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Messaging Sender ID</label>
                <input
                  type="text"
                  value={settings.messagingSenderId}
                  onChange={(e) => setSettings({ ...settings, messagingSenderId: e.target.value })}
                  placeholder="1234567890"
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm font-mono focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">App ID (appId)</label>
                <input
                  type="text"
                  value={settings.appId}
                  onChange={(e) => setSettings({ ...settings, appId: e.target.value })}
                  placeholder="1:1234567890:web:abcdef..."
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm font-mono focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            {/* Providers Toggles */}
            <div className="space-y-3 pt-4 border-t border-slate/10">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate">Enabled Auth Providers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3 bg-bg-deep border border-slate/10 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink">
                    <FiMail size={16} className="text-teal" />
                    <span>Email & Password Auth</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableEmailAuth}
                    onChange={(e) => setSettings({ ...settings, enableEmailAuth: e.target.checked })}
                    className="accent-teal w-4 h-4"
                  />
                </label>

                <label className="p-3 bg-bg-deep border border-slate/10 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink">
                    <FiGlobe size={16} className="text-gold" />
                    <span>Google OAuth Provider</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableGoogleAuth}
                    onChange={(e) => setSettings({ ...settings, enableGoogleAuth: e.target.checked })}
                    className="accent-teal w-4 h-4"
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end border-t border-slate/10">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-teal hover:bg-teal-hover text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {saving ? <FiRefreshCw className="animate-spin" size={14} /> : <FiSave size={14} />}
                <span>Save Firebase Auth Settings</span>
              </button>
            </div>
          </form>

          {/* STEP BY STEP SETUP GUIDE NOTE */}
          <div className="bg-bg-primary rounded-2xl border border-slate/15 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate/10 pb-4">
              <div className="p-2 bg-gold/10 text-gold rounded-lg">
                <FiBookOpen size={20} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-ink">Step-by-Step Setup Guide: Firebase Authentication on Your Own Account</h2>
                <p className="text-slate text-xs">Follow this clear step-by-step checklist to set up Firebase Auth in your Google Cloud account.</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-slate">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-ink">Create a Firebase Project</h3>
                  <p className="text-xs text-slate/80 leading-relaxed">
                    Go to the Firebase Console (<a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-teal underline font-mono">console.firebase.google.com</a>) and click <strong>Add Project</strong>. Enter a project name (e.g. <code className="text-teal font-bold bg-bg-deep px-1 py-0.5 rounded">moldeweb-app</code>) and complete the wizard.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-ink">Register a Web App</h3>
                  <p className="text-xs text-slate/80 leading-relaxed">
                    In your project dashboard, click the <strong>Web (&lt;/&gt;)</strong> icon under &quot;Get started by adding Firebase to your app&quot;. Register your web application and copy the generated <code className="text-teal font-bold bg-bg-deep px-1 py-0.5 rounded">firebaseConfig</code> credentials.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-ink">Enable Authentication Sign-In Methods</h3>
                  <p className="text-xs text-slate/80 leading-relaxed">
                    Navigate to <strong>Build &gt; Authentication</strong> in the left menu, click <strong>Get Started</strong>, and navigate to the <strong>Sign-in method</strong> tab:
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-1 pt-1 text-slate/80 font-mono">
                    <li>Enable <strong className="text-ink">Email/Password</strong> provider.</li>
                    <li>Enable <strong className="text-ink">Google</strong> provider (configure support email).</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-ink">Add Authorized Domains</h3>
                  <p className="text-xs text-slate/80 leading-relaxed">
                    In Authentication &gt; Settings &gt; <strong>Authorized Domains</strong>, add your custom domain (e.g. <code className="text-teal font-bold bg-bg-deep px-1 py-0.5 rounded">moldeweb.no</code>) and preview deployment domain so OAuth popups can redirect safely.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                  5
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-ink">Add Environment Variables & Client Integration Snippet</h3>
                  <p className="text-xs text-slate/80 leading-relaxed">
                    Paste your credentials in the form above or add them to <code className="text-teal font-bold bg-bg-deep px-1 py-0.5 rounded">.env.local</code>:
                  </p>
                  <div className="relative mt-2">
                    <pre className="bg-bg-deep p-4 rounded-xl border border-slate/10 text-xs font-mono text-teal overflow-x-auto">
                      {generateEnvSnippet()}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(generateEnvSnippet(), setCopiedEnv)}
                      className="absolute top-3 right-3 p-2 bg-bg-primary hover:bg-slate/10 text-slate rounded-lg border border-slate/10 text-xs flex items-center gap-1"
                    >
                      {copiedEnv ? <FiCheck className="text-emerald-400" size={14} /> : <FiCopy size={14} />}
                      <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate/80 leading-relaxed pt-2">
                    Client-side initialization snippet (<code className="text-teal font-bold bg-bg-deep px-1 py-0.5 rounded">lib/firebase.ts</code>):
                  </p>
                  <div className="relative mt-2">
                    <pre className="bg-bg-deep p-4 rounded-xl border border-slate/10 text-xs font-mono text-slate overflow-x-auto max-h-60 custom-scrollbar">
                      {generateFirebaseInitSnippet()}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(generateFirebaseInitSnippet(), setCopiedCode)}
                      className="absolute top-3 right-3 p-2 bg-bg-primary hover:bg-slate/10 text-teal font-mono text-xs font-bold rounded-lg border border-slate/10 flex items-center gap-1 shadow-md"
                    >
                      {copiedCode ? <FiCheck className="text-emerald-400" size={14} /> : <FiCopy size={14} />}
                      <span>{copiedCode ? 'Copied Snippet' : 'Copy Code Snippet'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
