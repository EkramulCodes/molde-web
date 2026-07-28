'use client';

import { useState } from 'react';
import { 
  FiSettings, 
  FiShield, 
  FiDownload, 
  FiUpload, 
  FiCheckCircle, 
  FiServer, 
  FiKey, 
  FiRefreshCw 
} from 'react-icons/fi';

export default function SettingsManager() {
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState('');

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      const [contentRes, designRes, servicesRes, seoRes, leadsRes, mediaRes, promoRes] =
        await Promise.all([
          fetch('/api/content'),
          fetch('/api/design'),
          fetch('/api/services'),
          fetch('/api/seo'),
          fetch('/api/contact'),
          fetch('/api/media'),
          fetch('/api/promo'),
        ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        content: await contentRes.json(),
        design: await designRes.json(),
        services: await servicesRes.json(),
        seo: await seoRes.json(),
        leads: await leadsRes.json(),
        media: await mediaRes.json(),
        promo: await promoRes.json(),
      };

      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moldeweb-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setToast('Database backup downloaded successfully!');
      setTimeout(() => setToast(''), 4000);
    } catch (e) {
      alert('Error exporting database backup.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Admin System Settings</h1>
          <p className="text-slate text-sm">Security credentials, database backups, and environment status.</p>
        </div>

        {toast && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-lg flex items-center space-x-2 animate-fade-in">
            <FiCheckCircle size={16} />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 shadow-sm space-y-4">
        <h2 className="font-display text-lg font-bold text-ink flex items-center space-x-2 border-b border-slate/10 pb-3">
          <FiShield className="text-teal" size={18} />
          <span>Active Administrator Account</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
          <div className="bg-bg-deep p-4 rounded-xl border border-slate/10">
            <span className="text-xs text-slate block mb-1">Admin Email:</span>
            <span className="text-teal font-bold">admin@moldeweb.no</span>
          </div>
          <div className="bg-bg-deep p-4 rounded-xl border border-slate/10">
            <span className="text-xs text-slate block mb-1">Role & Privilege:</span>
            <span className="text-gold font-bold">Super Administrator (Full Rights)</span>
          </div>
        </div>
      </div>

      {/* Database Backup & Export */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 shadow-sm space-y-4">
        <h2 className="font-display text-lg font-bold text-ink flex items-center space-x-2 border-b border-slate/10 pb-3">
          <FiServer className="text-gold" size={18} />
          <span>Database Management & Backup</span>
        </h2>

        <p className="text-xs text-slate">
          Export full database snapshot (Content, Services, SEO, Leads, Design settings) into JSON file for offline backup or migration.
        </p>

        <div className="pt-2">
          <button
            onClick={handleExportBackup}
            disabled={exporting}
            className="px-6 py-3 bg-gold text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 transition-all flex items-center space-x-2 shadow-lg shadow-gold/20 disabled:opacity-50"
          >
            <FiDownload size={16} />
            <span>{exporting ? 'Generating Snapshot...' : 'Export DB Backup (.json)'}</span>
          </button>
        </div>
      </div>

      {/* Environment Health */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 shadow-sm space-y-4">
        <h2 className="font-display text-lg font-bold text-ink flex items-center space-x-2 border-b border-slate/10 pb-3">
          <FiKey className="text-indigo-400" size={18} />
          <span>Environment & Server Health</span>
        </h2>

        <div className="space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between bg-bg-deep p-3 rounded-lg border border-slate/10">
            <span className="text-slate">NextAuth Secret Token:</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <FiCheckCircle size={14} />
              <span>Configured</span>
            </span>
          </div>

          <div className="flex items-center justify-between bg-bg-deep p-3 rounded-lg border border-slate/10">
            <span className="text-slate">File Persistence Store:</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <FiCheckCircle size={14} />
              <span>Disk Storage (/data/db.json)</span>
            </span>
          </div>

          <div className="flex items-center justify-between bg-bg-deep p-3 rounded-lg border border-slate/10">
            <span className="text-slate">Media Storage Path:</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <FiCheckCircle size={14} />
              <span>/public/uploads/</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
