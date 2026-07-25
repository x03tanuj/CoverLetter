import mongoose from 'mongoose';
import CoverLetter from '../models/CoverLetter.js';
import Resume from '../models/Resume.js';
import { generateCoverLetter } from '../services/llmService.js';

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
