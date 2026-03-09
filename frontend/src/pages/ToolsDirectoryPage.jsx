import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Card from '../components/Card';

const ToolsDirectoryPage = () => {
  const { data: tools = [], isLoading, error } = useQuery({
    queryKey: ['info', 'tools'],
    queryFn: async () => (await api.get('/info/tools')).data
  });
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return tools;
    return tools.filter((t) => {
      const blob = `${t.name || ''}\n${t.description || ''}\n${t.benefits || ''}\n${t.usage_instructions || ''}`.toLowerCase();
      return blob.includes(query);
    });
  }, [q, tools]);

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Directory Alat Kecantikan</div>
            <div className="text-sm text-gray-500 dark:text-white/70">Foto, nama alat, dan keterangannya (fungsi, manfaat, cara penggunaan).</div>
          </div>
          <input
            className="input w-full md:w-72"
            placeholder="Cari alat…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-300">
            {error.response?.data?.message || error.message}
          </div>
        )}
        {isLoading && <div className="mt-3 text-sm text-gray-500 dark:text-white/70">Loading…</div>}
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {!isLoading && !filtered.length && (
          <Card className="glass">
            <div className="text-sm text-gray-500 dark:text-white/70">Belum ada alat yang tersedia.</div>
          </Card>
        )}
        {filtered.map((t) => (
          <Card key={t.id} className="glass">
            <div className="flex gap-3">
              <div className="w-24 h-24 rounded-lg overflow-hidden glass-soft flex-shrink-0">
                {t.photo_url ? (
                  <img alt={t.name} src={t.photo_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-white/60">
                    No photo
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white truncate">{t.name}</div>
                {t.description ? (
                  <div className="text-sm text-gray-600 dark:text-white/70 whitespace-pre-wrap mt-1">{t.description}</div>
                ) : null}
              </div>
            </div>

            {(t.benefits || t.usage_instructions) ? (
              <div className="mt-3 space-y-2">
                {t.benefits ? (
                  <div className="rounded-lg p-3 glass-soft">
                    <div className="text-xs text-gray-500 dark:text-white/60 mb-1">Manfaat</div>
                    <div className="text-sm text-gray-700 dark:text-white/80 whitespace-pre-wrap">{t.benefits}</div>
                  </div>
                ) : null}
                {t.usage_instructions ? (
                  <div className="rounded-lg p-3 glass-soft">
                    <div className="text-xs text-gray-500 dark:text-white/60 mb-1">Cara penggunaan</div>
                    <div className="text-sm text-gray-700 dark:text-white/80 whitespace-pre-wrap">{t.usage_instructions}</div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ToolsDirectoryPage;

