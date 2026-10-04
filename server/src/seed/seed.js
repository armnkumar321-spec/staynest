import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

const listings = [
  { title: 'Haveli Courtyard Homestay', description: 'Stay in a 150-year-old restored haveli in the Pink City, with rooftop breakfast and views of Nahargarh Fort.', type: 'homestay', city: 'Jaipur', state: 'Rajasthan', address: 'Near Hawa Mahal, Old City', pricePerNight: 2800, maxGuests: 4, bedrooms: 2, amenities: ['WiFi', 'Breakfast', 'AC', 'Rooftop'], location: { lat: 26.9239, lng: 75.8267 } },
  { title: 'Lakeview Boutique Hotel', description: 'Elegant rooms overlooking Lake Pichola, a short walk from City Palace.', type: 'hotel', city: 'Udaipur', state: 'Rajasthan', address: 'Lal Ghat, Udaipur', pricePerNight: 4500, maxGuests: 2, bedrooms: 1, amenities: ['WiFi', 'AC', 'Lake view', 'Restaurant'], location: { lat: 24.5797, lng: 73.6835 } },
  { title: 'Desert Camp Cottage', description: 'Mud-walled cottage near the Sam sand dunes with a campfire and folk music evenings.', type: 'cottage', city: 'Jaisalmer', state: 'Rajasthan', address: 'Sam Sand Dunes Road', pricePerNight: 3200, maxGuests: 3, bedrooms: 1, amenities: ['Campfire', 'Meals included', 'Camel safari'], location: { lat: 26.8329, lng: 70.5408 } },
  { title: 'Backpackers Hub Hostel', description: 'Social hostel with dorm beds, a co-working corner and weekly city walks.', type: 'hostel', city: 'Jaipur', state: 'Rajasthan', address: 'C-Scheme, Jaipur', pricePerNight: 650, maxGuests: 1, bedrooms: 0, amenities: ['WiFi', 'Lockers', 'Common kitchen'], location: { lat: 26.9099, lng: 75.8016 } },
  { title: 'Cliffside Villa with Pool', description: 'Private 3-BHK villa with an infinity pool facing the Arabian Sea.', type: 'villa', city: 'Goa', state: 'Goa', address: 'Vagator, North Goa', pricePerNight: 12000, maxGuests: 8, bedrooms: 3, amenities: ['Pool', 'WiFi', 'Kitchen', 'Parking', 'AC'], location: { lat: 15.6030, lng: 73.7336 } },
  { title: 'Himalayan Wooden Cottage', description: 'Cosy pinewood cottage in an apple orchard with mountain views from every window.', type: 'cottage', city: 'Manali', state: 'Himachal Pradesh', address: 'Old Manali', pricePerNight: 2200, maxGuests: 4, bedrooms: 2, amenities: ['Heater', 'WiFi', 'Mountain view', 'Bonfire'], location: { lat: 32.2530, lng: 77.1750 } },
  { title: 'Houseboat on the Backwaters', description: 'Traditional kettuvallam houseboat with a private chef and sunset cruise.', type: 'homestay', city: 'Alleppey', state: 'Kerala', address: 'Punnamada Lake', pricePerNight: 7500, maxGuests: 4, bedrooms: 2, amenities: ['Meals included', 'AC', 'Cruise'], location: { lat: 9.5006, lng: 76.3475 } },
  { title: 'Riverside Ashram Stay', description: 'Simple, peaceful rooms by the Ganga with morning yoga sessions.', type: 'hostel', city: 'Rishikesh', state: 'Uttarakhand', address: 'Tapovan, Rishikesh', pricePerNight: 900, maxGuests: 2, bedrooms: 1, amenities: ['Yoga', 'River view', 'Vegetarian meals'], location: { lat: 30.1265, lng: 78.3228 } },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Listing.deleteMany(), Booking.deleteMany(), Review.deleteMany()]);

  const host = await User.create({ name: 'Ravi Host', email: 'host@staynest.dev', password: 'host123', role: 'host' });
  await User.create({ name: 'Ananya Guest', email: 'guest@staynest.dev', password: 'guest123' });

  await Listing.insertMany(listings.map((l) => ({ ...l, host: host._id })));

  console.log('Seed complete: 2 users, %d listings', listings.length);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
