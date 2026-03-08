import { useMemo, useState } from 'react';
import api from '../services/api';
import { useAdminUsers } from '../hooks/useAdmin';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import { useToast } from '../components/Toast';

const UserManagementPage = () => {
  const toast = useToast();
  const { data = [], refetch, isFetching } = useAdminUsers();
  const [q, setQ] = useState('');

  const toggle = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`);
      toast.push({ type: 'success', title: 'Updated', message: `User #${id} status updated.` });
      refetch();
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return data;
    return data.filter((u) =>
      String(u.full_name || '').toLowerCase().includes(qq) ||
      String(u.email || '').toLowerCase().includes(qq) ||
      String(u.role || '').toLowerCase().includes(qq)
    );
  }, [data, q]);

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">User Management</div>
            <div className="text-sm text-gray-500 dark:text-white/70">Search users and disable/enable accounts.</div>
          </div>
          <div className="flex items-center gap-2">
            <input className="input w-64" placeholder="Search name/email/role" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching}>Refresh</Button>
          </div>
        </div>
      </Card>

      <Table
        columns={[
          { key: 'name', header: 'Name', render: (u) => <div className="font-medium">{u.full_name}<div className="text-xs text-gray-500 dark:text-white/60">{u.email}</div></div> },
          { key: 'role', header: 'Role', render: (u) => <span className="text-sm">{u.role}</span> },
          { key: 'status', header: 'Status', render: (u) => <span className={u.is_active ? 'text-teal-600 dark:text-teal-300' : 'text-red-600 dark:text-red-300'}>{u.is_active ? 'Active' : 'Disabled'}</span> },
          { key: 'actions', header: 'Actions', render: (u) => <Button variant="secondary" size="sm" onClick={() => toggle(u.id)}>Toggle</Button> }
        ]}
        rows={filtered}
        keyFn={(u) => String(u.id)}
        empty="No users."
      />
    </div>
  );
};

export default UserManagementPage;
