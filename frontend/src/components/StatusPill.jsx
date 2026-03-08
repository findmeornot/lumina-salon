const map = {
  Pending: 'bg-yellow-300 text-gray-900',
  Approved: 'bg-green-400 text-gray-900',
  Rejected: 'bg-red-400 text-gray-900',
  Cancelled: 'bg-gray-400 text-gray-900',
  Completed: 'bg-blue-400 text-gray-900',
  'Checked-In': 'bg-orange-400 text-gray-900'
};

const StatusPill = ({ status }) => (
  <span className={['inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', map[status] || 'bg-gray-200 text-gray-900'].join(' ')}>
    {status}
  </span>
);

export default StatusPill;

