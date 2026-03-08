import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { APP_NAME } from '../utils/appConfig';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField from '../components/FormField';
import { useToast } from '../components/Toast';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      toast.push({ type: 'success', title: t('success'), message: t('send_reset_link') });
    } catch (err) {
      toast.push({ type: 'error', title: t('failed'), message: err.response?.data?.message || err.message });
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
              <div className="h-3.5 w-3.5 rounded-md bg-orange-400 shadow-[0_0_24px_rgba(251,146,60,0.55)]" />
            </div>
            <div>
              <div className="text-teal-500 font-semibold leading-none">{APP_NAME}</div>
              <div className="text-xs text-gray-500 dark:text-white/60">{t('forgot_password_title')}</div>
            </div>
          </div>
          <div className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">{t('forgot_password_title')}</div>
          <div className="text-sm text-gray-500 dark:text-white/70">{t('forgot_password_subtitle')}</div>
        </div>
        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <FormField label={t('email')} name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button className="w-full" loading={loading}>{t('send_reset_link')}</Button>
            <div className="text-sm text-gray-600 dark:text-white/70">
              <Link className="text-teal-500 hover:underline" to="/login">{t('login')}</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

