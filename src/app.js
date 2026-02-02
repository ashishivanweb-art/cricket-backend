import express from 'express';
import cors from 'cors';

import cricketRoutes from './routes/cricket.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/cricket', cricketRoutes);

app.get('/', (req, res) => {
  res.send('Cricket API Backend Running');
});

export default app;

