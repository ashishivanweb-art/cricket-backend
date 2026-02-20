import express from 'express';
import cors from 'cors';

import cricketRoutes from './routes/cricket.routes.js';
import adminRoutes from './routes/admin.routes.js';
import adminAuthRoutes from './routes/adminAuth.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/cricket', cricketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAuthRoutes );
app.use('/api/test', (await import('./routes/test.js')).default);



app.get('/', (req, res) => {
  res.send('Cricket API Backend Running');
});

export default app;

