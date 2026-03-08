import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={[
        'block rounded-xl px-3 py-2 text-sm transition',
        active
          ? 'bg-brand-600 text-white'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
      ].join(' ')}
    >
      {children}
    </Link>
  );
};

export default NavItem;

