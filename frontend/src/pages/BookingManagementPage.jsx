import { useMemo, useState } from 'react';
import api from '../services/api';
import { useAdminBookings } from '../hooks/useAdmin';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import StatusPill from '../components/StatusPill';
import { useToast } from '../components/Toast';
import { useQueryClient } from '@tanstack/react-query';

const BookingManagementPage = () => {
  const toast = useToast();
  const qc = useQueryClient();
  const { data = [], refetch, isFetching } = useAdminBookings();
  const [q, setQ] = useState('');

  const approve = async (id) => {
    try {
      await api.patch(`/admin/bookings/${id}/approve`);
      qc.setQueryData(['admin', 'bookings'], (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((b) => (b.id === id ? { ...b, status: 'Approved', rejection_reason: null } : b));
      });
      qc.invalidateQueries({ queryKey: ['bookings', 'calendar'] });
      toast.push({ type: 'success', title: 'Approved', message: `Booking #${id} approved.` });
      refetch();
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };
  const reject = async (id) => {
    try {
      await api.patch(`/admin/bookings/${id}/reject`, { reason: 'Admin moderation' });
      qc.setQueryData(['admin', 'bookings'], (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((b) => (b.id === id ? { ...b, status: 'Rejected', rejection_reason: 'Admin moderation' } : b));
      });
      qc.invalidateQueries({ queryKey: ['bookings', 'calendar'] });
      toast.push({ type: 'success', title: 'Rejected', message: `Booking #${id} rejected.` });
      refetch();
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return data;
    return data.filter((b) =>
      String(b.full_name || '').toLowerCase().includes(qq) ||
      String(b.email || '').toLowerCase().includes(qq) ||
      String(b.status || '').toLowerCase().includes(qq) ||
      String(b.booking_date || '').includes(qq)
    );
  }, [data, q]);

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Booking Management</div>
            <div className="text-sm text-gray-500 dark:text-white/70">Approve/reject pending bookings. Live updates every 10s.</div>
          </div>
          <div className="flex items-center gap-2">
            <input className="input w-64" placeholder="Search name/email/status/date" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching}>Refresh</Button>
          </div>
        </div>
      </Card>

      <Table
        columns={[
          { key: 'user', header: 'User', render: (b) => <div className="font-medium">{b.full_name}<div className="text-xs text-gray-500 dark:text-white/60">{b.email}</div></div> },
          { key: 'when', header: 'Date/Time', render: (b) => <div>{b.booking_date} {b.start_time}-{b.end_time}</div> },
          { key: 'status', header: 'Status', render: (b) => <StatusPill status={b.status} /> },
          {
            key: 'actions',
            header: 'Actions',
            render: (b) => (
              b.status === 'Pending'
                ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => approve(b.id)}>Approve</Button>
                    <Button variant="secondary" size="sm" onClick={() => reject(b.id)}>Reject</Button>
                  </div>
                )
                : <span className="text-gray-500 dark:text-white/60">-</span>
            )
          }
        ]}
        rows={filtered}
        keyFn={(b) => String(b.id)}
        empty="No bookings."
      />
    </div>
  );
};

export default BookingManagementPage;
