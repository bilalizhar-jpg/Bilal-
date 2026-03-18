import { useCallback} from 'react';
import { useAuth} from '../context/AuthContext';

export const useWhatsApp = () => {
 const { user} = useAuth();
 const companyId = user?.companyId || 'default_company';

 const sendWhatsAppMessage = useCallback(async (toNumber: string, message: string) => {
 try {
 const response = await fetch('/api/whatsapp/send', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json'},
 body: JSON.stringify({
 company_id: companyId,
 to_number: toNumber,
 message: message,
}),
});

 if (!response.ok) {
 const text = await response.text();
 throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
}

 const data = await response.json();
 if (data.error) {
 throw new Error(data.error);
}
 return { success: true, data};
} catch (error: any) {
 console.error('WhatsApp Hook Error:', error);
 return { success: false, error: error.message};
}
}, [companyId]);

 const checkWhatsAppStatus = useCallback(async () => {
 try {
 const response = await fetch(`/api/whatsapp/status?company_id=${companyId}`);
 if (!response.ok) {
 return 'disconnected';
}
 const data = await response.json();
 return data.status;
} catch (error: any) {
 if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
 // Silent fail for background status checks
} else {
 console.error('WhatsApp Status Check Error:', error);
}
 return 'disconnected';
}
}, [companyId]);

 return { sendWhatsAppMessage, checkWhatsAppStatus};
};
