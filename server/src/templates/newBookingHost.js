export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const newBookingHostTemplate = ({
  listingTitle,
  guestName,
  guestEmail,
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
  <title>New Booking Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f7f7f7; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #ff385c; margin-top: 0; font-size: 24px;">StayNest</h2>
    <h3 style="color: #222222; margin-bottom: 15px;">New Booking Request Received!</h3>
    <p>You have received a new booking request for your listing <strong>${listingTitle}</strong>.</p>
    <div style="background-color: #f9f9f9; padding: 18px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff385c;">
      <h4 style="margin-top: 0; margin-bottom: 12px; color: #444;">Booking Details:</h4>
      <p style="margin: 6px 0;"><strong>Listing Title:</strong> ${listingTitle}</p>
      <p style="margin: 6px 0;"><strong>Guest Name:</strong> ${guestName}</p>
      <p style="margin: 6px 0;"><strong>Guest Email:</strong> ${guestEmail}</p>
      <p style="margin: 6px 0;"><strong>Check-In Date:</strong> ${formattedCheckIn}</p>
      <p style="margin: 6px 0;"><strong>Check-Out Date:</strong> ${formattedCheckOut}</p>
      <p style="margin: 6px 0;"><strong>Number of Guests:</strong> ${guests}</p>
      <p style="margin: 6px 0;"><strong>Total Price:</strong> $${totalPrice}</p>
      <p style="margin: 6px 0;"><strong>Booking Status:</strong> <span style="display: inline-block; padding: 3px 8px; background: #e3f2fd; color: #0d47a1; border-radius: 4px; font-weight: bold;">${status}</span></p>
    </div>
    <p>Please log in to your StayNest host account to review and update this booking.</p>
    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />
    <p style="font-size: 12px; color: #777777; text-align: center;">This is an automated notification email from StayNest.</p>
  </div>
</body>
</html>`;
};
