'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiLayers, 
  FiInbox, 
  FiImage, 
  FiCheckCircle, 
  FiArrowRight, 
  FiPlus, 
  FiEdit, 
  FiGlobe,
  FiClock
} from 'react-icons/fi';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    activeServices: 0,
    totalLeads: 0,
    newLeads: 0,
    mediaCount: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesRes, leadsRes, mediaRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/contact'),
          fetch('/api/media')
        ]);

        const services = await servicesRes.json();
        const leads = await leadsRes.json();
        const media = await mediaRes.json();

        const activeCount = Array.isArray(services) ? services.filter(s => s.status === 'active').length : 0;
        const leadsList = Array.isArray(leads) ? leads : [];
        const newCount = leadsList.filter(l => l.status === 'new').length;

        setStats({
          activeServices: activeCount,
          totalLeads: leadsList.length,
          newLeads: newCount,
          mediaCount: Array.isArray(media) ? media.length : 0,
        });

        setRecentLeads(leadsList.slice(0, 5));
      } catch (e) {
        console.error('Error loading overview data', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink mb-1">Dashboard Overview</h1>
        <p className="text-slate text-sm">Welcome back to MoldeWeb Content Management System.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate text-xs font-bold uppercase tracking-wider">Active Services</span>
            <div className="w-10 h-10 bg-teal/10 text-teal rounded-xl flex items-center justify-center">
              <FiLayers size={20} />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-ink">{loading ? '...' : stats.activeServices}</p>
          <div className="mt-4 flex items-center text-xs text-teal font-medium">
            <Link href="/admin/services" className="hover:underline flex items-center space-x-1">
              <span>Manage Services</span>
              <FiArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate text-xs font-bold uppercase tracking-wider">Total Leads</span>
            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
              <FiInbox size={20} />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-ink">{loading ? '...' : stats.totalLeads}</p>
          <div className="mt-4 flex items-center text-xs text-amber-500 font-medium">
            {stats.newLeads > 0 ? (
              <span className="bg-amber-500/10 px-2 py-0.5 rounded text-amber-500 font-bold">{stats.newLeads} New Inquiries</span>
            ) : (
              <span className="text-slate">All caught up</span>
            )}
          </div>
        </div>

        <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate text-xs font-bold uppercase tracking-wider">Site Status</span>
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
              <FiCheckCircle size={20} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-emerald-400">Live & Syncing</p>
          <div className="mt-4 flex items-center text-xs text-slate font-medium">
            <a href="/" target="_blank" rel="noreferrer" className="hover:text-teal flex items-center space-x-1">
              <FiGlobe size={12} />
              <span>Preview Public Site</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/content" className="p-4 bg-bg-deep hover:bg-teal/10 border border-slate/10 hover:border-teal/30 rounded-xl transition-all group flex flex-col justify-between">
            <FiEdit className="text-teal group-hover:scale-110 transition-transform mb-2" size={22} />
            <span className="text-sm font-semibold text-ink">Edit Website Text</span>
            <span className="text-xs text-slate mt-1">Hero, About, Contact</span>
          </Link>

          <Link href="/admin/services" className="p-4 bg-bg-deep hover:bg-teal/10 border border-slate/10 hover:border-teal/30 rounded-xl transition-all group flex flex-col justify-between">
            <FiPlus className="text-gold group-hover:scale-110 transition-transform mb-2" size={22} />
            <span className="text-sm font-semibold text-ink">Add / Manage Service</span>
            <span className="text-xs text-slate mt-1">CRUD agency offerings</span>
          </Link>

          <Link href="/admin/design" className="p-4 bg-bg-deep hover:bg-teal/10 border border-slate/10 hover:border-teal/30 rounded-xl transition-all group flex flex-col justify-between">
            <FiImage className="text-indigo-400 group-hover:scale-110 transition-transform mb-2" size={22} />
            <span className="text-sm font-semibold text-ink">Design Settings</span>
            <span className="text-xs text-slate mt-1">Colors, logo, theme</span>
          </Link>

          <Link href="/admin/leads" className="p-4 bg-bg-deep hover:bg-teal/10 border border-slate/10 hover:border-teal/30 rounded-xl transition-all group flex flex-col justify-between">
            <FiInbox className="text-amber-500 group-hover:scale-110 transition-transform mb-2" size={22} />
            <span className="text-sm font-semibold text-ink">View Customer Leads</span>
            <span className="text-xs text-slate mt-1">{stats.newLeads} unread inquiries</span>
          </Link>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Recent Contact Form Submissions</h2>
            <p className="text-xs text-slate">Inquiries submitted via `/contact` page</p>
          </div>
          <Link href="/admin/leads" className="text-xs font-bold uppercase tracking-wider text-teal hover:underline flex items-center space-x-1">
            <span>View All Leads</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate text-sm">Loading recent submissions...</div>
        ) : recentLeads.length === 0 ? (
          <div className="py-8 text-center text-slate text-sm">No submissions received yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead>
                <tr className="border-b border-slate/10 text-xs uppercase tracking-wider text-slate font-mono">
                  <th className="pb-3 px-2">Client Name</th>
                  <th className="pb-3 px-2">Email</th>
                  <th className="pb-3 px-2">Interested Service</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-bg-deep/50 transition-colors">
                    <td className="py-3 px-2 font-medium">{lead.name}</td>
                    <td className="py-3 px-2 text-slate">{lead.email}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 bg-slate/10 rounded text-xs text-teal font-mono">
                        {lead.service}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-slate">
                      <span className="flex items-center space-x-1">
                        <FiClock size={12} />
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        lead.status === 'new' 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : lead.status === 'read' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate/20 text-slate'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
