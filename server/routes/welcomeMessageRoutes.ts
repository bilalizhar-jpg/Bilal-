import express from 'express';
import { db } from '../database/firebaseAdmin';
import { WelcomeMessageService } from '../services/welcomeMessageService';

const router = express.Router();

// Get welcome message settings for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const snapshot = await db.collection('employee_welcome_settings')
      .where('companyId', '==', companyId)
      .get();
    
    if (snapshot.empty) {
      return res.json({
        companyId,
        isActive: false,
        messageTemplate: "Dear {{employee_name}},\n\nWelcome to our company! 🎉\nWe’re excited to have you join our winning team.\n\nYour login details are:\nUsername: {{username}}\nPassword: {{password}}\n\nPlease log in and update your password.\n\nLet’s achieve great things together!"
      });
    }
    
    res.json({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
  } catch (error) {
    console.error('Error fetching welcome settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update welcome message settings
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { isActive, messageTemplate } = req.body;

    console.log(`[WelcomeMessage API] Updating settings for company: ${companyId}`);
    console.log(`[WelcomeMessage API] Payload:`, { isActive, messageTemplate });

    const snapshot = await db.collection('employee_welcome_settings')
      .where('companyId', '==', companyId)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        isActive,
        messageTemplate,
        updatedAt: new Date().toISOString()
      });
      console.log(`[WelcomeMessage API] Updated existing settings.`);
    } else {
      await db.collection('employee_welcome_settings').add({
        companyId,
        isActive,
        messageTemplate,
        updatedAt: new Date().toISOString()
      });
      console.log(`[WelcomeMessage API] Inserted new settings.`);
    }

    const updatedSnapshot = await db.collection('employee_welcome_settings')
      .where('companyId', '==', companyId)
      .get();
    const updated = { id: updatedSnapshot.docs[0].id, ...updatedSnapshot.docs[0].data() };
    console.log(`[WelcomeMessage API] Final state in DB:`, updated);

    res.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('[WelcomeMessage API] Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger welcome message for a new employee
router.post('/:companyId/trigger', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { employee } = req.body;
    
    if (!employee) {
      return res.status(400).json({ error: 'Employee data is required' });
    }

    await WelcomeMessageService.sendWelcomeMessage(companyId, employee);
    res.json({ success: true });
  } catch (error) {
    console.error('Error triggering welcome message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
