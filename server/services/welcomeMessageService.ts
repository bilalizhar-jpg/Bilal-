import { db } from '../database/firebaseAdmin';
import { WhatsAppService } from './whatsappService';

export class WelcomeMessageService {
  static async sendWelcomeMessage(companyId: string, employee: { name: string, username: string, password: string, mobile: string }) {
    try {
      console.log(`[WelcomeMessage] Starting send process for company: ${companyId}, employee: ${employee.name}`);
      
      // 1. Fetch settings
      const snapshot = await db.collection('employee_welcome_settings')
        .where('companyId', '==', companyId)
        .get();
      
      if (snapshot.empty) {
        console.log(`[WelcomeMessage] No settings found for company: ${companyId}`);
        return;
      }

      const settings = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
      
      console.log(`[WelcomeMessage] Settings found:`, settings);

      if (!settings.isActive) {
        console.log(`[WelcomeMessage] Welcome messages are DISABLED for company: ${companyId}`);
        return;
      }

      if (!employee.mobile) {
        console.error(`[WelcomeMessage] Employee ${employee.name} has no mobile number. Cannot send WhatsApp.`);
        return;
      }

      // 2. Parse template
      let message = settings.messageTemplate;
      console.log(`[WelcomeMessage] Original template:`, message);

      message = message.replace(/{{employee_name}}/g, employee.name);
      message = message.replace(/{{username}}/g, employee.username);
      message = message.replace(/{{password}}/g, employee.password);

      console.log(`[WelcomeMessage] Parsed message:`, message);

      // 3. Send via WhatsApp
      console.log(`[WelcomeMessage] Triggering WhatsAppService.sendMessage to ${employee.mobile}`);
      const result = await WhatsAppService.sendMessage(companyId, employee.mobile, message);
      console.log(`[WelcomeMessage] WhatsAppService result:`, result);
      
    } catch (error: any) {
      console.error('[WelcomeMessage] Error in sendWelcomeMessage:', error.message);
    }
  }
}
