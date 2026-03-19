import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

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
  getCampaignStats: (campaignId: string) => { sent: number; delivered: number; opened: number; clicked: number; bounced: number; unsubscribed: number; spam: number };
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
  const { user, isAuthReady } = useAuth();
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);
  const companyId = user?.currentCompanyId || user?.companyId;

  useEffect(() => {
    if (!isAuthReady || !companyId) {
      setEmailLists([]);
      setCampaigns([]);
      setCampaignLogs([]);
      return;
    }
    Promise.all([
      api.get<EmailList[]>('marketing_lists', { companyId }).catch(() => []),
      api.get<Campaign[]>('marketing_campaigns', { companyId }).catch(() => []),
      api.get<CampaignLog[]>('marketing_logs', { companyId }).catch(() => []),
    ]).then(([lists, campaignsData, logs]) => {
      setEmailLists(Array.isArray(lists) ? lists : []);
      setCampaigns((Array.isArray(campaignsData) ? campaignsData : []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setCampaignLogs((Array.isArray(logs) ? logs : []).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
    });
  }, [companyId, isAuthReady]);

  const addEmailList = async (list: Omit<EmailList, 'id' | 'companyId'>) => {
    if (!companyId) return;
    const id = Math.random().toString(36).substr(2, 9);
    await api.post('marketing_lists', { ...list, id, companyId });
    setEmailLists((prev) => [...prev, { ...list, id, companyId } as EmailList]);
  };

  const addCampaign = async (campaign: Omit<Campaign, 'id' | 'companyId'>) => {
    if (!companyId) return '';
    const id = Math.random().toString(36).substr(2, 9);
    await api.post('marketing_campaigns', { ...campaign, id, companyId });
    setCampaigns((prev) => [{ ...campaign, id, companyId } as Campaign, ...prev]);
    return id;
  };

  const addCampaignLog = async (log: Omit<CampaignLog, 'id' | 'companyId'>) => {
    if (!companyId) return;
    const id = Math.random().toString(36).substr(2, 9);
    await api.post('marketing_logs', { ...log, id, companyId });
    setCampaignLogs((prev) => [...prev, { ...log, id, companyId } as CampaignLog]);
  };

  const getCampaignStats = (campaignId: string) => {
    const logs = campaignLogs.filter((l) => l.campaignId === campaignId);
    return {
      sent: logs.length,
      delivered: logs.filter((l) => l.status !== 'Bounced').length,
      opened: logs.filter((l) => l.status === 'Opened' || (l.opens || 0) > 0).length,
      clicked: logs.filter((l) => l.status === 'Clicked' || (l.clicks || 0) > 0).length,
      bounced: logs.filter((l) => l.status === 'Bounced').length,
      unsubscribed: logs.filter((l) => l.status === 'Unsubscribed').length,
      spam: logs.filter((l) => l.status === 'Spam').length,
    };
  };

  return (
    <MarketingContext.Provider value={{ emailLists, campaigns, campaignLogs, addEmailList, addCampaign, addCampaignLog, getCampaignStats }}>
      {children}
    </MarketingContext.Provider>
  );
};
