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

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
    tahun_angkatan: '',
    age: '',
    phone_number: '',
    nim: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.push({ type: 'error', title: t('register_failed_title'), message: t('password_mismatch') });
      return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v ?? '')));
      if (photoFile) fd.append('profile_photo', photoFile);

      const { data } = await api.post('/auth/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      login(data);
      toast.push({ type: 'success', title: t('register_success_title'), message: t('register_success_msg') });
      navigate('/');
    } catch (err) {
      toast.push({ type: 'error', title: t('register_failed_title'), message: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl">
        <div className="mb-4">
          <div className="inline-flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl glass-soft flex items-center justify-center">
              <div className="h-3.5 w-3.5 rounded-md bg-orange-400 shadow-[0_0_24px_rgba(251,146,60,0.55)]" />
            </div>
            <div>
              <div className="text-teal-500 font-semibold leading-none">{APP_NAME}</div>
              <div className="text-xs text-gray-500 dark:text-white/60">Create your account</div>
            </div>
          </div>
          <div className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">{t('register_title')}</div>
          <div className="text-sm text-gray-500 dark:text-white/70">{t('register_subtitle')}</div>
        </div>
        <Card>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
            <div className="md:col-span-2">
              <FormField label={t('full_name')} name="full_name" value={form.full_name} onChange={onChange} required />
            </div>
            <FormField label={t('tahun_angkatan')} name="tahun_angkatan" value={form.tahun_angkatan} onChange={onChange} required helper={t('tahun_angkatan_hint')} />
            <FormField label={t('age')} name="age" type="number" value={form.age} onChange={onChange} required inputProps={{ min: 16, max: 100 }} />
            <div className="md:col-span-2">
              <FormField label={t('email')} name="email" type="email" value={form.email} onChange={onChange} required />
            </div>
            <div className="md:col-span-2">
              <FormField
                label={t('password')}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
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
            </div>
            <div className="md:col-span-2">
              <FormField
                label={t('confirm_password')}
                name="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirm_password}
                onChange={onChange}
                required
                error={form.confirm_password && form.password !== form.confirm_password ? t('password_mismatch') : ''}
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
            </div>
            <div className="md:col-span-2">
              <FormField label={t('phone_number')} name="phone_number" value={form.phone_number} onChange={onChange} required helper={t('phone_hint')} />
            </div>
            <div className="md:col-span-2">
              <FormField label={t('nim_optional')} name="nim" value={form.nim} onChange={onChange} />
            </div>

            <div className="md:col-span-2">
              <div className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2">{t('profile_photo_optional')}</div>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full overflow-hidden glass-soft">
                  {photoPreview ? <img alt="preview" src={photoPreview} className="h-full w-full object-cover" /> : null}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickPhoto}
                  className="text-sm text-gray-700 dark:text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-teal-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-teal-600"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Button className="w-full" loading={loading}>{t('register')}</Button>
            </div>
            <div className="md:col-span-2 text-sm text-gray-600 dark:text-white/70">
              {t('have_account')}{' '}
              <Link className="text-teal-500 hover:underline" to="/login">{t('login')}</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
