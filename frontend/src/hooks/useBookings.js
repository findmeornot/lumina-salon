import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useOwnBookings = () => useQuery({
  queryKey: ['bookings', 'mine'],
  queryFn: async () => (await api.get('/bookings/mine')).data,
  refetchInterval: 10000
});

export const useCalendarBookings = (range) => useQuery({
  queryKey: ['bookings', 'calendar', range?.start || null, range?.end || null],
  queryFn: async () => (await api.get('/bookings/calendar', { params: range || undefined })).data,
  refetchInterval: 10000
});

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/bookings', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings', 'mine'] });
      qc.invalidateQueries({ queryKey: ['bookings', 'calendar'] });
    }
  });
};

export const useUpdateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/bookings/${id}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings', 'mine'] });
      qc.invalidateQueries({ queryKey: ['bookings', 'calendar'] });
    }
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.patch(`/bookings/${id}/cancel`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings', 'mine'] });
      qc.invalidateQueries({ queryKey: ['bookings', 'calendar'] });
    }
  });
};
