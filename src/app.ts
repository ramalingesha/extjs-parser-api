import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import parseRoute from './routes/parseRoute';

const app = express();

app.use(express.json());
app.use('/api', parseRoute);
app.use(errorHandler);

export default app;