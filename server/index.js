import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import coverLetterRoutes from './routes/coverLetterRoutes.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Connect Database
connectDB();

// 4. Security Headers
app.use(helmet());

// 5. Lock CORS down properly
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.VITE_API_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl) or allowed frontend origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true
}));

// 2. Request payload size limits & 3. NoSQL Injection protection
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    mongoSanitize.sanitize(req.body);
  }
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/resume', resumeRoutes);
app.use('/cover-letter', coverLetterRoutes);

app.get('/', (req, res) => res.send('API running'));

// 7. Global Express Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Express Error:', err);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
