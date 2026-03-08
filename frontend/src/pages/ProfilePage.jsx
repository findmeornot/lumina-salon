import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField from '../components/FormField';
import { useToast } from '../components/Toast';

const ProfilePage = () => {
  const toast = useToast();
  const { data, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile/me')).data
  });
  const [form, setForm] = useState({ full_name: '', phone_number: '', age: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({ full_name: data.full_name || '', phone_number: data.phone_number || '', age: String(data.age ?? '') });
    setPhotoPreview(data.profile_photo_url ? `${data.profile_photo_url}` : null);
  }, [data]);

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('full_name', form.full_name);
      fd.append('phone_number', form.phone_number);
      fd.append('age', form.age);
      if (photoFile) fd.append('profile_photo', photoFile);
      await api.patch('/profile/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.push({ type: 'success', title: 'Saved', message: 'Profile updated.' });
      setPhotoFile(null);
      refetch();
    } catch (err) {
      toast.push({ type: 'error', title: 'Failed', message: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass">
      <h2 className="font-semibold mb-3 text-gray-900 dark:text-white">Profile</h2>
      {data && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-2" onSubmit={submit}>
          <FormField label="Full name" name="full_name" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
          <FormField label="Phone" name="phone_number" value={form.phone_number} onChange={(e) => setForm((p) => ({ ...p, phone_number: e.target.value }))} />
          <FormField label="Age" name="age" type="number" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} />

          <div className="md:col-span-2 rounded-lg p-3 glass-soft flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-white/80">Tahun Angkatan</div>
              <div className="text-sm text-gray-600 dark:text-white/70">{data.tahun_angkatan}</div>
            </div>
            <div className="text-sm text-gray-600 dark:text-white/70">Email: {data.email}</div>
          </div>

          <div className="md:col-span-2">
            <div className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2">Profile photo</div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden glass-soft">
                {photoPreview ? <img alt="profile" src={photoPreview} className="h-full w-full object-cover" /> : null}
              </div>
              <input type="file" accept="image/*" onChange={onPickPhoto} />
            </div>
          </div>

          <div className="md:col-span-2">
            <Button className="w-full" loading={loading}>Save</Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default ProfilePage;
