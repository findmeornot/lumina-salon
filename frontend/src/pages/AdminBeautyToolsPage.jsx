import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Table from '../components/Table';
import { useToast } from '../components/Toast';

const emptyForm = {
  id: null,
  name: '',
  description: '',
  benefits: '',
  usage_instructions: '',
  is_active: true
};

const AdminBeautyToolsPage = () => {
  const toast = useToast();
  const { data: tools = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'tools'],
    queryFn: async () => (await api.get('/admin/tools')).data
  });

  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return tools;
    return tools.filter((t) => `${t.name || ''}\n${t.description || ''}`.toLowerCase().includes(query));
  }, [q, tools]);

  useEffect(() => {
    if (!modalOpen) {
      setPhotoFile(null);
    }
  }, [modalOpen]);

  const openCreate = () => {
    setForm(emptyForm);
    setPhotoFile(null);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setForm({
      id: t.id,
      name: t.name || '',
      description: t.description || '',
      benefits: t.benefits || '',
      usage_instructions: t.usage_instructions || '',
      is_active: !!t.is_active
    });
    setPhotoFile(null);
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('benefits', form.benefits);
      fd.append('usage_instructions', form.usage_instructions);
      fd.append('is_active', form.is_active ? 'true' : 'false');
      if (photoFile) fd.append('photo', photoFile);

      if (form.id) {
        await api.put(`/admin/tools/${form.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.push({ type: 'success', title: 'Updated', message: 'Tool updated.' });
      } else {
        await api.post('/admin/tools', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.push({ type: 'success', title: 'Created', message: 'Tool created.' });
      }

      setModalOpen(false);
      refetch();
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (t) => {
    const ok = window.confirm(`Deactivate "${t.name}"? (Tidak akan tampil untuk user)`);
    if (!ok) return;
    try {
      await api.delete(`/admin/tools/${t.id}`);
      toast.push({ type: 'success', title: 'Deactivated', message: 'Tool deactivated.' });
      refetch();
    } catch (e) {
      toast.push({ type: 'error', title: 'Failed', message: e.response?.data?.message || e.message });
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
      <Button onClick={submit} loading={saving}>{form.id ? 'Save' : 'Create'}</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Beauty Tools Directory (Admin)</div>
            <div className="text-sm text-gray-500 dark:text-white/70">Admin bisa tambah alat baru tanpa perlu perubahan dari dev.</div>
          </div>
          <div className="flex items-center gap-2">
            <input className="input w-48 md:w-64" placeholder="Cari…" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching}>Refresh</Button>
            <Button size="sm" onClick={openCreate}>Add Tool</Button>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-300">
            {error.response?.data?.message || error.message}
          </div>
        )}
      </Card>

      <Card className="glass">
        <Table
          columns={[
            {
              key: 'tool',
              header: 'Tool',
              render: (t) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden glass-soft flex-shrink-0">
                    {t.photo_url ? (
                      <img alt={t.name} src={t.photo_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 dark:text-white/60">—</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    {t.description ? <div className="text-xs text-gray-500 dark:text-white/60 truncate">{t.description}</div> : null}
                  </div>
                </div>
              )
            },
            {
              key: 'active',
              header: 'Active',
              render: (t) => (t.is_active ? 'Yes' : 'No')
            },
            {
              key: 'updated',
              header: 'Updated',
              render: (t) => (t.updated_at || '-')
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (t) => (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(t)}>Edit</Button>
                  {t.is_active ? <Button size="sm" variant="secondary" onClick={() => deactivate(t)}>Deactivate</Button> : null}
                </div>
              )
            }
          ]}
          rows={filtered}
          keyFn={(t) => String(t.id)}
          empty={isLoading ? 'Loading…' : 'No tools.'}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={form.id ? 'Edit Tool' : 'Add Tool'}
        onClose={() => setModalOpen(false)}
        footer={footer}
      >
        <div className="space-y-3">
          <FormField label="Nama alat" name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-white/80 mb-1">Keterangan / fungsi</div>
            <textarea className="input min-h-20" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-white/80 mb-1">Manfaat</div>
            <textarea className="input min-h-20" value={form.benefits} onChange={(e) => setForm((p) => ({ ...p, benefits: e.target.value }))} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-white/80 mb-1">Cara penggunaan</div>
            <textarea className="input min-h-20" value={form.usage_instructions} onChange={(e) => setForm((p) => ({ ...p, usage_instructions: e.target.value }))} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-white/80 mb-1">Foto alat</div>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              <div className="text-xs text-gray-500 dark:text-white/60 mt-1">jpeg/png/webp, max 2MB</div>
            </div>
            <div className="rounded-lg p-3 glass-soft">
              <label className="text-sm text-gray-700 dark:text-white/80 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                />
                Active
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBeautyToolsPage;

