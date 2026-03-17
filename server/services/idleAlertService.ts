import cron from 'node-cron';
import db from '../database/db';
import { WhatsAppService } from './whatsappService';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase for backend use
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export class IdleAlertService {
  static init() {
    console.log('[IdleAlert] Initializing cron job...');
    // Run every minute
    cron.schedule('* * * * *', () => {
      this.checkAndSendIdleAlerts();
    });
  }

  private static async checkAndSendIdleAlerts() {
    try {
      // 1. Get all active idle alert settings
      const activeSettings = db.prepare('SELECT * FROM idle_alert_settings WHERE is_active = 1').all() as any[];

      for (const setting of activeSettings) {
        await this.processCompanyIdleAlerts(setting);
      }
    } catch (error) {
      console.error('[IdleAlert] Error in cron job:', error);
    }
  }

  private static async processCompanyIdleAlerts(setting: any) {
    const { company_id, idle_minutes, message_template } = setting;
    const today = new Date().toISOString().split('T')[0];
    const now = Date.now();

    try {
      // 1. Get all active employees for this company
      const employeesQuery = query(
        collection(firestore, 'employees'),
        where('companyId', '==', company_id),
        where('status', '==', 'Active')
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      // 2. Get today's tracking data for these employees
      const trackingQuery = query(
        collection(firestore, 'timeTracking'),
        where('companyId', '==', company_id),
        where('date', '==', today)
      );
      const trackingSnapshot = await getDocs(trackingQuery);
      const trackingRecords = trackingSnapshot.docs.map(doc => doc.data() as any);

      for (const emp of employees) {
        const tracking = trackingRecords.find(r => r.employeeId === emp.id);
        
        if (!tracking || tracking.status === 'Offline' || tracking.status === 'On Break') {
          // If offline or on break, they are not "idle" in the sense of being inactive while working
          // Reset their alert log if it exists
          db.prepare('DELETE FROM idle_alert_logs WHERE employee_id = ?').run(emp.id);
          continue;
        }

        const lastActive = tracking.lastActive || 0;
        const idleDurationMs = now - lastActive;
        const idleThresholdMs = idle_minutes * 60 * 1000;

        if (idleDurationMs >= idleThresholdMs) {
          // Employee is idle beyond threshold
          
          // Check if already alerted for this idle session
          // We use idle_session_start to track when they first went idle
          const log = db.prepare('SELECT * FROM idle_alert_logs WHERE employee_id = ?').get(emp.id) as any;
          
          if (log) {
            // Already alerted for this session
            continue;
          }

          // Send alert
          const message = message_template
            .replace('{{employee_name}}', emp.name)
            .replace('{{idle_minutes}}', Math.floor(idleDurationMs / 60000).toString());
          
          const phone = this.formatPhoneNumber(emp.mobile);

          if (phone) {
            console.log(`[IdleAlert] Sending idle alert to ${emp.name} (${phone}) - Idle for ${Math.floor(idleDurationMs / 60000)} mins`);
            await WhatsAppService.sendMessage(company_id, phone, message);
            
            // Log it to prevent duplicate alerts for this session
            db.prepare('INSERT INTO idle_alert_logs (company_id, employee_id, idle_session_start) VALUES (?, ?, ?)')
              .run(company_id, emp.id, new Date(lastActive).toISOString());
          }
        } else {
          // Employee is active (idle duration < threshold)
          // Reset alert log so they can be alerted again if they go idle later
          db.prepare('DELETE FROM idle_alert_logs WHERE employee_id = ?').run(emp.id);
        }
      }
    } catch (error) {
      console.error(`[IdleAlert] Error processing company ${company_id}:`, error);
    }
  }

  private static formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '92' + clean.substring(1);
    } else if (!clean.startsWith('92') && clean.length === 10) {
      clean = '92' + clean;
    }
    return clean;
  }
}
