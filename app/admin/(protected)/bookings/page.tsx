'use client';

import { useState, useEffect } from 'react';
import {
  FiCalendar,
  FiSearch,
  FiFilter,
  FiTrash2,
  FiX,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiSave,
  FiPlus,
  FiClock,
} from 'react-icons/fi';
import { useToast } from '@/context/ToastContext';
import { BookingItem, BookingScheduleSettings, BookingStatus } from '@/lib/types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookingsManager() {
  const [activeTab, setActiveTab] = useState<'requests' | 'schedule'>('requests');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
            <FiCalendar className="text-teal" size={30} />
            <span>Bookings & Schedule</span>
          </h1>
          <p className="text-slate text-sm">Manage meeting requests and configure your public availability.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate/10 pb-2">
        {[
          { id: 'requests', label: 'Requests' },
          { id: 'schedule', label: 'Schedule Setup' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'requests' | 'schedule')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-teal text-white shadow-md' : 'text-slate hover:bg-slate/10 hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'requests' ? <RequestsTab /> : <ScheduleTab />}
    </div>
  );
}

function RequestsTab() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [activeBooking, setActiveBooking] = useState<BookingItem | null>(null);

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (Array.isArray(data)) setBookings(data);
    } catch (e) {
      console.error('Failed to load bookings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (active && Array.isArray(data)) setBookings(data);
      } catch (e) {
        console.error('Failed to load bookings', e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchInitial();
    return () => {
      active = false;
    };
  }, []);

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await loadBookings();
        showToast('Booking status updated', 'success');
        setActiveBooking((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
      } else {
        showToast('Failed to update booking', 'error');
      }
    } catch {
      showToast('Network error while updating booking', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete booking request from "${name}"?`)) return;
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadBookings();
        showToast('Booking deleted', 'success');
        setActiveBooking((prev) => (prev && prev.id === id ? null : prev));
      } else {
        showToast('Failed to delete booking', 'error');
      }
    } catch {
      showToast('Network error while deleting booking', 'error');
    }
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
    }
    return true;
  });

  const statusColor = (status: BookingStatus) =>
    status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-primary border border-slate/20 rounded-lg text-sm text-ink outline-none focus:border-teal"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <FiFilter size={16} className="text-slate flex-shrink-0" />
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-all ${
                statusFilter === s ? 'bg-teal text-white' : 'text-slate hover:bg-slate/10 hover:text-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={loadBookings}
          className="px-4 py-2 bg-slate/10 hover:bg-teal/20 text-teal rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors flex-shrink-0"
        >
          <FiRefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate">Loading booking requests...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-bg-primary rounded-2xl p-12 text-center border border-slate/10 space-y-2">
          <FiCalendar size={36} className="mx-auto text-slate/30" />
          <p className="text-slate text-sm">No booking requests match your filters.</p>
        </div>
      ) : (
        <div className="bg-bg-primary rounded-2xl border border-slate/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead>
                <tr className="border-b border-slate/10 bg-bg-deep/50 text-xs uppercase tracking-wider text-slate font-mono">
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Regarding</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {filtered.map((b) => (
                  <tr key={b.id} onClick={() => setActiveBooking(b)} className="hover:bg-bg-deep/50 transition-colors cursor-pointer">
                    <td className="py-3.5 px-4 font-medium">{b.name}</td>
                    <td className="py-3.5 px-4 text-slate text-xs">{b.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate/10 text-teal rounded text-xs font-mono">{b.contextLabel}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate font-mono">
                      {b.date} · {b.time}
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border-none outline-none cursor-pointer ${statusColor(b.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleDelete(b.id, b.name)} className="p-1.5 text-slate hover:text-red-400 rounded hover:bg-slate/10" title="Delete Booking">
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

      {activeBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-slate/20 rounded-2xl max-w-lg w-full p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start border-b border-slate/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">{activeBooking.name}</h2>
                <a href={`mailto:${activeBooking.email}`} className="text-xs text-teal hover:underline flex items-center gap-1 mt-1 font-mono">
                  <FiMail size={12} /> {activeBooking.email}
                </a>
              </div>
              <button onClick={() => setActiveBooking(null)} className="text-slate hover:text-ink p-1 rounded-lg">
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-bg-deep p-4 rounded-xl border border-slate/10 font-mono text-xs">
                <div>
                  <span className="text-slate block">WhatsApp:</span>
                  <span className="text-ink font-bold flex items-center gap-1">
                    <FiPhone size={12} />
                    {activeBooking.whatsapp}
                  </span>
                </div>
                <div>
                  <span className="text-slate block">Requested Slot:</span>
                  <span className="text-ink font-bold flex items-center gap-1">
                    <FiClock size={12} />
                    {activeBooking.date} · {activeBooking.time}
                  </span>
                </div>
                <div>
                  <span className="text-slate block">Regarding:</span>
                  <span className="text-gold font-bold">{activeBooking.contextLabel}</span>
                </div>
                <div>
                  <span className="text-slate block">Submitted:</span>
                  <span className="text-ink">{new Date(activeBooking.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {activeBooking.notes && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate">Notes</span>
                  <p className="bg-bg-deep p-4 rounded-xl border border-slate/10 text-ink leading-relaxed whitespace-pre-wrap">{activeBooking.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate/10">
              <a
                href={`https://wa.me/${activeBooking.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-teal text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20"
              >
                Message on WhatsApp
              </a>
              <div className="flex space-x-2">
                {activeBooking.status !== 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(activeBooking.id, 'confirmed')}
                    className="px-4 py-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold uppercase"
                  >
                    Confirm
                  </button>
                )}
                <button
                  onClick={() => handleDelete(activeBooking.id, activeBooking.name)}
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

function ScheduleTab() {
  const { showToast } = useToast();
  const [schedule, setSchedule] = useState<BookingScheduleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedSlotDate, setNewBlockedSlotDate] = useState('');
  const [newBlockedSlotTime, setNewBlockedSlotTime] = useState('');

  useEffect(() => {
    fetch('/api/booking-schedule')
      .then((res) => res.json())
      .then((data) => setSchedule(data.schedule))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleWorkingDay = (day: number) => {
    if (!schedule) return;
    const has = schedule.workingDays.includes(day);
    setSchedule({
      ...schedule,
      workingDays: has ? schedule.workingDays.filter((d) => d !== day) : [...schedule.workingDays, day].sort((a, b) => a - b),
    });
  };

  const addBlockedDate = () => {
    if (!schedule || !newBlockedDate || schedule.blockedDates.includes(newBlockedDate)) return;
    setSchedule({ ...schedule, blockedDates: [...schedule.blockedDates, newBlockedDate].sort() });
    setNewBlockedDate('');
  };

  const removeBlockedDate = (date: string) => {
    if (!schedule) return;
    setSchedule({ ...schedule, blockedDates: schedule.blockedDates.filter((d) => d !== date) });
  };

  const addBlockedSlot = () => {
    if (!schedule || !newBlockedSlotDate || !newBlockedSlotTime) return;
    if (schedule.blockedSlots.some((s) => s.date === newBlockedSlotDate && s.time === newBlockedSlotTime)) return;
    setSchedule({ ...schedule, blockedSlots: [...schedule.blockedSlots, { date: newBlockedSlotDate, time: newBlockedSlotTime }] });
    setNewBlockedSlotDate('');
    setNewBlockedSlotTime('');
  };

  const removeBlockedSlot = (date: string, time: string) => {
    if (!schedule) return;
    setSchedule({ ...schedule, blockedSlots: schedule.blockedSlots.filter((s) => !(s.date === date && s.time === time)) });
  };

  const handleSave = async () => {
    if (!schedule) return;
    setSaving(true);
    try {
      const res = await fetch('/api/booking-schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      if (res.ok) {
        showToast('Schedule updated — changes are live immediately.', 'success');
      } else {
        showToast('Failed to update schedule', 'error');
      }
    } catch {
      showToast('Network error while saving schedule', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !schedule) {
    return (
      <div className="py-16 text-center text-slate">
        <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
        <p>Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-8">
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-ink">Working Days</h3>
        <div className="flex flex-wrap gap-2">
          {DAY_LABELS.map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleWorkingDay(idx)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                schedule.workingDays.includes(idx) ? 'bg-teal text-white shadow-sm' : 'bg-bg-deep text-slate border border-slate/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate/10">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Start Time</label>
          <input
            type="time"
            value={schedule.startTime}
            onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
            className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate">End Time</label>
          <input
            type="time"
            value={schedule.endTime}
            onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
            className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Slot Duration</label>
          <select
            value={schedule.slotDurationMinutes}
            onChange={(e) => setSchedule({ ...schedule, slotDurationMinutes: Number(e.target.value) as 30 | 60 })}
            className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
          >
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate/10">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Minimum Notice (Hours)</label>
          <input
            type="number"
            min={0}
            value={schedule.minNoticeHours}
            onChange={(e) => setSchedule({ ...schedule, minNoticeHours: Number(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Timezone Label</label>
          <input
            type="text"
            value={schedule.timezoneLabel}
            onChange={(e) => setSchedule({ ...schedule, timezoneLabel: e.target.value })}
            className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
            placeholder="Europe/Oslo"
          />
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate/10">
        <h3 className="font-display font-bold text-lg text-ink">Blocked Dates (Full Day)</h3>
        <div className="flex gap-3">
          <input
            type="date"
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={addBlockedDate}
            className="px-4 py-2.5 bg-teal/10 text-teal rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-teal/20 transition-colors flex-shrink-0"
          >
            <FiPlus size={14} /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {schedule.blockedDates.length === 0 && <p className="text-xs text-slate italic">No blocked dates.</p>}
          {schedule.blockedDates.map((d) => (
            <span key={d} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-mono">
              {d}
              <button type="button" onClick={() => removeBlockedDate(d)} aria-label={`Remove blocked date ${d}`}>
                <FiX size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate/10">
        <h3 className="font-display font-bold text-lg text-ink">Blocked Time Slots</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={newBlockedSlotDate}
            onChange={(e) => setNewBlockedSlotDate(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
          />
          <input
            type="time"
            value={newBlockedSlotTime}
            onChange={(e) => setNewBlockedSlotTime(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={addBlockedSlot}
            className="px-4 py-2.5 bg-teal/10 text-teal rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-teal/20 transition-colors flex-shrink-0"
          >
            <FiPlus size={14} /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {schedule.blockedSlots.length === 0 && <p className="text-xs text-slate italic">No blocked slots.</p>}
          {schedule.blockedSlots.map((s) => (
            <span key={`${s.date}-${s.time}`} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-mono">
              {s.date} · {s.time}
              <button type="button" onClick={() => removeBlockedSlot(s.date, s.time)} aria-label={`Remove blocked slot ${s.date} ${s.time}`}>
                <FiX size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate/10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-teal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20 flex items-center space-x-2 disabled:opacity-50"
        >
          <FiSave size={18} />
          <span>{saving ? 'Saving...' : 'Save Schedule'}</span>
        </button>
      </div>
    </div>
  );
}
