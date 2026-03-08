import { APP_DARK_BG, APP_NAME } from '../utils/appConfig';
import Button from './Button';

const PageShell = ({ title, subtitle, actions, children }) => (
  <div className="min-h-screen bg-white dark:bg-[#1E1E2F]" style={{ backgroundColor: undefined }}>
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-white/60">{APP_NAME}</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">{title}</div>
          {subtitle && <div className="text-sm text-gray-500 dark:text-white/70 mt-1">{subtitle}</div>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  </div>
);

export const QuickAction = ({ label, onClick }) => (
  <Button variant="secondary" size="sm" onClick={onClick}>
    {label}
  </Button>
);

export default PageShell;

