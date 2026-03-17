import express from 'express';
import db from '../database/db';
import { WelcomeMessageService } from '../services/welcomeMessageService';

const router = express.Router();

// Get welcome message settings for a company
router.get('/:companyId', (req, res) => {
  try {
    const { companyId } = req.params;
    const settings = db.prepare('SELECT * FROM employee_welcome_settings WHERE company_id = ?').get(companyId);
    
    if (!settings) {
      return res.json({
        company_id: companyId,
        is_active: 0,
        message_template: "Dear {{employee_name}},\n\nWelcome to our company! 🎉\nWe’re excited to have you join our winning team.\n\nYour login details are:\nUsername: {{username}}\nPassword: {{password}}\n\nPlease log in and update your password.\n\nLet’s achieve great things together!"
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching welcome settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update welcome message settings
router.post('/:companyId', (req, res) => {
  try {
    const { companyId } = req.params;
    const { is_active, message_template } = req.body;

    console.log(`[WelcomeMessage API] Updating settings for company: ${companyId}`);
    console.log(`[WelcomeMessage API] Payload:`, { is_active, message_template });

    const existing = db.prepare('SELECT id FROM employee_welcome_settings WHERE company_id = ?').get(companyId);

    let result;
    if (existing) {
      result = db.prepare(`
        UPDATE employee_welcome_settings 
        SET is_active = ?, message_template = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE company_id = ?
      `).run(is_active ? 1 : 0, message_template, companyId);
      console.log(`[WelcomeMessage API] Updated existing settings. Changes: ${result.changes}`);
    } else {
      result = db.prepare(`
        INSERT INTO employee_welcome_settings (company_id, is_active, message_template) 
        VALUES (?, ?, ?)
      `).run(companyId, is_active ? 1 : 0, message_template);
      console.log(`[WelcomeMessage API] Inserted new settings. ID: ${result.lastInsertRowid}`);
    }

    const updated = db.prepare('SELECT * FROM employee_welcome_settings WHERE company_id = ?').get(companyId);
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
