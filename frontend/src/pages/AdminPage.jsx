import { useState } from 'react';
import api from '../services/api';
import { useAdminDashboard, useAdminBookings, useAdminUsers, useAnalytics } from '../hooks/useAdmin';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminPage = () => {
  const { data: summary } = useAdminDashboard();
  const { data: bookings = [], refetch: refetchBookings } = useAdminBookings();
  const { data: users = [], refetch: refetchUsers } = useAdminUsers();
  const { data: analytics } = useAnalytics();
  const [roomEnabled, setRoomEnabled] = useState(true);

  const approve = async (id) => { await api.patch(`/admin/bookings/${id}/approve`); refetchBookings(); };
  const reject = async (id) => { await api.patch(`/admin/bookings/${id}/reject`, { reason: 'Admin moderation' }); refetchBookings(); };
  const toggleRoom = async () => { await api.patch('/admin/room', { is_enabled: roomEnabled }); };
  const toggleUser = async (id) => { await api.patch(`/admin/users/${id}/toggle`); refetchUsers(); };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card"><div className="text-sm">Total Booking</div><div className="text-2xl font-bold">{summary?.total_bookings || 0}</div></div>
        <div className="card"><div className="text-sm">Pending</div><div className="text-2xl font-bold">{summary?.pending_bookings || 0}</div></div>
        <div className="card"><div className="text-sm">Users</div><div className="text-2xl font-bold">{summary?.total_users || 0}</div></div>
        <div className="card">
          <div className="text-sm">Room Status</div>
          <div className="flex gap-2 mt-2">
            <select className="input" value={roomEnabled ? 'on' : 'off'} onChange={(e) => setRoomEnabled(e.target.value === 'on')}>
              <option value="on">Enabled</option>
              <option value="off">Disabled</option>
            </select>
            <button className="btn-primary" onClick={toggleRoom}>Apply</button>
          </div>
        </div>
      </div>

      <div className="card h-72">
        <h3 className="font-semibold mb-2">Bookings per Week</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={analytics?.bookings_per_week || []}>
            <XAxis dataKey="year_week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#059669" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Moderation</h3>
        <div className="space-y-2">
          {bookings.slice(0, 20).map((b) => (
            <div key={b.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center justify-between">
              <div>{b.full_name} - {b.booking_date} {b.start_time}-{b.end_time} ({b.status})</div>
              {b.status === 'Pending' && (
                <div className="space-x-2">
                  <button className="btn-primary" onClick={() => approve(b.id)}>Approve</button>
                  <button className="btn-secondary" onClick={() => reject(b.id)}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">User Management</h3>
        <div className="space-y-2">
          {users.slice(0, 20).map((u) => (
            <div key={u.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center justify-between">
              <div>{u.full_name} ({u.role}) - {u.is_active ? 'Active' : 'Disabled'}</div>
              <button className="btn-secondary" onClick={() => toggleUser(u.id)}>Toggle</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
