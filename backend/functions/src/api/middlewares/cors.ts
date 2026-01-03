import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:5000', // Firebase hosting emulator
  'https://sadevardiya.web.app',
  'https://sadevardiya.firebaseapp.com'
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
