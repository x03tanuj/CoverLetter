import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import coverLetterRoutes from './routes/coverLetterRoutes.js';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/resume', resumeRoutes);
app.use('/cover-letter', coverLetterRoutes);

app.get('/', (req, res) => res.send('API running'));

// 23c. Global Express Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Express Error:', err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
