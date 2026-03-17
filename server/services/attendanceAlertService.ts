import cron from 'node-cron';
import db from '../database/db';
import { WhatsAppService } from './whatsappService';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase for backend use
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export class AttendanceAlertService {
  static init() {
    console.log('[AttendanceAlert] Initializing cron job...');
    // Run every minute
    cron.schedule('* * * * *', () => {
      this.checkAndSendAlerts();
    });
  }

  private static async checkAndSendAlerts() {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    }); // e.g. "09:16 AM"

    // Get all active settings
    const activeSettings = db.prepare('SELECT * FROM attendance_alert_settings WHERE is_active = 1').all() as any[];

    for (const setting of activeSettings) {
      if (setting.trigger_time === currentTime) {
        console.log(`[AttendanceAlert] Trigger time reached for company: ${setting.company_id}`);
        await this.processCompanyAlerts(setting);
      }
    }
  }

  private static async processCompanyAlerts(setting: any) {
    const { company_id, grace_time, message_template } = setting;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      // 1. Get all active employees for this company
      const employeesQuery = query(
        collection(firestore, 'employees'),
        where('companyId', '==', company_id),
        where('status', '==', 'Active')
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      // 2. Get today's attendance for this company
      const attendanceQuery = query(
        collection(firestore, 'attendance'),
        where('companyId', '==', company_id),
        where('date', '==', today)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceRecords = attendanceSnapshot.docs.map(doc => doc.data() as any);

      // 3. Identify employees who haven't checked in
      const lateEmployees = employees.filter(emp => {
        const record = attendanceRecords.find(r => r.employeeId === emp.id);
        if (!record) return true; // No record at all
        if (record.currentState === 'not_checked_in') return true;
        
        // If they checked in after grace time, they are late but maybe they already got a message or we don't care if they are already here?
        // The requirement says: "IF an employee has NOT marked attendance before grace_time THEN automatically send a WhatsApp message at trigger_time"
        // If they marked it at 09:10 and grace is 09:15, they are fine.
        // If they marked it at 09:20 and grace is 09:15, they are late, but they ARE checked in now.
        // Usually, if they are already checked in by trigger_time (09:16), we don't send the alert.
        if (record.loginTime) {
          const loginMins = this.parseTimeToMinutes(record.loginTime);
          const graceMins = this.parseTimeToMinutes(grace_time);
          if (loginMins <= graceMins) return false; // Checked in on time
        }
        
        return false; // They are checked in, even if late, maybe don't send? 
        // Re-reading: "IF an employee has NOT marked attendance before grace_time"
        // If it's 09:16 (trigger) and they marked it at 09:10, don't send.
        // If it's 09:16 and they haven't marked it, send.
      });

      for (const emp of lateEmployees) {
        // Check if already sent today
        const alreadySent = db.prepare('SELECT id FROM attendance_alert_logs WHERE employee_id = ? AND date = ?')
          .get(emp.id, today);

        if (alreadySent) continue;

        // Format message
        const message = message_template.replace('{{employee_name}}', emp.name);
        
        // Format phone
        const phone = this.formatPhoneNumber(emp.mobile);

        if (phone) {
          console.log(`[AttendanceAlert] Sending alert to ${emp.name} (${phone})`);
          await WhatsAppService.sendMessage(company_id, phone, message);
          
          // Log it
          db.prepare('INSERT INTO attendance_alert_logs (company_id, employee_id, date, status) VALUES (?, ?, ?, ?)')
            .run(company_id, emp.id, today, 'sent');
        }
      }
    } catch (error) {
      console.error(`[AttendanceAlert] Error processing company ${company_id}:`, error);
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
