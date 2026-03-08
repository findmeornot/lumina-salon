import { useAnalytics } from '../hooks/useAdmin';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';

const AnalyticsDashboardPage = () => {
  const { data } = useAnalytics();

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass"><div className="text-sm text-gray-500 dark:text-white/70">Total bookings</div><div className="text-2xl font-semibold">{data?.total_bookings || 0}</div></Card>
        <Card className="glass"><div className="text-sm text-gray-500 dark:text-white/70">Utilization rate</div><div className="text-2xl font-semibold">{data?.utilization_rate || 0}%</div></Card>
        <Card className="glass"><div className="text-sm text-gray-500 dark:text-white/70">Popular slot</div><div className="text-2xl font-semibold">{data?.popular_slots?.[0]?.slot || '-'}</div></Card>
      </div>
      <Card className="glass h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data?.bookings_per_week || []}>
            <XAxis dataKey="year_week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#059669" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default AnalyticsDashboardPage;
