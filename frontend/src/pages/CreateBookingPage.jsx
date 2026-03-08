import { useState } from 'react';
import { useCreateBooking } from '../hooks/useBookings';

const CreateBookingPage = () => {
  const [payload, setPayload] = useState({ booking_date: '', start_time: '', end_time: '' });
  const mutation = useCreateBooking();

  const submit = (e) => {
    e.preventDefault();
    mutation.mutate(payload);
  };

  return (
    <div className="card">
      <h2 className="font-semibold mb-3">Create Booking</h2>
      <form className="grid grid-cols-1 md:grid-cols-4 gap-2" onSubmit={submit}>
        <input className="input" type="date" required value={payload.booking_date} onChange={(e) => setPayload((p) => ({ ...p, booking_date: e.target.value }))} />
        <input className="input" type="time" step="1800" required value={payload.start_time} onChange={(e) => setPayload((p) => ({ ...p, start_time: e.target.value }))} />
        <input className="input" type="time" step="1800" required value={payload.end_time} onChange={(e) => setPayload((p) => ({ ...p, end_time: e.target.value }))} />
        <button className="btn-primary">Submit</button>
      </form>
      {mutation.error && <p className="text-red-600 text-sm mt-2">{mutation.error.response?.data?.message || 'Failed'}</p>}
    </div>
  );
};

export default CreateBookingPage;
