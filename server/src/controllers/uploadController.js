import { uploadToCloudinary } from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please select an image file to upload');
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  const isCloudinaryConfigured =
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    !CLOUDINARY_CLOUD_NAME.includes('YOUR_') &&
    !CLOUDINARY_API_KEY.includes('YOUR_') &&
    !CLOUDINARY_CLOUD_NAME.includes('your_') &&
    !CLOUDINARY_API_KEY.includes('your_');

  if (isCloudinaryConfigured) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, 'staynest_listings');
      return res.status(200).json({ url: result.secure_url });
    } catch (error) {
      console.warn('Cloudinary upload attempt failed, using fallback:', error.message);
    }
  }

  // Fallback for local development when Cloudinary credentials are not configured
  const mimeType = req.file.mimetype || 'image/jpeg';
  const base64Data = req.file.buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  return res.status(200).json({ url: dataUrl });
});

