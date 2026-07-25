import express from 'express';
import {
  generateCoverLetterController,
  getCoverLetters,
  getCoverLetterById,
  updateCoverLetter,
  deleteCoverLetter
} from '../controllers/coverLetterController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', authMiddleware, generateCoverLetterController);
router.get('/', authMiddleware, getCoverLetters);
router.get('/:id', authMiddleware, getCoverLetterById);
router.put('/:id', authMiddleware, updateCoverLetter);
router.delete('/:id', authMiddleware, deleteCoverLetter);

export default router;
