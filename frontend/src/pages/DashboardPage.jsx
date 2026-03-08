import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import BookingModal from '../components/BookingModal';
import { useToast } from '../components/Toast';
import { useCalendarBookings, useCreateBooking } from '../hooks/useBookings';
import { buildSlotStarts, CAPACITY, slotCountsForDate } from '../utils/timeSlots';

const DashboardPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: mine = [], isLoading, error } = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: async () => (await api.get('/bookings/mine')).data
  });
  const { data: calendar = [] } = useCalendarBookings();
  const createBooking = useCreateBooking();
  const [modalOpen, setModalOpen] = useState(false);

  const upcoming = useMemo(() => mine.filter((b) => ['Pending', 'Approved'].includes(b.status)).slice(0, 3), [mine]);
  const today = new Date().toISOString().slice(0, 10);
  const countsToday = useMemo(() => slotCountsForDate(calendar, today), [calendar, today]);
  const slots = useMemo(() => buildSlotStarts(30), []);
  const nextAvailable = useMemo(() => {
    for (const t of slots) {
      if ((countsToday[t] || 0) < CAPACITY) return t;
    }
    return null;
  }, [slots, countsToday]);

  const onCreate = async (payload) => {
    try {
      await createBooking.mutateAsync(payload);
      toast.push({ type: 'success', title: 'Success', message: 'Booking submitted (Pending).' });
      setModalOpen(false);
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</div>
            <div className="text-sm text-gray-500 dark:text-white/70">Quick stats, upcoming bookings, and fast booking.</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/calendar')}>Calendar</Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/history')}>History</Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>Create Booking</Button>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-300">
            {error.response?.data?.message || error.message}
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="glass">
          <div className="text-sm text-gray-500 dark:text-white/70">Total bookings</div>
          <div className="text-2xl font-semibold">{isLoading ? '…' : mine.length}</div>
        </Card>
        <Card className="glass">
          <div className="text-sm text-gray-500 dark:text-white/70">Pending</div>
          <div className="text-2xl font-semibold">{isLoading ? '…' : mine.filter((b) => b.status === 'Pending').length}</div>
        </Card>
        <Card className="glass">
          <div className="text-sm text-gray-500 dark:text-white/70">Approved</div>
          <div className="text-2xl font-semibold">{isLoading ? '…' : mine.filter((b) => b.status === 'Approved').length}</div>
        </Card>
        <Card className="glass">
          <div className="text-sm text-gray-500 dark:text-white/70">Next available (today)</div>
          <div className="text-2xl font-semibold">{nextAvailable || '-'}</div>
          <div className="text-xs text-gray-500 dark:text-white/60 mt-1">Based on approved/checked-in occupancy.</div>
        </Card>
      </div>

      <Card className="glass">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming</div>
            <div className="text-sm text-gray-500 dark:text-white/70">Your next bookings.</div>
          </div>
        </div>
        <div className="space-y-2">
          {isLoading && <div className="text-gray-500 dark:text-white/70">Loading…</div>}
          {!isLoading && upcoming.map((b) => (
            <div key={b.id} className="rounded-lg p-3 glass-soft flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{b.booking_date} {b.start_time} - {b.end_time}</div>
                <div className="text-sm text-gray-500 dark:text-white/70">{b.status}</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-white/60">#{b.id}</div>
            </div>
          ))}
          {!isLoading && !upcoming.length && <div className="text-gray-500 dark:text-white/70">No upcoming bookings.</div>}
        </div>
      </Card>

      <BookingModal
        open={modalOpen}
        mode="create"
        calendarBookings={calendar}
        initial={{ booking_date: today }}
        onClose={() => setModalOpen(false)}
        onCreate={onCreate}
        loading={{ submit: createBooking.isPending }}
      />
    </div>
  );
};

export default DashboardPage;
