import mongoose from 'mongoose';
import CoverLetter from '../models/CoverLetter.js';
import Resume from '../models/Resume.js';
import { generateCoverLetter } from '../services/llmService.js';

// @desc    Generate new cover letter
// @route   POST /cover-letter/generate
// @access  Private
export const generateCoverLetterController = async (req, res) => {
  try {
    const {
      jobTitle,
      company,
      jobDescriptionText,
      resumeId,
      achievements = '',
      tone = 'professional',
      length = 'standard'
    } = req.body;

    if (!jobTitle || !company || !jobDescriptionText || !resumeId) {
      return res.status(400).json({
        message: 'Please provide jobTitle, company, jobDescriptionText, and resumeId'
      });
    }

    // 23a. Backend Job Description Length Cap
    if (jobDescriptionText.length > 12000) {
      return res.status(400).json({
        message: 'Job description is too long. Please cap your input under 12,000 characters (~2,000 words).'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid resumeId format' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Resume does not belong to you' });
    }

    // 23d. Empty/Low quality rawText check guard
    if (!resume.rawText || resume.rawText.trim().length < 50) {
      return res.status(400).json({
        message: 'The selected resume text is too short or empty. Please upload a clear text resume.'
      });
    }

    const generatedText = await generateCoverLetter({
      jobTitle,
      company,
      jobDescriptionText,
      resumeText: resume.rawText,
      achievements,
      tone,
      length
    });

    const coverLetter = new CoverLetter({
      userId: req.userId,
      jobTitle,
      company,
      jobDescriptionText,
      resumeIdUsed: resume._id,
      achievements,
      tone,
      length,
      generatedText
    });

    const savedCoverLetter = await coverLetter.save();
    res.status(201).json(savedCoverLetter);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate cover letter'
    });
  }
};

// @desc    Get all cover letters for logged-in user
export const getCoverLetters = async (req, res) => {
  try {
    const letters = await CoverLetter.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(letters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single cover letter by ID
export const getCoverLetterById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid cover letter ID format' });
    }

    const letter = await CoverLetter.findById(id);
    if (!letter) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }

    if (letter.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    res.json(letter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cover letter edited text / status
export const updateCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { editedText, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid cover letter ID format' });
    }

    const letter = await CoverLetter.findById(id);
    if (!letter) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }

    if (letter.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    if (editedText !== undefined) letter.editedText = editedText;
    if (status !== undefined) letter.status = status;

    const updatedLetter = await letter.save();
    res.json(updatedLetter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete cover letter
export const deleteCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid cover letter ID format' });
    }

    const letter = await CoverLetter.findById(id);
    if (!letter) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }

    if (letter.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    await letter.deleteOne();
    res.json({ message: 'Cover letter removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
