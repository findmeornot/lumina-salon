export const OPEN_MINUTES = 17 * 60;
export const CLOSE_MINUTES = 21 * 60 + 30;
export const SLOT_MINUTES = 30;
export const CAPACITY = 5;

export const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
};

export const toHHMM = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};

export const buildSlotStarts = (durationMinutes) => {
  const lastStart = CLOSE_MINUTES - durationMinutes;
  const out = [];
  for (let m = OPEN_MINUTES; m <= lastStart; m += SLOT_MINUTES) out.push(toHHMM(m));
  return out;
};

export const expandBookingToSlots = (booking) => {
  const start = toMinutes(booking.start_time);
  const end = toMinutes(booking.end_time);
  const slots = [];
  for (let m = start; m < end; m += SLOT_MINUTES) slots.push(toHHMM(m));
  return slots;
};

export const slotCountsForDate = (calendarBookings, bookingDate) => {
  const counts = {};
  for (const b of calendarBookings) {
    if (b.booking_date !== bookingDate) continue;
    if (!['Approved', 'Checked-In'].includes(b.status)) continue;
    for (const s of expandBookingToSlots(b)) counts[s] = (counts[s] || 0) + 1;
  }
  return counts;
};

