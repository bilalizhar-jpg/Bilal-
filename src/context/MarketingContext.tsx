import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export interface EmailList {
  id: string;
  companyId: string;
  name: string;
  folder: string;
  count: number;
  date: string;
}

export interface Campaign {
  id: string;
  companyId: string;
  name: string;
  date: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  listId: string;
  status: 'Draft' | 'Sent' | 'Scheduled';
  scheduleDate?: string;
  scheduleTime?: string;
}

export interface CampaignLog {
  id: string;
  companyId: string;
  campaignId: string;
  recipientName: string;
  recipientEmail: string;
  status: 'Opened' | 'Clicked' | 'Bounced' | 'Unsubscribed' | 'Delivered' | 'Spam';
  opens: number;
  clicks: number;
  lastActivity: string;
}

interface MarketingContextType {
  emailLists: EmailList[];
  campaigns: Campaign[];
  campaignLogs: CampaignLog[];
  addEmailList: (list: Omit<EmailList, 'id' | 'companyId'>) => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'companyId'>) => Promise<string>;
  addCampaignLog: (log: Omit<CampaignLog, 'id' | 'companyId'>) => Promise<void>;
  getCampaignStats: (campaignId: string) => {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    spam: number;
  };
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

export const useMarketing = () => {
  const context = useContext(MarketingContext);
  if (!context) {
    throw new Error('useMarketing must be used within a MarketingProvider');
  }
  return context;
};

export const MarketingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);

  useEffect(() => {
    if (!user?.companyId) {
      setEmailLists([]);
      setCampaigns([]);
      setCampaignLogs([]);
      return;
    }

    const companyId = user.companyId;

    // Email Lists
    const qLists = query(collection(db, 'marketing_lists'), where('companyId', '==', companyId));
    const unsubscribeLists = onSnapshot(qLists, (snapshot) => {
      const listsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as EmailList));
      setEmailLists(listsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'marketing_lists');
    });

    // Campaigns
    const qCampaigns = query(collection(db, 'marketing_campaigns'), where('companyId', '==', companyId));
    const unsubscribeCampaigns = onSnapshot(qCampaigns, (snapshot) => {
      const campaignsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Campaign));
      setCampaigns(campaignsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'marketing_campaigns');
    });

    // Campaign Logs
    const qLogs = query(collection(db, 'marketing_logs'), where('companyId', '==', companyId));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CampaignLog));
      setCampaignLogs(logsData.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'marketing_logs');
    });

    return () => {
      unsubscribeLists();
      unsubscribeCampaigns();
      unsubscribeLogs();
    };
  }, [user?.companyId]);

  const addEmailList = async (list: Omit<EmailList, 'id' | 'companyId'>) => {
    if (!user?.companyId) return;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await setDoc(doc(db, 'marketing_lists', id), { ...list, id, companyId: user.companyId });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'marketing_lists');
    }
  };

  const addCampaign = async (campaign: Omit<Campaign, 'id' | 'companyId'>) => {
    if (!user?.companyId) return '';
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await setDoc(doc(db, 'marketing_campaigns', id), { ...campaign, id, companyId: user.companyId });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'marketing_campaigns');
      return '';
    }
  };

  const addCampaignLog = async (log: Omit<CampaignLog, 'id' | 'companyId'>) => {
    if (!user?.companyId) return;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await setDoc(doc(db, 'marketing_logs', id), { ...log, id, companyId: user.companyId });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'marketing_logs');
    }
  };

  const getCampaignStats = (campaignId: string) => {
    const logs = campaignLogs.filter(log => log.campaignId === campaignId);
    
    return {
      sent: logs.length,
      delivered: logs.filter(l => l.status !== 'Bounced').length,
      opened: logs.filter(l => l.status === 'Opened' || l.opens > 0).length,
      clicked: logs.filter(l => l.status === 'Clicked' || l.clicks > 0).length,
      bounced: logs.filter(l => l.status === 'Bounced').length,
      unsubscribed: logs.filter(l => l.status === 'Unsubscribed').length,
      spam: logs.filter(l => l.status === 'Spam').length,
    };
  };

  return (
    <MarketingContext.Provider value={{ 
      emailLists, 
      campaigns, 
      campaignLogs, 
      addEmailList, 
      addCampaign, 
      addCampaignLog,
      getCampaignStats
    }}>
      {children}
    </MarketingContext.Provider>
  );
};
