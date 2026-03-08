import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../utils/appConfig';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField from '../components/FormField';
import { useToast } from '../components/Toast';
import { EyeIcon, EyeOffIcon } from '../components/icons/EyeIcons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/');
    } catch (err) {
      toast.push({ type: 'error', title: 'Login failed', message: err.response?.data?.message || err.message });
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
              <div className="text-xs text-gray-500 dark:text-white/60">Skincare room booking</div>
            </div>
          </div>
          <div className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">{t('login')}</div>
          <div className="text-sm text-gray-500 dark:text-white/70">{t('login_subtitle')}</div>
        </div>
        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <FormField label={t('email')} name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <FormField
              label={t('password')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helper={(
                <div className="flex items-center justify-between gap-2">
                  <span>{t('password_hint')}</span>
                  <Link className="text-teal-500 hover:underline whitespace-nowrap" to="/forgot-password">
                    {t('forgot_password')}
                  </Link>
                </div>
              )}
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
            <Button className="w-full" loading={loading}>{t('login')}</Button>
            <div className="text-sm text-gray-600 dark:text-white/70">
              {t('no_account')}{' '}
              <Link className="text-teal-500 hover:underline" to="/register">{t('register')}</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
