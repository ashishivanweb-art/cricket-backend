import express from 'express';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/protected', adminAuth, (req, res) => {
  res.json({
    message: 'You are allowed',
    admin: req.admin.name
  });
});

export default router;
