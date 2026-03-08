import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { APP_NAME } from '../utils/appConfig';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField from '../components/FormField';
import { useToast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';

const AdminLoginPage = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const { user, token, login } = useAuth();

  const [username, setUsername] = useState('lumina@admin');
  const [password, setPassword] = useState('lumina@12345');
  const [loading, setLoading] = useState(false);

  const alreadyAdmin = useMemo(() => !!token && user?.role === 'admin', [token, user?.role]);
  if (alreadyAdmin) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post('/admin/login', { username, password });
      login(data);
      toast.push({ type: 'success', title: t('success'), message: t('admin_login_success') });
      navigate('/admin/dashboard');
    } catch (err) {
      toast.push({ type: 'error', title: t('failed'), message: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <div className="text-teal-500 font-semibold">{APP_NAME}</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{t('admin_login')}</div>
            <div className="text-sm text-gray-500 dark:text-white/70">{t('admin_login_subtitle')}</div>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm glass-ring bg-white/55 hover:bg-white/70 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
            onClick={() => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id')}
            type="button"
          >
            {i18n.language.toUpperCase()}
          </button>
        </div>

        <Card>
          <form className="space-y-4" onSubmit={submit}>
            <FormField
              label={t('username')}
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <FormField
              label={t('password')}
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button className="w-full" loading={loading}>{t('login')}</Button>
            <div className="text-sm text-gray-600 dark:text-white/70">
              {t('back_user_login')}{' '}
              <Link className="text-teal-500 hover:underline" to="/login">{t('login')}</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;

