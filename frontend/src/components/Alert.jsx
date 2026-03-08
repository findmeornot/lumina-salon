const styles = {
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200',
  info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
};

const Alert = ({ variant = 'info', title, children }) => (
  <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[variant] || styles.info}`}>
    {title && <div className="font-semibold mb-1">{title}</div>}
    <div className="leading-relaxed">{children}</div>
  </div>
);

export default Alert;

