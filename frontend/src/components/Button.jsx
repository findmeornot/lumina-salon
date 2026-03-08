import Spinner from './Spinner';

const variants = {
  primary: 'bg-teal-500 text-white hover:bg-teal-600',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/[0.15]',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10',
  danger: 'bg-red-500 text-white hover:bg-red-600'
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base'
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => (
  <button
    className={[
      'inline-flex items-center justify-center gap-2 rounded-md font-medium transition',
      'glass-ring',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      variants[variant] || variants.primary,
      sizes[size] || sizes.md,
      className
    ].join(' ')}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <Spinner className="h-4 w-4" />}
    {children}
  </button>
);

export default Button;
