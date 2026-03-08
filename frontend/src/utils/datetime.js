export const toYMD = (value) => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes('T')) return s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
};

export const toHM = (value) => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return s.length >= 5 ? s.slice(0, 5) : s;
};

export const toYMDHM = (value, locale = 'id-ID') => {
  if (value === null || value === undefined) return '-';
  const s = String(value);
  if (s.includes('T')) {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) return s.slice(0, 16);
  return s;
};

