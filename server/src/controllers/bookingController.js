import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  sendNewBookingHostEmail,
  sendBookingConfirmedGuestEmail,
  sendBookingDeclinedGuestEmail,
} from '../utils/mailer.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// POST /api/bookings
export const createBooking = asyncHandler(async (req, res) => {
  const { listingId, checkIn, checkOut, guests } = req.body;

  const listing = await Listing.findById(listingId).populate('host', 'name email');
  if (!listing || !listing.isActive) {
    res.status(404);
    throw new Error('Listing not available');
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.round((end - start) / MS_PER_DAY);

  if (Number.isNaN(nights) || nights < 1) {
    res.status(400);
    throw new Error('Check-out must be at least one day after check-in');
  }
  // TODO: reject check-in dates in the past.

  if (guests > listing.maxGuests) {
    res.status(400);
    throw new Error(`This stay allows a maximum of ${listing.maxGuests} guests`);
  }

  const hostId = listing.host?._id || listing.host;
  if (hostId.equals(req.user._id)) {
    res.status(400);
    throw new Error('You cannot book your own listing');
  }

  const existingBooking = await Booking.findOne({
    listing: listing._id,
    status: { $in: ['pending', 'confirmed'] },
    checkIn: { $lt: end },
    checkOut: { $gt: start },
  });

  if (existingBooking) {
    res.status(409);
    throw new Error('This listing is already booked for the requested dates');
  }

  const booking = await Booking.create({
    listing: listing._id,
    guest: req.user._id,
    checkIn: start,
    checkOut: end,
    guests,
    nights,
    totalPrice: nights * listing.pricePerNight,
  });

  const hostEmail = listing.host?.email;
  if (hostEmail) {
    sendNewBookingHostEmail({
      hostEmail,
      guestName: req.user.name,
      guestEmail: req.user.email,
      listingTitle: listing.title,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: booking.status,
    }).catch((emailErr) => {
      console.error('[Mailer Error] New booking host notification failed:', emailErr.message);
    });
  }

  res.status(201).json(booking);
});

// GET /api/bookings/mine (guest trips)
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate('listing', 'title city images pricePerNight')
    .sort({ checkIn: -1 });
  res.json(bookings);
});

// GET /api/bookings/host (bookings on my listings)
export const getHostBookings = asyncHandler(async (req, res) => {
  const myListings = await Listing.find({ host: req.user._id }).select('_id');
  const bookings = await Booking.find({ listing: { $in: myListings.map((l) => l._id) } })
    .populate('listing', 'title city')
    .populate('guest', 'name email')
    .sort({ checkIn: 1 });
  res.json(bookings);
});

// PATCH /api/bookings/:id/cancel (guest)
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const guestId = booking.guest?._id || booking.guest;
  if (!guestId.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not your booking');
  }
  if (['cancelled', 'completed'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Booking is already ${booking.status}`);
  }

  booking.status = 'cancelled';
  await booking.save();
  res.json(booking);
});

// PATCH /api/bookings/:id/status (host of the listing)
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id)
    .populate('listing', 'title host')
    .populate('guest', 'name email');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const hostId = booking.listing?.host?._id || booking.listing?.host;
  if (!hostId || !hostId.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not a booking on your listing');
  }
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const previousStatus = booking.status;
  booking.status = status;
  await booking.save();

  if (previousStatus !== status) {
    if (status === 'confirmed' && booking.guest?.email) {
      sendBookingConfirmedGuestEmail({
        guestEmail: booking.guest.email,
        listingTitle: booking.listing.title,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        status: booking.status,
      }).catch((emailErr) => {
        console.error('[Mailer Error] Booking confirmation email failed:', emailErr.message);
      });
    } else if (status === 'cancelled' && booking.guest?.email) {
      sendBookingDeclinedGuestEmail({
        guestEmail: booking.guest.email,
        listingTitle: booking.listing.title,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        status: booking.status,
      }).catch((emailErr) => {
        console.error('[Mailer Error] Booking decline email failed:', emailErr.message);
      });
    }
  }

  res.json(booking);
});
