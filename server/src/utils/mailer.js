import nodemailer from 'nodemailer';
import {
  newBookingHostTemplate,
  bookingConfirmedGuestTemplate,
  bookingDeclinedGuestTemplate,
  formatDate,
} from '../templates/index.js';

let transporter = null;

export const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transport = getTransporter();
    if (!transport) {
      console.warn(`[Mailer] Missing SMTP configuration. Email to "${to}" was skipped.`);
      return null;
    }

    const from = process.env.EMAIL_FROM || 'StayNest <noreply@staynest.com>';
    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });

    console.log(`[Mailer] Email sent successfully to "${to}". Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Mailer Error] Failed to send email to "${to}":`, error.message);
    return null;
  }
};

export const sendNewBookingHostEmail = async ({
  hostEmail,
  guestName,
  guestEmail,
  listingTitle,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  status,
}) => {
  const html = newBookingHostTemplate({
    listingTitle,
    guestName,
    guestEmail,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    status,
  });

  return sendEmail({
    to: hostEmail,
    subject: `New Booking Request: ${listingTitle}`,
    html,
    text: `New booking request for ${listingTitle} by ${guestName} (${guestEmail}) from ${formatDate(checkIn)} to ${formatDate(checkOut)}. Total: $${totalPrice}. Status: ${status}.`,
  });
};

export const sendBookingConfirmedGuestEmail = async ({
  guestEmail,
  listingTitle,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  status,
}) => {
  const html = bookingConfirmedGuestTemplate({
    listingTitle,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    status,
  });

  return sendEmail({
    to: guestEmail,
    subject: `Booking Confirmed: ${listingTitle}`,
    html,
    text: `Your booking for ${listingTitle} from ${formatDate(checkIn)} to ${formatDate(checkOut)} has been confirmed! Total: $${totalPrice}.`,
  });
};

export const sendBookingDeclinedGuestEmail = async ({
  guestEmail,
  listingTitle,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  status,
}) => {
  const html = bookingDeclinedGuestTemplate({
    listingTitle,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    status,
  });

  return sendEmail({
    to: guestEmail,
    subject: `Booking Status Update: ${listingTitle}`,
    html,
    text: `Your booking for ${listingTitle} from ${formatDate(checkIn)} to ${formatDate(checkOut)} has been ${status}. Total: $${totalPrice}.`,
  });
};
