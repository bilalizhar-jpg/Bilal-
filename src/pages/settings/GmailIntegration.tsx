import React, { useState, useEffect, useRef} from 'react';
import AdminLayout from '../../components/AdminLayout';
import { AnimatePresence, motion} from 'motion/react';
import { Mail, ShieldCheck} from 'lucide-react';

export default function GmailIntegration() {
 
 const [connected, setConnected] = useState<Record<string, boolean>>({});
 const [connectedEmails, setConnectedEmails] = useState<Record<string, string>>({});
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [modalError, setModalError] = useState<string | null>(null);
 const pendingIntegrationRef = useRef<string | null>(null);

 const handleConnectClick = (id: string) => {
 if (connected[id]) {
 // If already connected, disconnect immediately
 setConnected(prev => ({ ...prev, [id]: false}));
 setConnectedEmails(prev => {
 const newEmails = { ...prev};
 delete newEmails[id];
 return newEmails;
});
} else if (id === 'gmail') {
 // If connecting to Gmail, show the modal
 setModalError(null);
 pendingIntegrationRef.current = id;
 setIsModalOpen(true);
} else {
 // For other integrations, just toggle for now
 setConnected(prev => ({ ...prev, [id]: true}));
}
};

 const handleContinue = () => {
 // This must be set in the environment variables
 const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
 const redirectUri =`${window.location.origin}/auth/callback`;
 
 if (!clientId) {
 setModalError('VITE_GOOGLE_CLIENT_ID is missing. Please add it to your environment variables to enable real Gmail integration.');
 return;
}

 setIsModalOpen(false);
 setModalError(null);

 const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send');
 
 // Force the Google consent screen
 const authUrl =`https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent%20select_account`;
 
 const authWindow = window.open(authUrl, 'oauth_popup', 'width=600,height=700');
 
 if (!authWindow) {
 alert('Please allow popups for this site to connect your account.');
}
};

 useEffect(() => {
 const handleMessage = async (event: MessageEvent) => {
 // Validate origin is from AI Studio preview or localhost
 const origin = event.origin;
 if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
 return;
}
 if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
 const { accessToken} = event.data.payload;
 
 if (pendingIntegrationRef.current === 'gmail' && accessToken) {
 try {
 // Fetch the user's email address using the Gmail API
 const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
 headers: {
 Authorization:`Bearer ${accessToken}`
}
});
 
 if (response.ok) {
 const data = await response.json();
 setConnectedEmails(prev => ({ ...prev, gmail: data.emailAddress}));
} else {
 // Fallback if API call fails
 setConnectedEmails(prev => ({ ...prev, gmail: 'user@gmail.com'}));
}
} catch (error) {
 console.error("Error fetching Gmail profile:", error);
 setConnectedEmails(prev => ({ ...prev, gmail: 'user@gmail.com'}));
}

 setConnected(prev => ({ ...prev, gmail: true}));
 pendingIntegrationRef.current = null;
} else if (pendingIntegrationRef.current) {
 setConnected(prev => ({ ...prev, [pendingIntegrationRef.current!]: true}));
 pendingIntegrationRef.current = null;
}
}
};
 window.addEventListener('message', handleMessage);
 return () => window.removeEventListener('message', handleMessage);
}, []);

 const emailIntegrations = [
 {
 id: 'gmail',
 name: 'Gmail',
 icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/512px-Gmail_icon_%282020%29.svg.png',
 description: 'Email service provider developed by Google.',
},
 {
 id: 'outlook',
 name: 'Outlook Email',
 icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/512px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png',
 description: 'Email service provider developed by Outlook.',
}
 ];

 const calendarIntegrations = [
 {
 id: 'gcal',
 name: 'Google Calendar',
 icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/512px-Google_Calendar_icon_%282020%29.svg.png',
 description: 'Web-based calendar by Google for creating, managing, and sharing events. Integrate yo...',
},
 {
 id: 'o365cal',
 name: 'Office 365 Calendar',
 icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Microsoft_Office_Calendar_%282018%E2%80%93present%29.svg/512px-Microsoft_Office_Calendar_%282018%E2%80%93present%29.svg.png',
 description:"Microsoft's cloud-based calendar solution within the Office 365 suite. Integrate your...",
}
 ];

 const IntegrationCard = ({ item}: { item: any}) => (
 <div className={`flex flex-col rounded-xl border bg-white border-slate-200 overflow-hidden`}>
 <div className="p-6 flex-1">
 <div className="flex items-start gap-4 mb-4">
 <div className={`w-16 h-16 rounded-xl flex items-center justify-center p-2 bg-slate-50 border border-slate-100`}>
 <img src={item.icon} alt={item.name} className="w-full h-full object-contain"referrerPolicy="no-referrer"/>
 </div>
 <div className="pt-1">
 <h3 className={`text-lg font-bold text-slate-800`}>{item.name}</h3>
 <a href="#"className="text-[#007BFF] hover:underline text-sm font-medium">Learn more</a>
 </div>
 </div>
 <p className={`text-sm mb-4 text-slate-500`}>
 {item.description}
 </p>
 
 {connected[item.id] && connectedEmails[item.id] && (
 <div className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600`}>
 <ShieldCheck className="w-4 h-4"/>
 Connected as: {connectedEmails[item.id]}
 </div>
 )}
 </div>
 <button 
 onClick={() => handleConnectClick(item.id)}
 className={`w-full py-3 text-sm font-bold border-t transition-colors ${
 connected[item.id] 
 ? ('border-slate-200 text-red-600 hover:bg-red-50')
 : ('border-slate-200 text-[#007BFF] hover:bg-blue-50')
}`}
 >
 {connected[item.id] ?`Disconnect ${item.name}`:`Connect with ${item.name}`}
 </button>
 </div>
 );

 return (
 <AdminLayout>
 <div className="space-y-10 max-w-5xl relative">
 
 {/* Email Integrations */}
 <section>
 <h2 className={`text-xl font-bold mb-6 text-slate-800`}>
 Email Integrations
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {emailIntegrations.map(item => (
 <IntegrationCard key={item.id} item={item} />
 ))}
 </div>
 </section>

 {/* Calendar Integrations */}
 <section>
 <div className="flex items-center gap-2 mb-6">
 <h2 className={`text-xl font-bold text-slate-800`}>
 Calendar Integrations
 </h2>
 <span className={`text-lg text-slate-400`}>
 ({calendarIntegrations.length} Total)
 </span>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {calendarIntegrations.map(item => (
 <IntegrationCard key={item.id} item={item} />
 ))}
 </div>
 </section>

 {/* Confirmation Modal */}
 <AnimatePresence>
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className={`w-full max-w-md rounded-xl shadow-xl overflow-hidden bg-white`}
 >
 <div className="p-6">
 <p className={`text-lg mb-4 text-[#333333]`}>
 Connect to Gmail.
 </p>
 
 {modalError && (
 <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
 <p className="font-bold mb-2">{modalError}</p>
 <p className="mb-2">To fix this:</p>
 <ol className="list-decimal list-inside space-y-1 mb-4">
 <li>Go to Google Cloud Console</li>
 <li>Create an OAuth Client ID (Web Application)</li>
 <li>Add the exact Redirect URI below</li>
 <li>Add the Client ID to your AI Studio Environment Variables</li>
 </ol>
 <div className="bg-black/20 p-2 rounded font-mono text-xs break-all select-all">
 {window.location.origin}/auth/callback
 </div>
 </div>
 )}

 <div className="flex justify-end gap-4">
 <button 
 onClick={() => setIsModalOpen(false)}
 className={`px-4 py-2 text-sm font-bold text-[#333333] hover:text-black`}
 >
 Close
 </button>
 <button 
 onClick={handleContinue}
 className="px-6 py-2 bg-[#F44336] hover:bg-[#D32F2F] text-white text-sm font-bold rounded shadow-sm transition-colors"
 >
 Continue
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </div>
 </AdminLayout>
 );
}
