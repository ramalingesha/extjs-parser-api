import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import parseRoute from './routes/parseRoute';
import cors, { CorsOptions } from 'cors';

const app = express();

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true); // allow mobile apps, curl
    }

    const allowed = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked: ' + origin));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use('/api', parseRoute);
app.use(errorHandler);

export default app;