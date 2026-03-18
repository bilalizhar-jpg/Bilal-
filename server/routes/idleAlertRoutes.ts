import express from 'express';
import { db } from '../database/firebaseAdmin';

const router = express.Router();

// Get idle alert settings for a company
router.get('/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const snapshot = await db.collection('idle_alert_settings')
      .where('companyId', '==', companyId)
      .get();
    
    if (snapshot.empty) {
      res.json({
        companyId,
        idleMinutes: 5,
        messageTemplate: 'Dear {{employee_name}}, you have been inactive for {{idle_minutes}} minutes. Please resume your tasks.',
        isActive: false
      });
    } else {
      res.json({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    }
  } catch (error) {
    console.error('Error fetching idle alert settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update idle alert settings
router.post('/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const { idleMinutes, messageTemplate, isActive } = req.body;

  try {
    const snapshot = await db.collection('idle_alert_settings')
      .where('companyId', '==', companyId)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        idleMinutes,
        messageTemplate,
        isActive,
        updatedAt: new Date().toISOString()
      });
    } else {
      await db.collection('idle_alert_settings').add({
        companyId,
        idleMinutes,
        messageTemplate,
        isActive,
        updatedAt: new Date().toISOString()
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving idle alert settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

export default router;
