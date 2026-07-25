import Resume from '../models/Resume.js';
import { extractTextFromBuffer } from '../services/resumeParser.js';

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Received req.file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer ? req.file.buffer.length : 0,
      isBuffer: Buffer.isBuffer(req.file.buffer)
    });

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
