import { Router } from 'express';
import * as whatsappController from '../controllers/whatsappController';

const router = Router();

router.post('/connect', whatsappController.connectWhatsApp);
router.get('/status', whatsappController.getStatus);
router.post('/send', whatsappController.sendMessage);
router.post('/disconnect', whatsappController.disconnectWhatsApp);

export default router;
