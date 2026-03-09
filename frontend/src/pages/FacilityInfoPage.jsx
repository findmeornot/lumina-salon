import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Card from '../components/Card';

const TextBlock = ({ text }) => (
  <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-white/80">
    {String(text || '').trim() ? text : '-'}
  </div>
);

const FacilityInfoPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['info', 'facility'],
    queryFn: async () => (await api.get('/info/facility')).data
  });

  const facility = data?.facility;
  const room = data?.room;

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">Info Fasilitas Kecantikan</div>
        <div className="text-sm text-gray-500 dark:text-white/70">Aturan, ketentuan booking, jam operasional, dan jadwal cek alat.</div>
        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-300">
            {error.response?.data?.message || error.message}
          </div>
        )}
        {isLoading && <div className="mt-3 text-sm text-gray-500 dark:text-white/70">Loading…</div>}
      </Card>

      <Card className="glass">
        <div className="text-sm text-gray-500 dark:text-white/70 mb-3">Jam operasional</div>
        {room ? (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg p-3 glass-soft">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{room.room_name}</div>
              <div className="text-sm text-gray-600 dark:text-white/70 mt-1">
                Status: {room.is_enabled ? 'Buka' : 'Tutup'}
              </div>
            </div>
            <div className="rounded-lg p-3 glass-soft">
              <div className="text-sm text-gray-600 dark:text-white/70">
                Jam: <span className="font-medium text-gray-900 dark:text-white">{room.open_time} – {room.close_time}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-white/70 mt-1">
                Kapasitas: <span className="font-medium text-gray-900 dark:text-white">{room.capacity}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-white/70">Data jam operasional belum tersedia.</div>
        )}
        {facility?.operational_notes ? (
          <div className="mt-3 rounded-lg p-3 glass-soft">
            <div className="text-sm text-gray-500 dark:text-white/70 mb-1">Catatan operasional</div>
            <TextBlock text={facility.operational_notes} />
          </div>
        ) : null}
      </Card>

      <Card className="glass">
        <div className="text-sm text-gray-500 dark:text-white/70 mb-2">Aturan dan ketentuan penggunaan fasilitas</div>
        <TextBlock text={facility?.rules_terms} />
      </Card>

      <Card className="glass">
        <div className="text-sm text-gray-500 dark:text-white/70 mb-2">Ketentuan booking penggunaan</div>
        <TextBlock text={facility?.booking_terms} />
      </Card>

      <Card className="glass">
        <div className="text-sm text-gray-500 dark:text-white/70 mb-2">Jadwal cek pengurus alat kecantikan</div>
        <TextBlock text={facility?.equipment_check_schedule} />
      </Card>
    </div>
  );
};

export default FacilityInfoPage;

