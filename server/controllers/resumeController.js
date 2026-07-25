import Resume from '../models/Resume.js';
import { extractTextFromBuffer } from '../services/resumeParser.js';

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const rawText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype);

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({
        message: "Could not read resume content. Please ensure the file contains readable text and is not an image-only PDF."
      });
    }

    const resume = new Resume({
      userId: req.userId,
      rawText: rawText.trim(),
      originalFileName: req.file.originalname
    });

    const savedResume = await resume.save();

    res.status(201).json({
      resumeId: savedResume._id,
      originalFileName: savedResume.originalFileName,
      preview: savedResume.rawText.slice(0, 200)
    });
  } catch (error) {
    console.error('Error in uploadResume:', error);
    res.status(500).json({ message: error.message || 'Failed to parse and upload resume' });
  }
};

export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId })
      .select('_id originalFileName uploadedAt rawText')
      .sort({ uploadedAt: -1 });

    const formatted = resumes.map(r => ({
      _id: r._id,
      originalFileName: r.originalFileName,
      uploadedAt: r.uploadedAt,
      preview: r.rawText ? r.rawText.slice(0, 150) + '...' : ''
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
