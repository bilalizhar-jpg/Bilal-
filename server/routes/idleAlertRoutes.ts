import express from 'express';
import db from '../database/db';

const router = express.Router();

// Get idle alert settings for a company
router.get('/:companyId', (req, res) => {
  const { companyId } = req.params;
  try {
    const settings = db.prepare('SELECT * FROM idle_alert_settings WHERE company_id = ?').get(companyId);
    res.json(settings || {
      company_id: companyId,
      idle_minutes: 5,
      message_template: 'Dear {{employee_name}}, you have been inactive for {{idle_minutes}} minutes. Please resume your tasks.',
      is_active: 0
    });
  } catch (error) {
    console.error('Error fetching idle alert settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update idle alert settings
router.post('/:companyId', (req, res) => {
  const { companyId } = req.params;
  const { idle_minutes, message_template, is_active } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM idle_alert_settings WHERE company_id = ?').get(companyId);

    if (existing) {
      db.prepare(`
        UPDATE idle_alert_settings 
        SET idle_minutes = ?, message_template = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE company_id = ?
      `).run(idle_minutes, message_template, is_active ? 1 : 0, companyId);
    } else {
      db.prepare(`
        INSERT INTO idle_alert_settings (company_id, idle_minutes, message_template, is_active)
        VALUES (?, ?, ?, ?)
      `).run(companyId, idle_minutes, message_template, is_active ? 1 : 0);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving idle alert settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

export default router;
