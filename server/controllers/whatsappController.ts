import { Request, Response } from 'express';
import { WhatsAppService } from '../services/whatsappService';

export const connectWhatsApp = async (req: Request, res: Response) => {
  const { company_id } = req.body;
  if (!company_id) return res.status(400).json({ error: 'company_id is required' });

  try {
    WhatsAppService.connect(
      company_id,
      (qr) => {
        // Handle QR
      },
      () => {
        console.log(`Company ${company_id} is now connected`);
      }
    );
    
    // Respond quickly that the process has started
    setTimeout(async () => {
      const status = await WhatsAppService.getStatus(company_id);
      res.json(status);
    }, 500);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ error: 'company_id is required' });

  try {
    const status = await WhatsAppService.getStatus(company_id as string);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const { company_id, to_number, message } = req.body;
  if (!company_id || !to_number || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await WhatsAppService.sendMessage(company_id, to_number, message);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const disconnectWhatsApp = async (req: Request, res: Response) => {
  const { company_id } = req.body;
  if (!company_id) return res.status(400).json({ error: 'company_id is required' });

  try {
    await WhatsAppService.disconnect(company_id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
