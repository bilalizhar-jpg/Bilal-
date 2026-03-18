import express from 'express';
import { db } from '../database/firebaseAdmin';

const router = express.Router();

// Get settings for a company
router.get('/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const snapshot = await db.collection('attendance_alert_settings')
      .where('companyId', '==', companyId)
      .get();
    
    if (snapshot.empty) {
      res.json({
        companyId,
        officeTime: '09:00 AM',
        graceTime: '09:15 AM',
        triggerTime: '09:16 AM',
        messageTemplate: 'Dear {{employee_name}}, you have not marked your attendance. Please mark it immediately.',
        isActive: false
      });
    } else {
      res.json({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
router.post('/', async (req, res) => {
  const { companyId, officeTime, graceTime, triggerTime, messageTemplate, isActive } = req.body;
  try {
    const snapshot = await db.collection('attendance_alert_settings')
      .where('companyId', '==', companyId)
      .get();
    
    if (snapshot.empty) {
      await db.collection('attendance_alert_settings').add({
        companyId,
        officeTime,
        graceTime,
        triggerTime,
        messageTemplate,
        isActive,
        updatedAt: new Date().toISOString()
      });
    } else {
      await snapshot.docs[0].ref.update({
        officeTime,
        graceTime,
        triggerTime,
        messageTemplate,
        isActive,
        updatedAt: new Date().toISOString()
      });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
