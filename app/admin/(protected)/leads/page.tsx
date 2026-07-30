'use client';

import { useState, useEffect } from 'react';
import { 
  FiInbox, 
  FiCheckCircle, 
  FiTrash2, 
  FiArchive, 
  FiClock, 
  FiMail, 
  FiX, 
  FiRefreshCw,
  FiFilter 
} from 'react-icons/fi';

interface LeadItem {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'archived';
}

export default function LeadsManager() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');
  const [loading, setLoading] = useState(true);
  const [activeLead, setActiveLead] = useState<LeadItem | null>(null);

  const loadLeads = async () => {
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
      }
    } catch (e) {
      console.error('Failed to load leads', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchLeadsData = async () => {
      try {
        const res = await fetch('/api/contact');
        const data = await res.json();
        if (active && Array.isArray(data)) {
          setLeads(data);
        }
      } catch (e) {
        console.error('Failed to load leads', e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchLeadsData();
    return () => { active = false; };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'new' | 'read' | 'archived') => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        await loadLeads();
        if (activeLead && activeLead.id === id) {
          setActiveLead({ ...activeLead, status: newStatus });
        }
      }
    } catch (e) {
      alert('Error updating lead status.');
    }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!confirm(`Delete lead from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadLeads();
        if (activeLead && activeLead.id === id) {
          setActiveLead(null);
        }
      }
    } catch (e) {
      alert('Error deleting lead.');
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Client Inquiries & Leads</h1>
          <p className="text-slate text-sm">Manage submissions received through the website contact form.</p>
        </div>

        <button
          onClick={loadLeads}
          className="px-4 py-2 bg-slate/10 hover:bg-teal/20 text-teal rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors self-start md:self-auto"
        >
          <FiRefreshCw size={14} />
          <span>Refresh Submissions</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate/10 pb-3">
        <FiFilter size={16} className="text-slate mr-2" />
        {[
          { id: 'all', label: `All (${leads.length})` },
          { id: 'new', label: `New (${leads.filter((l) => l.status === 'new').length})` },
          { id: 'read', label: `Read (${leads.filter((l) => l.status === 'read').length})` },
          { id: 'archived', label: `Archived (${leads.filter((l) => l.status === 'archived').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-teal text-white shadow-sm'
                : 'text-slate hover:bg-slate/10 hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate">Loading client submissions...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-bg-primary rounded-2xl p-12 text-center border border-slate/10 space-y-2">
          <FiInbox size={36} className="mx-auto text-slate/30" />
          <p className="text-slate text-sm">No submissions match the selected filter.</p>
        </div>
      ) : (
        <div className="bg-bg-primary rounded-2xl border border-slate/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead>
                <tr className="border-b border-slate/10 bg-bg-deep/50 text-xs uppercase tracking-wider text-slate font-mono">
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Received Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => {
                      setActiveLead(lead);
                      if (lead.status === 'new') handleUpdateStatus(lead.id, 'read');
                    }}
                    className={`hover:bg-bg-deep/50 transition-colors cursor-pointer ${
                      lead.status === 'new' ? 'font-semibold bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        {lead.status === 'new' && (
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        )}
                        <span>{lead.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate">{lead.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate/10 text-teal rounded text-xs font-mono">
                        {lead.service}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate font-mono">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          lead.status === 'new'
                            ? 'bg-amber-500/20 text-amber-400'
                            : lead.status === 'read'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate/20 text-slate'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      {lead.status !== 'archived' && (
                        <button
                          onClick={() => handleUpdateStatus(lead.id, 'archived')}
                          className="p-1.5 text-slate hover:text-amber-400 rounded hover:bg-slate/10"
                          title="Archive Lead"
                        >
                          <FiArchive size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteLead(lead.id, lead.name)}
                        className="p-1.5 text-slate hover:text-red-400 rounded hover:bg-slate/10"
                        title="Delete Lead"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {activeLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-slate/20 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start border-b border-slate/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">{activeLead.name}</h2>
                <a
                  href={`mailto:${activeLead.email}`}
                  className="text-xs text-teal hover:underline flex items-center space-x-1 mt-1 font-mono"
                >
                  <FiMail size={12} />
                  <span>{activeLead.email}</span>
                </a>
              </div>
              <button
                onClick={() => setActiveLead(null)}
                className="text-slate hover:text-ink p-1 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-bg-deep p-4 rounded-xl border border-slate/10 font-mono text-xs">
                <div>
                  <span className="text-slate block">Interested Service:</span>
                  <span className="text-gold font-bold">{activeLead.service}</span>
                </div>
                <div>
                  <span className="text-slate block">Submitted Date:</span>
                  <span className="text-ink">{new Date(activeLead.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate">Client Message</span>
                <p className="bg-bg-deep p-4 rounded-xl border border-slate/10 text-ink leading-relaxed whitespace-pre-wrap">
                  {activeLead.message}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate/10">
              <a
                href={`mailto:${activeLead.email}?subject=Re:%20${encodeURIComponent(
                  activeLead.service
                )}%20Inquiry%20-%20MoldeWeb`}
                className="px-5 py-2.5 bg-teal text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20"
              >
                Reply via Email
              </a>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateStatus(activeLead.id, 'archived')}
                  className="px-4 py-2.5 bg-slate/10 text-slate hover:text-amber-400 rounded-lg text-xs font-bold uppercase"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleDeleteLead(activeLead.id, activeLead.name)}
                  className="px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold uppercase"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
