import express from 'express';
import db from '../database/db';

const router = express.Router();

// Get settings for a company
router.get('/:companyId', (req, res) => {
  const { companyId } = req.params;
  try {
    const settings = db.prepare('SELECT * FROM attendance_alert_settings WHERE company_id = ?').get(companyId);
    res.json(settings || {
      company_id: companyId,
      office_time: '09:00 AM',
      grace_time: '09:15 AM',
      trigger_time: '09:16 AM',
      message_template: 'Dear {{employee_name}}, you have not marked your attendance. Please mark it immediately.',
      is_active: 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
router.post('/', (req, res) => {
  const { company_id, office_time, grace_time, trigger_time, message_template, is_active } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO attendance_alert_settings (company_id, office_time, grace_time, trigger_time, message_template, is_active, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(company_id) DO UPDATE SET
        office_time = excluded.office_time,
        grace_time = excluded.grace_time,
        trigger_time = excluded.trigger_time,
        message_template = excluded.message_template,
        is_active = excluded.is_active,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(company_id, office_time, grace_time, trigger_time, message_template, is_active ? 1 : 0);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
