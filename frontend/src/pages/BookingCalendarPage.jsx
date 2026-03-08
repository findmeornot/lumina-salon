import { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useCalendarBookings, useCancelBooking, useCreateBooking, useOwnBookings, useUpdateBooking } from '../hooks/useBookings';
import Card from '../components/Card';
import Button from '../components/Button';
import BookingModal from '../components/BookingModal';
import StatusPill from '../components/StatusPill';
import { useToast } from '../components/Toast';
import { CAPACITY, SLOT_MINUTES, buildSlotStarts, slotCountsForDate } from '../utils/timeSlots';

const statusColor = {
  Pending: '#fde047',
  Approved: '#4ade80',
  Rejected: '#f87171',
  Cancelled: '#9ca3af',
  Completed: '#60a5fa',
  'Checked-In': '#fb923c'
};

const BookingCalendarPage = () => {
  const toast = useToast();
  const [range, setRange] = useState(null);
  const { data: calendar = [], refetch, isFetching, dataUpdatedAt } = useCalendarBookings(range);
  const { data: mine = [] } = useOwnBookings();
  const createBooking = useCreateBooking();
  const updateBooking = useUpdateBooking();
  const cancelBooking = useCancelBooking();

  const [viewMode, setViewMode] = useState('calendar'); // calendar | list
  const [modal, setModal] = useState({ open: false, mode: 'create', initial: null });
  const [selectedDate, setSelectedDate] = useState('');

  // Calendar view: hide rejected bookings (they still appear in history/management).
  const events = useMemo(() => calendar
    .filter((b) => b.status !== 'Rejected')
    .map((b) => ({
      id: String(b.id),
      title: `${b.full_name} - ${b.status}`,
      start: `${b.booking_date}T${b.start_time}`,
      end: `${b.booking_date}T${b.end_time}`,
      backgroundColor: statusColor[b.status] || '#e5e7eb',
      borderColor: 'transparent',
      textColor: '#111827',
      extendedProps: { status: b.status }
    })), [calendar]);

  const mineById = useMemo(() => {
    const map = new Map();
    for (const b of mine) map.set(String(b.id), b);
    return map;
  }, [mine]);

  const openCreateFromSelection = (sel) => {
    const date = sel.startStr.slice(0, 10);
    const start_time = sel.startStr.slice(11, 16);
    const end_time = sel.endStr.slice(11, 16);
    setModal({ open: true, mode: 'create', initial: { booking_date: date, start_time, end_time } });
  };

  const openFromEvent = (clickInfo) => {
    const id = String(clickInfo.event.id);
    const mineBooking = mineById.get(id);
    if (!mineBooking) {
      toast.push({ type: 'info', title: 'Info', message: 'This booking belongs to another user.' });
      return;
    }
    if (!['Pending', 'Approved'].includes(mineBooking.status)) {
      toast.push({ type: 'info', title: 'Not editable', message: `Booking is ${mineBooking.status}.` });
      return;
    }
    setModal({
      open: true,
      mode: 'edit',
      initial: {
        ...mineBooking,
        duration: mineBooking.start_time && mineBooking.end_time ? (Number(mineBooking.end_time.slice(0, 2)) * 60 + Number(mineBooking.end_time.slice(3, 5))) - (Number(mineBooking.start_time.slice(0, 2)) * 60 + Number(mineBooking.start_time.slice(3, 5))) : 30
      }
    });
  };

  const onCreate = async (payload) => {
    try {
      await createBooking.mutateAsync(payload);
      toast.push({ type: 'success', title: 'Success', message: 'Booking submitted (Pending).' });
      setModal({ open: false, mode: 'create', initial: null });
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };
  const onUpdate = async (id, payload) => {
    try {
      await updateBooking.mutateAsync({ id, payload });
      toast.push({ type: 'success', title: 'Updated', message: 'Booking updated and returned to Pending.' });
      setModal({ open: false, mode: 'edit', initial: null });
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };
  const onCancel = async (id) => {
    try {
      await cancelBooking.mutateAsync(id);
      toast.push({ type: 'success', title: 'Cancelled', message: 'Booking cancelled.' });
      setModal({ open: false, mode: 'edit', initial: null });
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };

  const listDate = selectedDate || new Date().toISOString().slice(0, 10);
  const counts = useMemo(() => slotCountsForDate(calendar, listDate), [calendar, listDate]);
  const listSlots = useMemo(() => buildSlotStarts(30), []);

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Booking Calendar</div>
            <div className="text-sm text-gray-500 dark:text-white/70">Tap a time slot to create a booking. Tap your event to edit/cancel.</div>
            <div className="text-xs text-gray-500 dark:text-white/60 mt-1">
              Last update: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '-'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'calendar' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('calendar')}>Calendar</Button>
            <Button variant={viewMode === 'list' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('list')}>List</Button>
            <Button size="sm" onClick={() => setModal({ open: true, mode: 'create', initial: { booking_date: listDate } })}>Create</Button>
            <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching}>Refresh</Button>
          </div>
        </div>
      </Card>

      {viewMode === 'calendar' ? (
        <Card className="glass overflow-x-auto">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay,dayGridMonth' }}
            slotMinTime="17:00:00"
            slotMaxTime="21:30:00"
            slotDuration={`00:${SLOT_MINUTES}:00`}
            snapDuration={`00:${SLOT_MINUTES}:00`}
            selectable
            selectMirror
            allDaySlot={false}
            events={events}
            eventDidMount={(info) => {
              const st = info.event.extendedProps?.status;
              info.el.title = `${info.event.title} (${st})`;
            }}
            datesSet={(arg) => {
              // FullCalendar gives Date objects; convert to YYYY-MM-DD
              const s = arg.start.toISOString().slice(0, 10);
              const e = arg.end.toISOString().slice(0, 10);
              setRange({ start: s, end: e });
            }}
            select={openCreateFromSelection}
            eventClick={openFromEvent}
            height="auto"
          />
        </Card>
      ) : (
        <Card className="glass">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="font-semibold text-gray-900 dark:text-white">Slot status</div>
            <input className="input w-auto" type="date" value={listDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {listSlots.map((t) => {
              const c = counts[t] || 0;
              const full = c >= CAPACITY;
              return (
                <div key={t} className="rounded-lg p-3 glass-soft flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t}</div>
                    <div className="text-xs text-gray-500 dark:text-white/60">{c}/{CAPACITY} approved checked-in</div>
                  </div>
                  <div>{full ? <StatusPill status="Cancelled" /> : <StatusPill status="Approved" />}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <BookingModal
        open={modal.open}
        mode={modal.mode}
        calendarBookings={calendar}
        initial={modal.initial}
        onClose={() => setModal({ open: false, mode: 'create', initial: null })}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onCancel={onCancel}
        loading={{ submit: createBooking.isPending || updateBooking.isPending, cancel: cancelBooking.isPending }}
      />
    </div>
  );
};

export default BookingCalendarPage;
