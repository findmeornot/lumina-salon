import { useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField from '../components/FormField';
import { useToast } from '../components/Toast';

const CreateAdminPage = () => {
  const toast = useToast();
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', tahun_angkatan: '', age: '', phone_number: '', nim: ''
  });

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/admins', form);
      toast.push({ type: 'success', title: 'Created', message: 'Admin created.' });
    } catch (err) {
      toast.push({ type: 'error', title: 'Failed', message: err.response?.data?.message || err.message });
    }
  };

  return (
    <Card className="glass">
      <h2 className="font-semibold mb-3 text-gray-900 dark:text-white">Create New Admin</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-2" onSubmit={submit}>
        <FormField label="Full name" name="full_name" value={form.full_name} onChange={onChange} required />
        <FormField label="Tahun Angkatan" name="tahun_angkatan" value={form.tahun_angkatan} onChange={onChange} required />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} required />
        <FormField label="Age" name="age" type="number" value={form.age} onChange={onChange} required />
        <FormField label="Phone" name="phone_number" value={form.phone_number} onChange={onChange} required />
        <div className="md:col-span-2">
          <FormField label="NIM (optional)" name="nim" value={form.nim} onChange={onChange} />
        </div>
        <div className="md:col-span-2">
          <Button className="w-full">Create</Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateAdminPage;
