import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export default async function adminAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).json({ msg: 'No token provided' });

    const decoded = jwt.verify(token, 'SECRETKEY');
    const admin = await Admin.findById(decoded.id);

    if (!admin) return res.status(403).json({ msg: 'Admin not found' });

    const today = new Date();

    const trialActive = today <= admin.trialEnd;
    const planActive = admin.planEnd && today <= admin.planEnd;

    if (!trialActive && !planActive) {
      return res.status(403).json({
        msg: 'Subscription expired. Please purchase a plan.'
      });
    }

    // VERY IMPORTANT
    req.admin = admin;

    next();
  } catch (err) {
    res.status(403).json({ msg: 'Unauthorized' });
  }
}
