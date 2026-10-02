import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Listing from '../src/models/Listing.js';
import generateToken from '../src/utils/generateToken.js';

let mongoServer;
let hostUser;
let guestUser;
let hostToken;
let guestToken;
let listing;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret';
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  hostUser = await User.create({
    name: 'Host User',
    email: 'host@example.com',
    password: 'password123',
    role: 'host',
  });

  guestUser = await User.create({
    name: 'Guest User',
    email: 'guest@example.com',
    password: 'password123',
    role: 'guest',
  });

  hostToken = generateToken(hostUser._id);
  guestToken = generateToken(guestUser._id);

  listing = await Listing.create({
    title: 'Sunny Beach Villa',
    description: 'Beautiful villa near the beach.',
    type: 'villa',
    city: 'Goa',
    state: 'Goa',
    address: '123 Beach Road',
    pricePerNight: 150,
    maxGuests: 4,
    host: hostUser._id,
  });
});

describe('POST /api/bookings', () => {
  test('Valid booking -> HTTP 201 with correct nights and calculated price', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing._id.toString(),
        checkIn: '2026-11-01',
        checkOut: '2026-11-04',
        guests: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.nights).toBe(3);
    expect(res.body.totalPrice).toBe(450);
    expect(res.body.listing).toBe(listing._id.toString());
    expect(res.body.guest).toBe(guestUser._id.toString());
  });

  test('Check-out before check-in -> HTTP 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing._id.toString(),
        checkIn: '2026-11-04',
        checkOut: '2026-11-01',
        guests: 2,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Check-out must be at least one day after check-in/i);
  });

  test('Too many guests for the listing -> HTTP 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing._id.toString(),
        checkIn: '2026-11-01',
        checkOut: '2026-11-04',
        guests: 5,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/allows a maximum of 4 guests/i);
  });

  test('Host attempting to book their own listing -> HTTP 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        listingId: listing._id.toString(),
        checkIn: '2026-11-01',
        checkOut: '2026-11-04',
        guests: 2,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot book your own listing/i);
  });
});
