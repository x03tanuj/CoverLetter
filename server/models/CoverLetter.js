import mongoose from 'mongoose';

const coverLetterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  jobDescriptionText: {
    type: String,
    required: true
  },
  resumeIdUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  achievements: {
    type: String,
    default: ''
  },
  tone: {
    type: String,
    default: 'professional'
  },
  length: {
    type: String,
    default: 'standard'
  },
  generatedText: {
    type: String,
    required: true
  },
  editedText: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'final'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CoverLetter = mongoose.model('CoverLetter', coverLetterSchema);
export default CoverLetter;
