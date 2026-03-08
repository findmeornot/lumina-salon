import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import FormField from './FormField';
import StatusPill from './StatusPill';
import { buildSlotStarts, CAPACITY, slotCountsForDate, toMinutes } from '../utils/timeSlots';

const durToEnd = (startHHMM, duration) => {
  const end = toMinutes(startHHMM) + Number(duration);
  const h = String(Math.floor(end / 60)).padStart(2, '0');
  const m = String(end % 60).padStart(2, '0');
  return `${h}:${m}`;
};

const BookingModal = ({
  open,
  mode, // 'create' | 'edit'
  calendarBookings,
  initial,
  onClose,
  onCreate,
  onUpdate,
  onCancel,
  loading
}) => {
  const [booking_date, setDate] = useState(initial?.booking_date || '');
  const [duration, setDuration] = useState(initial?.duration || 30);
  const [start_time, setStart] = useState(initial?.start_time || '');

  useEffect(() => {
    if (!open) return;
    setDate(initial?.booking_date || '');
    setDuration(initial?.duration || 30);
    setStart(initial?.start_time || '');
  }, [open, initial?.booking_date, initial?.duration, initial?.start_time]);

  const slotCounts = useMemo(() => slotCountsForDate(calendarBookings || [], booking_date), [calendarBookings, booking_date]);
  const startOptions = useMemo(() => buildSlotStarts(Number(duration)), [duration]);

  const end_time = start_time ? durToEnd(start_time, duration) : '';
  const blocked = useMemo(() => {
    if (!booking_date || !start_time) return false;
    const slots = [start_time];
    if (Number(duration) === 60) slots.push(durToEnd(start_time, 30));
    return slots.some((s) => (slotCounts[s] || 0) >= CAPACITY);
  }, [booking_date, start_time, duration, slotCounts]);

  const submit = async () => {
    const payload = { booking_date, start_time, end_time };
    if (mode === 'edit') return onUpdate?.(initial.id, payload);
    return onCreate?.(payload);
  };

  const title = mode === 'edit' ? 'Edit Booking' : 'Create Booking';

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-gray-500 dark:text-white/60">
            Capacity: {CAPACITY} users/slot
          </div>
          <div className="flex items-center gap-2">
            {mode === 'edit' && onCancel && (
              <Button variant="danger" size="sm" loading={loading?.cancel} onClick={() => onCancel(initial.id)}>
                Cancel Booking
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
            <Button size="sm" loading={loading?.submit} disabled={blocked || !booking_date || !start_time} onClick={submit}>
              {mode === 'edit' ? 'Save' : 'Submit'}
            </Button>
          </div>
        </div>
      }
    >
      {initial?.status && (
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-white/70">Current status</div>
          <StatusPill status={initial.status} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Date"
          name="booking_date"
          type="date"
          value={booking_date}
          onChange={(e) => setDate(e.target.value)}
          required
          inputProps={{ max: undefined }}
        />

        <div className="space-y-1">
          <div className="relative">
            <select
              className="peer w-full rounded-md border px-3 pb-2 pt-5 text-sm text-gray-900 dark:text-white bg-white/55 dark:bg-white/[0.08] backdrop-blur-xl border-white/40 dark:border-white/10 outline-none transition glass-ring focus:border-teal-400/70"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
            </select>
            <label className="pointer-events-none absolute left-3 top-4 origin-[0] text-sm text-gray-500 transition peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-teal-600 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-90 dark:text-white/60 peer-focus:dark:text-teal-300">
              Duration
            </label>
          </div>
          <div className="text-xs text-gray-500 dark:text-white/60">Max 60 minutes per day.</div>
        </div>

        <div className="space-y-1 md:col-span-2">
          <div className="relative">
            <select
              className="peer w-full rounded-md border px-3 pb-2 pt-5 text-sm text-gray-900 dark:text-white bg-white/55 dark:bg-white/[0.08] backdrop-blur-xl border-white/40 dark:border-white/10 outline-none transition glass-ring focus:border-teal-400/70"
              value={start_time}
              onChange={(e) => setStart(e.target.value)}
            >
              <option value="" disabled>Select time</option>
              {startOptions.map((t) => {
                const second = Number(duration) === 60 ? durToEnd(t, 30) : null;
                const full = (slotCounts[t] || 0) >= CAPACITY || (second && (slotCounts[second] || 0) >= CAPACITY);
                const label = `${t} - ${durToEnd(t, duration)}${full ? ' (Full)' : ''}`;
                return (
                  <option key={t} value={t} disabled={full}>
                    {label}
                  </option>
                );
              })}
            </select>
            <label className="pointer-events-none absolute left-3 top-4 origin-[0] text-sm text-gray-500 transition peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-teal-600 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-90 dark:text-white/60 peer-focus:dark:text-teal-300">
              Time slot
            </label>
          </div>
          <div className="text-xs text-gray-500 dark:text-white/60">Operating hours: 17:00 - 21:30. Booking up to 7 days in advance.</div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingModal;
