import { useState } from 'react';
import api from '../services/api';

const CancelBookingPage = () => {
  const [bookingId, setBookingId] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setMessage('Booking cancelled');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="card">
      <h2 className="font-semibold mb-3">Cancel Booking</h2>
      <form className="flex gap-2" onSubmit={submit}>
        <input className="input" placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} required />
        <button className="btn-secondary">Cancel Booking</button>
      </form>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
};

export default CancelBookingPage;
