import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { useToast } from '../components/Toast';

const AdminRoomQrPage = () => {
  const toast = useToast();
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'room-qr'],
    queryFn: async () => (await api.get('/qr/room')).data
  });

  const copy = async () => {
    if (!data?.room_code) return;
    try {
      await navigator.clipboard.writeText(data.room_code);
      toast.push({ type: 'success', title: 'Copied', message: 'Room code copied.' });
    } catch {
      toast.push({ type: 'error', title: 'Failed', message: 'Cannot copy on this device.' });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Room QR & Code</div>
            <div className="text-sm text-gray-500 dark:text-white/70">
              Display this QR in the room. If user device cannot scan, use the 6-digit code.
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching}>Refresh</Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass">
          <div className="text-sm text-gray-500 dark:text-white/70 mb-3">QR Code</div>
          <div className="rounded-lg p-3 glass-soft flex items-center justify-center">
            {data?.dataUrl ? <img alt="room-qr" src={data.dataUrl} className="w-64 h-64 object-contain" /> : <div>Loading…</div>}
          </div>
        </Card>

        <Card className="glass">
          <div className="text-sm text-gray-500 dark:text-white/70 mb-2">6-digit room code</div>
          <div className="rounded-lg p-4 glass-soft">
            <div className="text-4xl font-semibold tracking-[0.4em] text-gray-900 dark:text-white">
              {data?.room_code || '------'}
            </div>
            <div className="text-sm text-gray-500 dark:text-white/60 mt-2">
              Expires at: {data?.room_code_expires_at || '-'}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button onClick={copy} disabled={!data?.room_code}>Copy</Button>
              <Button variant="secondary" onClick={() => refetch()} loading={isFetching}>Rotate</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminRoomQrPage;
