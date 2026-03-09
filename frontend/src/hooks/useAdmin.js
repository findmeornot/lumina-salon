import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useAdminDashboard = () => useQuery({
  queryKey: ['admin', 'dashboard'],
  queryFn: async () => (await api.get('/admin/dashboard')).data
});

export const useAdminBookings = () => useQuery({
  queryKey: ['admin', 'bookings'],
  queryFn: async () => (await api.get('/admin/bookings')).data
});

export const useAdminUsers = () => useQuery({
  queryKey: ['admin', 'users'],
  queryFn: async () => (await api.get('/admin/users')).data
});

export const useAnalytics = () => useQuery({
  queryKey: ['admin', 'analytics'],
  queryFn: async () => (await api.get('/admin/analytics')).data
});

export const useAdminCheckinLogs = () => useQuery({
  queryKey: ['admin', 'checkins'],
  queryFn: async () => (await api.get('/admin/logs/checkins')).data
});
