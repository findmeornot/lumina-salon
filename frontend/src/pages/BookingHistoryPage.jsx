import { useMemo, useState } from 'react';
import { useCalendarBookings, useCancelBooking, useOwnBookings, useUpdateBooking } from '../hooks/useBookings';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import StatusPill from '../components/StatusPill';
import BookingModal from '../components/BookingModal';
import { useToast } from '../components/Toast';
import { toYMD } from '../utils/datetime';

const BookingHistoryPage = () => {
  const toast = useToast();
  const { data: mine = [] } = useOwnBookings();
  const { data: calendar = [] } = useCalendarBookings();
  const updateBooking = useUpdateBooking();
  const cancelBooking = useCancelBooking();
  const [modal, setModal] = useState({ open: false, initial: null });

  const rows = useMemo(() => mine.slice().sort((a, b) => String(b.booking_date).localeCompare(String(a.booking_date))), [mine]);

  const openEdit = (b) => {
    if (!['Pending', 'Approved'].includes(b.status)) {
      toast.push({ type: 'info', title: 'Not editable', message: `Booking is ${b.status}.` });
      return;
    }
    const duration = (Number(b.end_time.slice(0, 2)) * 60 + Number(b.end_time.slice(3, 5))) - (Number(b.start_time.slice(0, 2)) * 60 + Number(b.start_time.slice(3, 5)));
    setModal({ open: true, initial: { ...b, duration } });
  };

  const onUpdate = async (id, payload) => {
    try {
      await updateBooking.mutateAsync({ id, payload });
      toast.push({ type: 'success', title: 'Updated', message: 'Booking updated (Pending).' });
      setModal({ open: false, initial: null });
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };
  const onCancel = async (id) => {
    try {
      await cancelBooking.mutateAsync(id);
      toast.push({ type: 'success', title: 'Cancelled', message: 'Booking cancelled.' });
      setModal({ open: false, initial: null });
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Booking History</div>
            <div className="text-sm text-gray-500 dark:text-white/70">Edit/cancel pending or approved bookings.</div>
          </div>
        </div>
      </Card>

      <Table
        columns={[
          { key: 'when', header: 'Date/Time', render: (b) => <div className="font-medium">{toYMD(b.booking_date)} {b.start_time}-{b.end_time}</div> },
          { key: 'status', header: 'Status', render: (b) => <div className="flex items-center gap-2"><StatusPill status={b.status} /></div> },
          { key: 'note', header: 'Note', render: (b) => <div className="text-gray-600 dark:text-white/70">{b.rejection_reason || '-'}</div> },
          {
            key: 'actions',
            header: 'Actions',
            render: (b) => (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(b)} disabled={!['Pending', 'Approved'].includes(b.status)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => onCancel(b.id)} loading={cancelBooking.isPending}>Cancel</Button>
              </div>
            )
          }
        ]}
        rows={rows}
        keyFn={(b) => String(b.id)}
        empty="No bookings yet."
      />

      <BookingModal
        open={modal.open}
        mode="edit"
        calendarBookings={calendar}
        initial={modal.initial}
        onClose={() => setModal({ open: false, initial: null })}
        onUpdate={onUpdate}
        onCancel={onCancel}
        loading={{ submit: updateBooking.isPending, cancel: cancelBooking.isPending }}
      />
    </div>
  );
};

export default BookingHistoryPage;
