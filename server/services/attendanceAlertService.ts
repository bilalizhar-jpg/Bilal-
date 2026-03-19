import cron from 'node-cron';
import { db } from '../database/firebaseAdmin';
import { WhatsAppService } from './whatsappService';
export class AttendanceAlertService {
  static init() {
    console.log('[AttendanceAlert] Initializing cron job...');
    // Run every minute
    cron.schedule('* * * * *', () => {
      this.checkAndSendAlerts().catch(err => {
        console.error('[AttendanceAlert] Unhandled error in cron job:', err);
      });
    });
  }

  private static async checkAndSendAlerts() {
    try {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit' 
      }); // e.g. "09:16 AM"

      // Get all active settings
      const snapshot = await db.collection('attendance_alert_settings').where('isActive', '==', true).get();
      const activeSettings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      for (const setting of activeSettings) {
        if (setting.triggerTime === currentTime) {
          console.log(`[AttendanceAlert] Trigger time reached for company: ${setting.companyId}`);
          await this.processCompanyAlerts(setting);
        }
      }
    } catch (error: any) {
      if (error.message?.includes('PERMISSION_DENIED')) {
        // Silent failure for permission issues to avoid log spam when DB is not provisioned
        return;
      }
      console.error('[AttendanceAlert] Error in cron job:', error);
    }
  }

  private static async processCompanyAlerts(setting: any) {
    const { companyId, graceTime, messageTemplate } = setting;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      // 1. Get all active employees for this company
      const employeesSnapshot = await db.collection('employees')
        .where('companyId', '==', companyId)
        .where('status', '==', 'Active')
        .get();
      const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      // 2. Get today's attendance for this company
      const attendanceSnapshot = await db.collection('attendance')
        .where('companyId', '==', companyId)
        .where('date', '==', today)
        .get();
      const attendanceRecords = attendanceSnapshot.docs.map(doc => doc.data() as any);

      // 3. Identify employees who haven't checked in
      const lateEmployees = employees.filter(emp => {
        const record = attendanceRecords.find(r => r.employeeId === emp.id);
        if (!record) return true; // No record at all
        if (record.currentState === 'not_checked_in') return true;
        
        if (record.loginTime) {
          const loginMins = this.parseTimeToMinutes(record.loginTime);
          const graceMins = this.parseTimeToMinutes(graceTime);
          if (loginMins <= graceMins) return false; // Checked in on time
        }
        
        return false;
      });

      for (const emp of lateEmployees) {
        // Check if already sent today
        const alreadySentSnapshot = await db.collection('attendance_alert_logs')
          .where('employeeId', '==', emp.id)
          .where('date', '==', today)
          .get();

        if (!alreadySentSnapshot.empty) continue;

        // Format message
        const message = messageTemplate.replace('{{employee_name}}', emp.name);
        
        // Format phone
        const phone = this.formatPhoneNumber(emp.mobile);

        if (phone) {
          console.log(`[AttendanceAlert] Sending alert to ${emp.name} (${phone})`);
          await WhatsAppService.sendMessage(companyId, phone, message);
          
          // Log it
          await db.collection('attendance_alert_logs').add({
            companyId,
            employeeId: emp.id,
            date: today,
            status: 'sent',
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error(`[AttendanceAlert] Error processing company ${companyId}:`, error);
    }
  }

  private static parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;
    return hours * 60 + minutes;
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
