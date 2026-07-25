import express from 'express';
import { generateCoverLetterController } from '../controllers/coverLetterController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', authMiddleware, generateCoverLetterController);

export default router;
