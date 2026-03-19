import cron from 'node-cron';
import { db } from '../database/firebaseAdmin';
import { WhatsAppService } from './whatsappService';

export class IdleAlertService {
  static init() {
    console.log('[IdleAlert] Initializing cron job...');
    // Run every minute
    cron.schedule('* * * * *', () => {
      this.checkAndSendIdleAlerts().catch(err => {
        console.error('[IdleAlert] Unhandled error in cron job:', err);
      });
    });
  }

  private static async checkAndSendIdleAlerts() {
    try {
      // 1. Get all active idle alert settings
      const snapshot = await db.collection('idle_alert_settings').where('isActive', '==', true).get();
      const activeSettings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      for (const setting of activeSettings) {
        await this.processCompanyIdleAlerts(setting);
      }
    } catch (error: any) {
      if (error.message?.includes('PERMISSION_DENIED')) {
        // Silent failure for permission issues to avoid log spam when DB is not provisioned
        return;
      }
      console.error('[IdleAlert] Error in cron job:', error);
    }
  }

  private static async processCompanyIdleAlerts(setting: any) {
    const { companyId, idleMinutes, messageTemplate } = setting;
    const today = new Date().toISOString().split('T')[0];
    const now = Date.now();

    try {
      // 1. Get all active employees for this company
      const employeesSnapshot = await db.collection('employees')
        .where('companyId', '==', companyId)
        .where('status', '==', 'Active')
        .get();
      const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      // 2. Get today's tracking data for these employees
      const trackingSnapshot = await db.collection('timeTracking')
        .where('companyId', '==', companyId)
        .where('date', '==', today)
        .get();
      const trackingRecords = trackingSnapshot.docs.map(doc => doc.data() as any);

      for (const emp of employees) {
        const tracking = trackingRecords.find(r => r.employeeId === emp.id);
        
        if (!tracking || tracking.status === 'Offline' || tracking.status === 'On Break') {
          // If offline or on break, they are not "idle" in the sense of being inactive while working
          // Reset their alert log if it exists
          const logsSnapshot = await db.collection('idle_alert_logs').where('employeeId', '==', emp.id).get();
          for (const doc of logsSnapshot.docs) {
            await doc.ref.delete();
          }
          continue;
        }

        const lastActive = tracking.lastActive || 0;
        const idleDurationMs = now - lastActive;
        const idleThresholdMs = idleMinutes * 60 * 1000;

        if (idleDurationMs >= idleThresholdMs) {
          // Employee is idle beyond threshold
          
          // Check if already alerted for this idle session
          const logSnapshot = await db.collection('idle_alert_logs').where('employeeId', '==', emp.id).get();
          
          if (!logSnapshot.empty) {
            // Already alerted for this session
            continue;
          }

          // Send alert
          const message = messageTemplate
            .replace('{{employee_name}}', emp.name)
            .replace('{{idle_minutes}}', Math.floor(idleDurationMs / 60000).toString());
          
          const phone = this.formatPhoneNumber(emp.mobile);

          if (phone) {
            console.log(`[IdleAlert] Sending idle alert to ${emp.name} (${phone}) - Idle for ${Math.floor(idleDurationMs / 60000)} mins`);
            await WhatsAppService.sendMessage(companyId, phone, message);
            
            // Log it to prevent duplicate alerts for this session
            await db.collection('idle_alert_logs').add({
              companyId,
              employeeId: emp.id,
              idleSessionStart: new Date(lastActive).toISOString(),
              createdAt: new Date().toISOString()
            });
          }
        } else {
          // Employee is active (idle duration < threshold)
          // Reset alert log so they can be alerted again if they go idle later
          const logsSnapshot = await db.collection('idle_alert_logs').where('employeeId', '==', emp.id).get();
          for (const doc of logsSnapshot.docs) {
            await doc.ref.delete();
          }
        }
      }
    } catch (error) {
      console.error(`[IdleAlert] Error processing company ${companyId}:`, error);
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
