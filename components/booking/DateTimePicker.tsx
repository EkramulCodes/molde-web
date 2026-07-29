'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import { BookingScheduleSettings } from '@/lib/types';

interface DateTimePickerProps {
  date: string;
  time: string;
  onSelect: (date: string, time: string) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function generateSlots(startTime: string, endTime: string, duration: number): string[] {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const slots: string[] = [];
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  while (cur + duration <= end) {
    slots.push(`${pad(Math.floor(cur / 60))}:${pad(cur % 60)}`);
    cur += duration;
  }
  return slots;
}

export function DateTimePicker({ date, time, onSelect }: DateTimePickerProps) {
  const [schedule, setSchedule] = useState<BookingScheduleSettings | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/booking-schedule')
      .then((res) => res.json())
      .then((data) => {
        if (active) setSchedule(data.schedule);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingSchedule(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const loadSlotsForDate = useCallback((dateKey: string) => {
    setLoadingSlots(true);
    fetch(`/api/booking-schedule?date=${dateKey}`)
      .then((res) => res.json())
      .then((data) => setTakenSlots(data.takenSlots || []))
      .catch(() => setTakenSlots([]))
      .finally(() => setLoadingSlots(false));
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isDateSelectable = useCallback(
    (d: Date): boolean => {
      if (!schedule) return false;
      const dCopy = new Date(d);
      dCopy.setHours(0, 0, 0, 0);
      if (dCopy < today) return false;
      if (!schedule.workingDays.includes(dCopy.getDay())) return false;
      if (schedule.blockedDates.includes(toDateKey(dCopy))) return false;
      return true;
    },
    [schedule, today]
  );

  const calendarCells = useMemo(() => {
    const startOffset = viewMonth.getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
    }
    return cells;
  }, [viewMonth]);

  const slots = useMemo(() => {
    if (!schedule || !date) return [];
    const all = generateSlots(schedule.startTime, schedule.endTime, schedule.slotDurationMinutes);
    // Reading the wall clock here is intentional: slot availability is
    // inherently time-sensitive (minNoticeHours), and there is no dependency
    // that could substitute for "now" without reintroducing the same effect
    // synchronously calling setState on every tick.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    return all.map((slot) => {
      const slotDate = new Date(`${date}T${slot}:00`);
      const isPastNotice = slotDate.getTime() - now < schedule.minNoticeHours * 3600000;
      const isBlocked = schedule.blockedSlots.some((b) => b.date === date && b.time === slot);
      const isTaken = takenSlots.includes(slot);
      return { time: slot, disabled: isPastNotice || isBlocked || isTaken };
    });
  }, [schedule, date, takenSlots]);

  const handleDateClick = (d: Date) => {
    if (!isDateSelectable(d)) return;
    const key = toDateKey(d);
    onSelect(key, '');
    loadSlotsForDate(key);
  };

  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loadingSchedule) {
    return (
      <div className="py-8 text-center text-slate text-xs">
        <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={20} />
        Loading availability...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-bg-deep rounded-xl border border-slate/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-slate/10 text-slate hover:text-ink"
            aria-label="Previous month"
          >
            <FiChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-ink">{monthLabel}</span>
          <button
            type="button"
            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-slate/10 text-slate hover:text-ink"
            aria-label="Next month"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAY_LABELS.map((d) => (
            <span key={d} className="text-[9px] font-bold uppercase tracking-wider text-slate/60">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />;
            const key = toDateKey(d);
            const selectable = isDateSelectable(d);
            const isSelected = key === date;
            return (
              <button
                type="button"
                key={key}
                disabled={!selectable}
                onClick={() => handleDateClick(d)}
                className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-teal text-white font-bold shadow-md'
                    : selectable
                    ? 'text-ink hover:bg-teal/10 hover:text-teal'
                    : 'text-slate/20 cursor-not-allowed'
                }`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {date && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">Available Time Slots</label>
          {loadingSlots ? (
            <div className="py-6 text-center text-slate text-xs">
              <FiRefreshCw className="animate-spin mx-auto mb-1 text-teal" size={16} />
              Checking availability...
            </div>
          ) : slots.length === 0 ? (
            <p className="text-xs text-slate italic py-2">No slots configured for this day.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s.time}
                  disabled={s.disabled}
                  onClick={() => onSelect(date, s.time)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    time === s.time
                      ? 'bg-teal text-white shadow-md'
                      : s.disabled
                      ? 'bg-bg-deep text-slate/20 cursor-not-allowed line-through'
                      : 'bg-bg-deep text-ink border border-slate/10 hover:border-teal hover:text-teal'
                  }`}
                >
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
