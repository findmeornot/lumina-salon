const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helper,
  required,
  inputProps,
  right
}) => (
  <div className="space-y-1">
    <div className="relative">
      <input
        className={[
          'peer w-full rounded-md border px-3 pb-2 pt-5 text-sm text-gray-900 dark:text-white',
          'bg-white/55 dark:bg-white/[0.08] backdrop-blur-xl',
          'border-white/40 dark:border-white/10',
          'outline-none transition glass-ring',
          'focus:border-teal-400/70',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-500/60' : '',
          right ? 'pr-10' : ''
        ].join(' ')}
        placeholder=" "
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        {...inputProps}
      />
      <label
        className={[
          'pointer-events-none absolute left-3 top-4 origin-[0] text-sm text-gray-500 transition',
          'peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100',
          'peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-teal-600',
          'peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-90',
          'dark:text-white/60 peer-focus:dark:text-teal-300'
        ].join(' ')}
      >
        {label}
      </label>
      {right && <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
    {error && <div className="text-xs text-red-600 dark:text-red-300">{error}</div>}
    {!error && helper && <div className="text-xs text-gray-500 dark:text-white/60">{helper}</div>}
  </div>
);

export default FormField;
