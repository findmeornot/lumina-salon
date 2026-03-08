import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  id: {
    translation: {
      login: 'Masuk',
      login_subtitle: 'Masuk ke akun Anda',
      register: 'Daftar',
      register_title: 'Daftar Akun Baru',
      register_subtitle: 'Buat akun untuk booking skincare room',
      register_success_title: 'Berhasil',
      register_success_msg: 'Akun berhasil dibuat.',
      register_failed_title: 'Gagal daftar',
      dashboard: 'Dashboard',
      bookingCalendar: 'Kalender Booking',
      profile: 'Profil',
      logout: 'Keluar',
      email: 'Email',
      password: 'Password',
      confirm_password: 'Konfirmasi Password',
      password_hint: 'Minimal 8 karakter',
      show_password: 'Lihat',
      hide_password: 'Sembunyi',
      password_mismatch: 'Password dan konfirmasi tidak sama',
      full_name: 'Nama Lengkap',
      tahun_angkatan: 'Tahun Angkatan',
      tahun_angkatan_hint: 'Dipakai untuk administrasi',
      age: 'Usia',
      phone_number: 'Nomor WhatsApp',
      phone_hint: 'Format contoh: 62812xxxxxxx',
      nim_optional: 'NIM (opsional)',
      profile_photo_optional: 'Foto profil (opsional)',
      no_account: 'Belum punya akun?',
      have_account: 'Sudah punya akun?'
      ,
      forgot_password: 'Lupa password?',
      forgot_password_title: 'Reset Password',
      forgot_password_subtitle: 'Masukkan email untuk menerima link reset password',
      send_reset_link: 'Kirim link reset',
      reset_password_title: 'Buat Password Baru',
      reset_password_subtitle: 'Masukkan password baru Anda',
      reset_password_success: 'Password berhasil diubah. Silakan login.',
      reset_password_failed: 'Gagal reset password',
      admin_login: 'Login Admin',
      admin_login_subtitle: 'Masuk ke dashboard admin',
      admin_login_success: 'Berhasil masuk sebagai admin.',
      username: 'Username',
      success: 'Berhasil',
      failed: 'Gagal',
      back_user_login: 'Kembali ke login user?'
    }
  },
  en: {
    translation: {
      login: 'Login',
      login_subtitle: 'Login to your account',
      register: 'Register',
      register_title: 'Register New Account',
      register_subtitle: 'Create an account to book the room',
      register_success_title: 'Success',
      register_success_msg: 'Account created successfully.',
      register_failed_title: 'Registration failed',
      dashboard: 'Dashboard',
      bookingCalendar: 'Booking Calendar',
      profile: 'Profile',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirm_password: 'Confirm password',
      password_hint: 'Minimum 8 characters',
      show_password: 'Show',
      hide_password: 'Hide',
      password_mismatch: 'Password and confirmation do not match',
      full_name: 'Full name',
      tahun_angkatan: 'Cohort year',
      tahun_angkatan_hint: 'Used for administration',
      age: 'Age',
      phone_number: 'WhatsApp number',
      phone_hint: 'Example: 62812xxxxxxx',
      nim_optional: 'Student ID (optional)',
      profile_photo_optional: 'Profile photo (optional)',
      no_account: "Don't have an account?",
      have_account: 'Already have an account?'
      ,
      forgot_password: 'Forgot password?',
      forgot_password_title: 'Reset Password',
      forgot_password_subtitle: 'Enter your email to receive a reset link',
      send_reset_link: 'Send reset link',
      reset_password_title: 'Set New Password',
      reset_password_subtitle: 'Enter your new password',
      reset_password_success: 'Password updated. Please login.',
      reset_password_failed: 'Password reset failed',
      admin_login: 'Admin Login',
      admin_login_subtitle: 'Sign in to the admin dashboard',
      admin_login_success: 'Signed in as admin.',
      username: 'Username',
      success: 'Success',
      failed: 'Failed',
      back_user_login: 'Back to user login?'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'id',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
