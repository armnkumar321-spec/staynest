import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { protect, hostOnly } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

router
  .route('/')
  .post(protect, hostOnly, uploadSingleImage, uploadImage)
  .all((req, res) => {
    res.status(405).json({ message: `Method ${req.method} not allowed on /api/uploads. Use POST.` });
  });

export default router;
