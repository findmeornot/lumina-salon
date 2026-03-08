import { useState } from 'react';
import api from '../services/api';

const EditBookingPage = () => {
  const [form, setForm] = useState({ id: '', booking_date: '', start_time: '', end_time: '' });
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/bookings/${form.id}`, {
        booking_date: form.booking_date,
        start_time: form.start_time,
        end_time: form.end_time
      });
      setMessage('Booking updated');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="card">
      <h2 className="font-semibold mb-3">Edit Booking</h2>
      <form className="grid grid-cols-1 md:grid-cols-4 gap-2" onSubmit={submit}>
        <input className="input" placeholder="Booking ID" value={form.id} onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} required />
        <input className="input" type="date" value={form.booking_date} onChange={(e) => setForm((p) => ({ ...p, booking_date: e.target.value }))} required />
        <input className="input" type="time" step="1800" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} required />
        <input className="input" type="time" step="1800" value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} required />
        <button className="btn-primary md:col-span-4">Update</button>
      </form>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
};

export default EditBookingPage;
