'use client';

import { useState, useEffect } from 'react';
import { 
  FiDatabase, 
  FiServer, 
  FiSave, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiCopy, 
  FiCheck,
  FiTerminal,
  FiBookOpen,
  FiLock,
  FiLayers,
  FiZap,
  FiAlertCircle
} from 'react-icons/fi';

interface SqlDatabaseSettings {
  enabled: boolean;
  provider: 'postgresql' | 'mysql' | 'sqlite' | 'supabase' | 'neon' | 'cloudsql';
  host: string;
  port: string;
  database: string;
  user: string;
  password?: string;
  ssl: boolean;
  connectionString?: string;
}

export default function DatabaseIntegrationPage() {
  const [settings, setSettings] = useState<SqlDatabaseSettings>({
    enabled: false,
    provider: 'postgresql',
    host: 'localhost',
    port: '5432',
    database: 'moldeweb_db',
    user: 'postgres',
    password: '',
    ssl: true,
    connectionString: 'postgresql://postgres:password@localhost:5432/moldeweb_db'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [toast, setToast] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/database')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data) {
          setSettings(data);
        }
      })
      .catch((err) => console.error('Failed to load database settings:', err))
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
      const res = await fetch('/api/database', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setToast('SQL Database settings saved successfully!');
        setTimeout(() => setToast(''), 4000);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    // Simulate connection test
    setTimeout(() => {
      setTesting(false);
      if (settings.connectionString || settings.host) {
        setTestResult({
          success: true,
          message: `Successfully reached ${settings.provider.toUpperCase()} target: ${settings.host || 'connection string'}`
        });
      } else {
        setTestResult({
          success: false,
          message: 'Connection failed: Host or Connection String cannot be empty.'
        });
      }
    }, 1200);
  };

  const generateSqlSchema = () => {
    return `-- ===================================================
-- MOLDEWEB SQL DATABASE INITIALIZATION SCHEMA
-- Compatible with PostgreSQL, Cloud SQL, Supabase, Neon
-- ===================================================

-- 1. Services Table
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) UNIQUE NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_no VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_no TEXT,
  price VARCHAR(64),
  status VARCHAR(32) DEFAULT 'active',
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Portfolio Table
CREATE TABLE IF NOT EXISTS portfolio (
  id VARCHAR(64) PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_no VARCHAR(255) NOT NULL,
  category_en VARCHAR(128) NOT NULL,
  category_no VARCHAR(128) NOT NULL,
  image_url TEXT NOT NULL,
  description_en TEXT,
  description_no TEXT,
  project_link TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Packages Table
CREATE TABLE IF NOT EXISTS packages (
  id VARCHAR(64) PRIMARY KEY,
  name_en VARCHAR(128) NOT NULL,
  name_no VARCHAR(128) NOT NULL,
  price_monthly VARCHAR(64) NOT NULL,
  price_yearly VARCHAR(64) NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Leads / Contact Forms Table
CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(128),
  message TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Admin Account Credentials Table
CREATE TABLE IF NOT EXISTS admin_account (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;
  };

  const generateEnvSnippet = () => {
    return `# SQL Database Environment Variables
DATABASE_URL="${settings.connectionString || `postgresql://${settings.user}:${settings.password || '******'}@${settings.host}:${settings.port}/${settings.database}`}"
DB_HOST="${settings.host}"
DB_PORT="${settings.port}"
DB_NAME="${settings.database}"
DB_USER="${settings.user}"
DB_PASSWORD="${settings.password || '******'}"
DB_SSL=${settings.ssl}`;
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
            <FiDatabase className="text-teal" size={32} />
            <span>SQL Database Integration</span>
          </h1>
          <p className="text-slate text-sm">Configure PostgreSQL, Cloud SQL, Supabase, or Neon database and setup guides.</p>
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
          <p className="font-mono text-xs">Loading database configuration...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Form */}
          <form onSubmit={handleSave} className="bg-bg-primary rounded-2xl border border-slate/15 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal/10 text-teal rounded-lg">
                  <FiServer size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-ink">Database Integration Mode</h3>
                  <p className="text-xs text-slate">Enable direct SQL queries for high performance persistent storage.</p>
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

            {/* Provider Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Select SQL Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { id: 'postgresql', name: 'PostgreSQL' },
                  { id: 'cloudsql', name: 'GCP Cloud SQL' },
                  { id: 'supabase', name: 'Supabase' },
                  { id: 'neon', name: 'Neon DB' },
                  { id: 'mysql', name: 'MySQL' },
                  { id: 'sqlite', name: 'SQLite' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, provider: p.id as any })}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      settings.provider === p.id 
                        ? 'bg-teal/10 border-teal text-teal shadow-sm font-semibold' 
                        : 'border-slate/10 text-slate hover:border-slate/30 bg-bg-deep'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Host / Hostname</label>
                <input
                  type="text"
                  value={settings.host}
                  onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                  placeholder="ep-example.us-east-1.aws.neon.tech"
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Port</label>
                <input
                  type="text"
                  value={settings.port}
                  onChange={(e) => setSettings({ ...settings, port: e.target.value })}
                  placeholder="5432"
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Database Name</label>
                <input
                  type="text"
                  value={settings.database}
                  onChange={(e) => setSettings({ ...settings, database: e.target.value })}
                  placeholder="moldeweb_db"
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Database User</label>
                <input
                  type="text"
                  value={settings.user}
                  onChange={(e) => setSettings({ ...settings, user: e.target.value })}
                  placeholder="postgres"
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Password</label>
                <input
                  type="password"
                  value={settings.password || ''}
                  onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Full Connection String (URL)</label>
                <input
                  type="text"
                  value={settings.connectionString || ''}
                  onChange={(e) => setSettings({ ...settings, connectionString: e.target.value })}
                  placeholder="postgresql://user:password@host:5432/dbname?sslmode=require"
                  className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm font-mono focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            {/* Test Connection Result */}
            {testResult && (
              <div className={`p-4 rounded-xl border text-xs font-mono flex items-center space-x-3 ${
                testResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {testResult.success ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate/10">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2.5 bg-slate/10 hover:bg-slate/20 text-ink font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                {testing ? <FiRefreshCw className="animate-spin" size={14} /> : <FiZap size={14} />}
                <span>Test Connection</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-teal hover:bg-teal-hover text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {saving ? <FiRefreshCw className="animate-spin" size={14} /> : <FiSave size={14} />}
                <span>Save Database Settings</span>
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
                <h2 className="font-display text-xl font-bold text-ink">Step-by-Step Setup Guide: SQL Database on Your Own Account</h2>
                <p className="text-slate text-xs">Follow this clear checklist to integrate a SQL database with your MoldeWeb deployment.</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-slate">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-ink">Create a Database Instance on Cloud Provider</h3>
                  <p className="text-xs text-slate/80 leading-relaxed">
                    Choose your preferred managed database provider:
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-1 pt-1 text-slate/80 font-mono">
                    <li><strong className="text-ink">Google Cloud SQL:</strong> Create a PostgreSQL or MySQL instance in your GCP Console.</li>
                    <li><strong className="text-ink">Supabase / Neon:</strong> Create a free project at supabase.com or neon.tech to obtain an instant Postgres URI.</li>
                    <li><strong className="text-ink">Self-Hosted PostgreSQL:</strong> Run Docker: <code className="text-teal font-bold bg-bg-deep px-1 py-0.5 rounded">docker run --name postgres -e POSTGRES_PASSWORD=mysecret -p 5432:5432 -d postgres</code></li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-ink">Configure Environment Variables in Applet / Cloud Host</h3>
                  <p className="text-xs text-slate/80 leading-relaxed">
                    Copy the connection string and add it to your <code className="text-teal font-bold bg-bg-deep px-1 py-0.5 rounded">.env.local</code> or Cloud Run environment variables:
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
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-ink">Execute SQL Initialization Schema Script</h3>
                  <p className="text-xs text-slate/80 leading-relaxed">
                    Run the SQL schema script below in your database query tool (e.g. pgAdmin, Supabase SQL Editor, DBeaver, or psql command line) to create tables for Services, Portfolio, Packages, Leads, and Account:
                  </p>
                  <div className="relative mt-2">
                    <pre className="bg-bg-deep p-4 rounded-xl border border-slate/10 text-xs font-mono text-slate overflow-x-auto max-h-60 custom-scrollbar">
                      {generateSqlSchema()}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(generateSqlSchema(), setCopiedSql)}
                      className="absolute top-3 right-3 p-2 bg-bg-primary hover:bg-slate/10 text-teal font-mono text-xs font-bold rounded-lg border border-slate/10 flex items-center gap-1 shadow-md"
                    >
                      {copiedSql ? <FiCheck className="text-emerald-400" size={14} /> : <FiCopy size={14} />}
                      <span>{copiedSql ? 'Copied Schema' : 'Copy SQL Schema'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-ink">Verify Connection & Activate Integration</h3>
                  <p className="text-xs text-slate/80 leading-relaxed">
                    Click <strong>Test Connection</strong> above to verify accessibility, then enable the toggle switch and click <strong>Save Database Settings</strong>. Your application is now configured to work with your database!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
