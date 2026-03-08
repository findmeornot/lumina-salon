import { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import NavItem from '../components/NavItem';

const AppLayout = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const navItems = useMemo(() => {
    if (user?.role === 'admin') {
      // Admin-first navigation (management focused). Booking actions still available for admin users.
      return [
        { to: '/admin/dashboard', label: 'Admin Dashboard' },
        { to: '/admin/bookings', label: 'Booking Management' },
        { to: '/admin/users', label: 'User Management' },
        { to: '/admin/room', label: 'Room QR & Code' },
        { to: '/admin/logs', label: 'Check-in Logs' },
        { to: '/admin/analytics', label: 'Analytics' },
        { to: '/admin/create-admin', label: 'Create Admin' }
      ];
    }

    return [
      { to: '/', label: t('dashboard') },
      { to: '/calendar', label: t('bookingCalendar') },
      { to: '/history', label: 'History' },
      { to: '/profile', label: t('profile') },
      { to: '/scanner', label: 'QR Scanner' }
    ];
  }, [t, user?.role]);

  return (
    <div className="app-bg">
      <header className="sticky top-0 z-30 glass-soft border-b border-white/30 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm glass-ring bg-white/55 hover:bg-white/70 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Open menu">
              Menu
            </button>
            <div className="font-semibold text-lg text-teal-500">Lumina</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm glass-ring bg-white/55 hover:bg-white/70 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]" onClick={() => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id')}>
              {i18n.language.toUpperCase()}
            </button>
            <button className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm glass-ring bg-white/55 hover:bg-white/70 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]" onClick={() => setDark((v) => !v)}>{dark ? 'Light' : 'Dark'}</button>
            <button className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm glass-ring bg-white/55 hover:bg-white/70 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]" onClick={() => { logout(); navigate('/login'); }}>{t('logout')}</button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl p-4 grid md:grid-cols-[240px_1fr] gap-4">
        <aside className="rounded-lg p-4 glass hidden md:block">
          <div className="text-sm text-gray-600 dark:text-white/70 mb-3 truncate">{user?.full_name}</div>
          <nav className="space-y-1">
            {navItems.map((it) => <NavItem key={it.to} to={it.to}>{it.label}</NavItem>)}
          </nav>
        </aside>
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs rounded-none rounded-r-2xl p-4 glass">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Menu</div>
                <button className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm glass-ring bg-white/55 hover:bg-white/70 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]" onClick={() => setMenuOpen(false)}>Close</button>
              </div>
              <div className="text-sm text-gray-600 dark:text-white/70 mb-3 truncate">{user?.full_name}</div>
              <nav className="space-y-1">
                {navItems.map((it) => (
                  <div key={it.to} onClick={() => setMenuOpen(false)}>
                    <NavItem to={it.to}>{it.label}</NavItem>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}
        <section className="space-y-4"><Outlet /></section>
      </main>
    </div>
  );
};

export default AppLayout;
