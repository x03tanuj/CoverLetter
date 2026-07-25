import express from 'express';
import { uploadResume as handleUploadResumeController, getUserResumes } from '../controllers/resumeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', authMiddleware, uploadResume, handleUploadResumeController);
router.get('/', authMiddleware, getUserResumes);

export default router;
