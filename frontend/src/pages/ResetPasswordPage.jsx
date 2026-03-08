import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { APP_NAME } from '../utils/appConfig';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField from '../components/FormField';
import { useToast } from '../components/Toast';
import { EyeIcon, EyeOffIcon } from '../components/icons/EyeIcons';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);

  const [password, setPassword] = useState('');
  const [confirm_password, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const mismatch = confirm_password && password !== confirm_password;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.push({ type: 'error', title: t('reset_password_failed'), message: 'Missing token' });
      return;
    }
    if (password !== confirm_password) {
      toast.push({ type: 'error', title: t('reset_password_failed'), message: t('password_mismatch') });
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/reset-password', { token, password, confirm_password });
      toast.push({ type: 'success', title: t('success'), message: t('reset_password_success') });
      navigate('/login');
    } catch (err) {
      toast.push({ type: 'error', title: t('reset_password_failed'), message: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="mb-4">
          <div className="inline-flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl glass-soft flex items-center justify-center">
              <div className="h-3.5 w-3.5 rounded-md bg-teal-500 shadow-[0_0_24px_rgba(20,184,166,0.55)]" />
            </div>
            <div>
              <div className="text-teal-500 font-semibold leading-none">{APP_NAME}</div>
              <div className="text-xs text-gray-500 dark:text-white/60">{t('reset_password_title')}</div>
            </div>
          </div>
          <div className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">{t('reset_password_title')}</div>
          <div className="text-sm text-gray-500 dark:text-white/70">{t('reset_password_subtitle')}</div>
        </div>
        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <FormField
              label={t('password')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helper={t('password_hint')}
              right={
                <button
                  type="button"
                  className="text-gray-500 hover:text-teal-600 dark:text-white/60 dark:hover:text-teal-300 transition"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
            <FormField
              label={t('confirm_password')}
              name="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              value={confirm_password}
              onChange={(e) => setConfirm(e.target.value)}
              required
              error={mismatch ? t('password_mismatch') : ''}
              right={
                <button
                  type="button"
                  className="text-gray-500 hover:text-teal-600 dark:text-white/60 dark:hover:text-teal-300 transition"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
            <Button className="w-full" loading={loading} disabled={!token || mismatch}>{t('reset_password_title')}</Button>
            <div className="text-sm text-gray-600 dark:text-white/70">
              <Link className="text-teal-500 hover:underline" to="/login">{t('login')}</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
