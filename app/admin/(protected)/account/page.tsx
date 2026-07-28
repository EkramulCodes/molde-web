'use client';

import { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiSave, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiEye, 
  FiEyeOff,
  FiShield,
  FiAlertCircle
} from 'react-icons/fi';

export default function AccountPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    fetch('/api/account')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data) {
          setUsername(data.username || 'admin');
          setEmail(data.email || 'admin@moldeweb.no');
          setUpdatedAt(data.updatedAt || '');
        }
      })
      .catch((err) => console.error('Failed to load account info:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setToast('');

    if (password && password !== confirmPassword) {
      setError('New password and password confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      const payload: { username: string; email: string; password?: string } = {
        username,
        email,
      };

      if (password) {
        payload.password = password;
      }

      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast('Account credentials saved successfully!');
        setUpdatedAt(data.account.updatedAt);
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setToast(''), 4000);
      } else {
        setError(data.error || 'Failed to update account.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Admin Account</h1>
          <p className="text-slate text-sm">Manage your admin username, email, and authentication password.</p>
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
          <p className="font-mono text-xs">Loading account profile...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Credentials Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="bg-bg-primary rounded-2xl border border-slate/15 p-6 sm:p-8 shadow-sm space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3 text-red-400 text-xs font-medium">
                  <FiAlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-bold text-ink flex items-center gap-2 border-b border-slate/10 pb-2">
                  <FiUser className="text-teal" size={18} />
                  <span>Profile Credentials</span>
                </h3>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate">
                      <FiUser size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full pl-10 pr-4 py-3 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate/70">Used to sign in into the admin dashboard.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate">
                      <FiMail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@moldeweb.no"
                      className="w-full pl-10 pr-4 py-3 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate/70">Primary email for system alerts and sign in.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate/10">
                <h3 className="font-bold text-ink flex items-center gap-2 border-b border-slate/10 pb-2">
                  <FiLock className="text-gold" size={18} />
                  <span>Change Password</span>
                </h3>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate">
                      <FiLock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full pl-10 pr-10 py-3 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate hover:text-ink"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate">
                      <FiLock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-4 py-3 bg-bg-deep border border-slate/20 rounded-xl text-ink text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-teal hover:bg-teal-hover text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {saving ? <FiRefreshCw className="animate-spin" size={16} /> : <FiSave size={16} />}
                  <span>Save Account Details</span>
                </button>
              </div>
            </form>
          </div>

          {/* Side Info Box */}
          <div className="space-y-6">
            <div className="bg-bg-primary rounded-2xl border border-slate/15 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-teal font-bold text-sm">
                <FiShield size={18} />
                <span>Account Status</span>
              </div>
              <div className="space-y-2 text-xs text-slate font-mono">
                <div className="flex justify-between py-1 border-b border-slate/10">
                  <span className="text-slate/60">Role:</span>
                  <span className="text-ink font-bold">Super Admin</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate/10">
                  <span className="text-slate/60">Username:</span>
                  <span className="text-teal font-bold">{username || 'admin'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate/10">
                  <span className="text-slate/60">Email:</span>
                  <span className="text-ink font-bold">{email || 'admin@moldeweb.no'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate/60">Last Updated:</span>
                  <span className="text-slate">{updatedAt ? new Date(updatedAt).toLocaleDateString() : 'Initial'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate/5 rounded-2xl border border-slate/10 p-6 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                <FiLock size={14} />
                <span>Security Notice</span>
              </h4>
              <p className="text-xs text-slate leading-relaxed">
                Updating your login details will take effect immediately for new sign-ins. Make sure to keep your password safe and store backup credentials.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
