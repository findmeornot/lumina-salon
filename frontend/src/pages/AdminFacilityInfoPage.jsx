import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { useToast } from '../components/Toast';

const AdminFacilityInfoPage = () => {
  const toast = useToast();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'facility'],
    queryFn: async () => (await api.get('/admin/facility')).data
  });

  const [form, setForm] = useState({
    rules_terms: '',
    booking_terms: '',
    operational_notes: '',
    equipment_check_schedule: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      rules_terms: data.rules_terms || '',
      booking_terms: data.booking_terms || '',
      operational_notes: data.operational_notes || '',
      equipment_check_schedule: data.equipment_check_schedule || ''
    });
  }, [data]);

  const save = async () => {
    try {
      setSaving(true);
      await api.put('/admin/facility', form);
      toast.push({ type: 'success', title: 'Saved', message: 'Facility info updated.' });
      refetch();
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    } finally {
      setSaving(false);
    }
  };

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Facility Info (Admin)</div>
            <div className="text-sm text-gray-500 dark:text-white/70">
              Konten ini tampil di menu pengguna. Jam operasional utama diambil dari pengaturan room.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching}>Refresh</Button>
            <Button size="sm" onClick={save} loading={saving} disabled={isLoading}>Save</Button>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-300">
            {error.response?.data?.message || error.message}
          </div>
        )}
      </Card>

      <Card className="glass space-y-3">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Aturan & ketentuan penggunaan</div>
          <textarea className="input min-h-40" value={form.rules_terms} onChange={onChange('rules_terms')} placeholder="Tulis aturan di sini…" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Ketentuan booking penggunaan</div>
          <textarea className="input min-h-40" value={form.booking_terms} onChange={onChange('booking_terms')} placeholder="Tulis ketentuan booking di sini…" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Catatan jam operasional / ketentuan tambahan</div>
          <textarea className="input min-h-28" value={form.operational_notes} onChange={onChange('operational_notes')} placeholder="Contoh: Hari libur, pengecualian jam, dll." />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Jadwal cek pengurus alat kecantikan</div>
          <textarea className="input min-h-28" value={form.equipment_check_schedule} onChange={onChange('equipment_check_schedule')} placeholder="Tulis jadwal cek alat di sini…" />
        </div>
      </Card>
    </div>
  );
};

export default AdminFacilityInfoPage;

