import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { formatDate, formatINR } from '../utils/format.js';

export default function Trips() {
  const location = useLocation();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [cancellingBooking, setCancellingBooking] = useState(null);

  const load = () =>
    api
      .get('/bookings/mine')
      .then(({ data }) => setBookings(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    try {
      await api.patch(`/bookings/${cancellingBooking._id}/cancel`);
      setCancellingBooking(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
      setCancellingBooking(null);
    }
  };

  if (!bookings && !error) return <Loader />;

  return (
    <section>
      <h1>My Trips</h1>
      {location.state?.booked && <p className="success">Booking request sent to the host!</p>}
      {error && <p className="error">{error}</p>}
      {bookings?.length === 0 && (
        <p className="muted">No trips yet. <Link to="/">Find a stay</Link></p>
      )}
      <div className="trip-list">
        {bookings?.map((b) => (
          <div key={b._id} className="card trip">
            <img src={b.listing?.images?.[0]} alt={b.listing?.title} />
            <div className="grow">
              <Link to={`/stays/${b.listing?._id}`}><strong>{b.listing?.title}</strong></Link>
              <p className="muted">{b.listing?.city}</p>
              <p>
                {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.nights} night{b.nights > 1 ? 's' : ''} · {b.guests} guest{b.guests > 1 ? 's' : ''}
              </p>
            </div>
            <div className="trip-side">
              <span className={`status status-${b.status}`}>{b.status}</span>
              <strong>{formatINR(b.totalPrice)}</strong>
              {['pending', 'confirmed'].includes(b.status) && (
                <button className="btn btn-danger" onClick={() => setCancellingBooking(b)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {cancellingBooking && (
        <div className="modal-overlay" onClick={() => setCancellingBooking(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Cancellation</h2>
            <p>Are you sure you want to cancel this trip?</p>
            <div className="modal-details">
              <p><strong>Stay:</strong> {cancellingBooking.listing?.title}</p>
              <p><strong>Check-in:</strong> {formatDate(cancellingBooking.checkIn)}</p>
              <p><strong>Check-out:</strong> {formatDate(cancellingBooking.checkOut)}</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setCancellingBooking(null)}>
                Keep Booking
              </button>
              <button className="btn btn-danger" onClick={handleConfirmCancel}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
