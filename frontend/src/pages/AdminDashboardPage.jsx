import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAdminBookings, useAdminDashboard } from '../hooks/useAdmin';
import Card from '../components/Card';
import Button from '../components/Button';
import { useToast } from '../components/Toast';
import Table from '../components/Table';
import StatusPill from '../components/StatusPill';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useCalendarBookings } from '../hooks/useBookings';

const AdminDashboardPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { data } = useAdminDashboard();
  const { data: bookings = [], refetch, isFetching } = useAdminBookings();
  const { data: calendar = [], refetch: refetchCalendar, isFetching: isFetchingCalendar } = useCalendarBookings();
  const [enabled, setEnabled] = useState(true);

  const updateRoom = async () => {
    try {
      await api.patch('/admin/room', { is_enabled: enabled });
      toast.push({ type: 'success', title: 'Updated', message: 'Room setting updated.' });
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };

  const pending = useMemo(() => bookings.filter((b) => b.status === 'Pending').slice(0, 10), [bookings]);

  const approve = async (id) => {
    try {
      await api.patch(`/admin/bookings/${id}/approve`);
      toast.push({ type: 'success', title: 'Approved', message: `Booking #${id} approved.` });
      refetch();
      refetchCalendar();
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };

  const reject = async (id) => {
    try {
      await api.patch(`/admin/bookings/${id}/reject`, { reason: 'Admin moderation' });
      toast.push({ type: 'success', title: 'Rejected', message: `Booking #${id} rejected.` });
      refetch();
      refetchCalendar();
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };

  const statusColor = {
    Pending: '#fde047',
    Approved: '#4ade80',
    Rejected: '#f87171',
    Cancelled: '#9ca3af',
    Completed: '#60a5fa',
    'Checked-In': '#fb923c'
  };

  // Calendar view: hide rejected bookings (they still appear in booking management).
  const calendarEvents = useMemo(() => calendar.filter((b) => b.status !== 'Rejected').map((b) => ({
    id: String(b.id),
    title: `${b.full_name} - ${b.status}`,
    start: `${b.booking_date}T${b.start_time}`,
    end: `${b.booking_date}T${b.end_time}`,
    backgroundColor: statusColor[b.status] || '#e5e7eb',
    borderColor: 'transparent',
    textColor: '#111827'
  })), [calendar]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="glass">
          <div className="text-sm text-gray-500 dark:text-white/70">Total bookings</div>
          <div className="text-2xl font-semibold">{data?.total_bookings || 0}</div>
        </Card>
        <Card className="glass">
          <div className="text-sm text-gray-500 dark:text-white/70">Pending</div>
          <div className="text-2xl font-semibold">{data?.pending_bookings || 0}</div>
        </Card>
        <Card className="glass">
          <div className="text-sm text-gray-500 dark:text-white/70">Total users</div>
          <div className="text-2xl font-semibold">{data?.total_users || 0}</div>
        </Card>
        <Card className="glass space-y-2">
          <div className="text-sm text-gray-500 dark:text-white/70">Room enabled</div>
          <div className="text-2xl font-semibold">{data?.room_enabled ? 'Yes' : 'No'}</div>
          <select className="input" value={enabled ? 'on' : 'off'} onChange={(e) => setEnabled(e.target.value === 'on')}>
            <option value="on">Enabled</option>
            <option value="off">Disabled</option>
          </select>
          <Button variant="secondary" onClick={updateRoom}>Apply</Button>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="glass lg:col-span-2">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">Pending approvals</div>
              <div className="text-sm text-gray-500 dark:text-white/70">Approve/reject booking requests.</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching}>Refresh</Button>
              <Button size="sm" onClick={() => navigate('/admin/bookings')}>Open Management</Button>
            </div>
          </div>

          <Table
            columns={[
              { key: 'user', header: 'User', render: (b) => <div className="font-medium">{b.full_name}<div className="text-xs text-gray-500 dark:text-white/60">{b.email}</div></div> },
              { key: 'when', header: 'Date/Time', render: (b) => <div>{b.booking_date} {b.start_time}-{b.end_time}</div> },
              { key: 'status', header: 'Status', render: (b) => <StatusPill status={b.status} /> },
              {
                key: 'actions',
                header: 'Actions',
                render: (b) => (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => approve(b.id)}>Approve</Button>
                    <Button variant="secondary" size="sm" onClick={() => reject(b.id)}>Reject</Button>
                  </div>
                )
              }
            ]}
            rows={pending}
            keyFn={(b) => String(b.id)}
            empty="No pending bookings."
          />
        </Card>

        <Card className="glass">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Admin actions</div>
          <div className="text-sm text-gray-500 dark:text-white/70 mt-1">Quick shortcuts.</div>
          <div className="mt-4 space-y-2">
            <Button className="w-full" variant="secondary" onClick={() => navigate('/admin/room')}>Show Room QR & Code</Button>
            <Button className="w-full" variant="secondary" onClick={() => navigate('/admin/logs')}>View Check-in Logs</Button>
            <Button className="w-full" variant="secondary" onClick={() => navigate('/admin/users')}>Manage Users</Button>
          </div>
        </Card>
      </div>

      <Card className="glass overflow-x-auto">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Booking Calendar (View)</div>
            <div className="text-sm text-gray-500 dark:text-white/70">Monitor bookings by date/time.</div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetchCalendar()} loading={isFetchingCalendar}>Refresh</Button>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay,dayGridMonth' }}
          slotMinTime="17:00:00"
          slotMaxTime="21:30:00"
          allDaySlot={false}
          events={calendarEvents}
          height="auto"
        />
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
