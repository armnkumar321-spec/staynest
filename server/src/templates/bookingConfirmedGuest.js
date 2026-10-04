import { formatDate } from './newBookingHost.js';

export const bookingConfirmedGuestTemplate = ({
  listingTitle,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  status,
}) => {
  const formattedCheckIn = formatDate(checkIn);
  const formattedCheckOut = formatDate(checkOut);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f7f7f7; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #ff385c; margin-top: 0; font-size: 24px;">StayNest</h2>
    <h3 style="color: #2e7d32; margin-bottom: 15px;">Your Booking is Confirmed! 🎉</h3>
    <p>Great news! Your booking for <strong>${listingTitle}</strong> has been confirmed by the host.</p>
    <div style="background-color: #f9f9f9; padding: 18px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2e7d32;">
      <h4 style="margin-top: 0; margin-bottom: 12px; color: #444;">Trip Summary:</h4>
      <p style="margin: 6px 0;"><strong>Listing Title:</strong> ${listingTitle}</p>
      <p style="margin: 6px 0;"><strong>Check-In Date:</strong> ${formattedCheckIn}</p>
      <p style="margin: 6px 0;"><strong>Check-Out Date:</strong> ${formattedCheckOut}</p>
      <p style="margin: 6px 0;"><strong>Guests:</strong> ${guests}</p>
      <p style="margin: 6px 0;"><strong>Total Price:</strong> $${totalPrice}</p>
      <p style="margin: 6px 0;"><strong>Status:</strong> <span style="display: inline-block; padding: 3px 8px; background: #e8f5e9; color: #1b5e20; border-radius: 4px; font-weight: bold;">${status}</span></p>
    </div>
    <p>We wish you a pleasant stay! You can review your trip details anytime in your StayNest account.</p>
    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />
    <p style="font-size: 12px; color: #777777; text-align: center;">This is an automated notification email from StayNest.</p>
  </div>
</body>
</html>`;
};
