import { useMemo } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import { useAdminCheckinLogs } from '../hooks/useAdmin';
import { toYMDHM } from '../utils/datetime';
import { toYMD, toHM } from '../utils/datetime';

const AdminCheckinLogsPage = () => {
  const { data = [], isFetching } = useAdminCheckinLogs();

  const rows = useMemo(() => data.map((r, idx) => ({ ...r, no: idx + 1 })), [data]);

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Check-in Logs</div>
            <div className="text-sm text-gray-500 dark:text-white/70">Live update every 10s.</div>
          </div>
          <div className="text-sm text-gray-500 dark:text-white/70">{isFetching ? 'Updating...' : ''}</div>
        </div>
      </Card>

      <Table
        columns={[
          { key: 'no', header: 'No', render: (r) => r.no },
          { key: 'name', header: 'Nama', render: (r) => <div className="font-medium">{r.full_name}</div> },
          { key: 'angkatan', header: 'Angkatan', render: (r) => r.tahun_angkatan },
          { key: 'jadwal', header: 'Rentang waktu', render: (r) => `${toYMD(r.booking_date)} ${toHM(r.start_time)}-${toHM(r.end_time)}` },
          { key: 'checkin', header: 'Jam check-in', render: (r) => toYMDHM(r.checkin_time) }
        ]}
        rows={rows}
        keyFn={(r) => String(r.id)}
        empty="No check-ins yet."
      />
    </div>
  );
};

export default AdminCheckinLogsPage;
