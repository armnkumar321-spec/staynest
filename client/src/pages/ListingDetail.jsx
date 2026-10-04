import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import BookingBox from '../components/BookingBox.jsx';
import Reviews from '../components/Reviews.jsx';
import ListingMap from '../components/ListingMap.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get(`/listings/${id}`)
      .then(({ data }) => setListing(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!listing) return <Loader />;

  return (
    <section>
      <h1>{listing.title}</h1>
      <p className="muted">
        {listing.reviewCount > 0 ? `★ ${listing.avgRating} · ${listing.reviewCount} reviews · ` : ''}
        {listing.city}, {listing.state}
      </p>

      {/* TODO: image gallery / carousel when a listing has multiple images */}
      <img className="hero-img" src={listing.images[0]} alt={listing.title} />

      <div className="detail-layout">
        <div>
          <h2>
            {listing.type} hosted by {listing.host?.name}
          </h2>
          <p className="muted">
            Up to {listing.maxGuests} guests · {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
          </p>
          <p>{listing.description}</p>

          <h3>Amenities</h3>
          <ul className="amenities">
            {listing.amenities.map((a) => <li key={a}>✓ {a}</li>)}
          </ul>

          <h3>Location</h3>
          <p className="muted">{listing.address}, {listing.city}</p>
          <ListingMap location={listing.location} title={listing.title} />

          <Reviews listingId={listing._id} onReviewAdded={load} />
        </div>
        <BookingBox listing={listing} />
      </div>
    </section>
  );
}
