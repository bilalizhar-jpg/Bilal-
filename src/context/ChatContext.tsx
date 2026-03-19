import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useEmployees } from './EmployeeContext';

export interface Chat {
  id: string;
  companyId: string;
  type: 'direct' | 'group';
  name?: string;
  participants: string[];
  adminIds?: string[];
  lastMessage?: { text: string; senderId: string; timestamp: string };
  createdAt?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

export interface Invitation {
  id: string;
  companyId: string;
  fromUserId: string;
  toUserId: string;
  type: 'direct' | 'group' | 'videoCall';
  chatId?: string;
  groupName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
  scheduledTime?: string;
}

interface ChatContextType {
  chats: Chat[];
  messages: Message[];
  invitations: Invitation[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (text: string) => Promise<void>;
  sendInvitation: (toUserId: string, type: 'direct' | 'group' | 'videoCall', groupName?: string, chatId?: string, scheduledTime?: string) => Promise<void>;
  acceptInvitation: (invitation: Invitation) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  createGroup: (name: string, participantIds: string[]) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthReady } = useAuth();
  const { employees } = useEmployees();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const companyId = user?.currentCompanyId || user?.companyId;

  useEffect(() => {
    if (!isAuthReady || !companyId || !user?.id) {
      setChats([]);
      setLoading(false);
      return;
    }
    api
      .get<Chat[]>('chats', { companyId })
      .then((data) => {
        const list = (Array.isArray(data) ? data : []).filter((c: Chat) => c.participants?.includes(user.id));
        list.sort((a, b) => {
          const t1 = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const t2 = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return t2 - t1;
        });
        setChats(list);
      })
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, [companyId, user?.id, isAuthReady]);

  useEffect(() => {
    if (!activeChat?.id) {
      setMessages([]);
      return;
    }
    api
      .get<Message[]>('messages', { chatId: activeChat.id })
      .then((data) => {
        const list = (Array.isArray(data) ? data : []).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(list);
      })
      .catch(() => setMessages([]));
  }, [activeChat?.id]);

  useEffect(() => {
    if (!isAuthReady || !companyId || !user?.id) {
      setInvitations([]);
      return;
    }
    api
      .get<Invitation[]>('invitations', { companyId, toUserId: user.id, status: 'pending' })
      .then((data) => setInvitations(Array.isArray(data) ? data : []))
      .catch(() => setInvitations([]));
  }, [companyId, user?.id, isAuthReady]);

  const sendMessage = async (text: string) => {
    if (!activeChat || !user) return;
    const timestamp = new Date().toISOString();
    const id = Math.random().toString(36).substr(2, 9);
    await api.post('messages', { id, chatId: activeChat.id, senderId: user.id, text, timestamp, type: 'text' });
    setMessages((prev) => [...prev, { id, chatId: activeChat.id, senderId: user.id, text, timestamp, type: 'text' }]);
    await api.put('chats', activeChat.id, { lastMessage: { text, senderId: user.id, timestamp } });
    setChats((prev) => prev.map((c) => (c.id === activeChat.id ? { ...c, lastMessage: { text, senderId: user.id, timestamp } } : c)));
  };

  const sendInvitation = async (toUserId: string, type: 'direct' | 'group' | 'videoCall', groupName?: string, chatId?: string, scheduledTime?: string) => {
    if (!companyId || !user?.id) return;
    if (type === 'direct') {
      const existing = chats.find((c) => c.type === 'direct' && c.participants?.includes(toUserId));
      if (existing) {
        alert('Chat already exists with this user.');
        return;
      }
    }
    const id = Math.random().toString(36).substr(2, 9);
    await api.post('invitations', { id, companyId, fromUserId: user.id, toUserId, type, groupName: groupName || null, chatId: chatId || null, status: 'pending', timestamp: new Date().toISOString(), scheduledTime: scheduledTime || null });
    const list = await api.get<Invitation[]>('invitations', { companyId, toUserId: user.id, status: 'pending' });
    setInvitations(Array.isArray(list) ? list : []);
  };

  const acceptInvitation = async (invitation: Invitation) => {
    if (!user) return;
    if (invitation.type === 'direct') {
      const id = Math.random().toString(36).substr(2, 9);
      await api.post('chats', { id, companyId: user.companyId, type: 'direct', participants: [invitation.fromUserId, user.id], createdAt: new Date().toISOString() });
    } else if (invitation.type === 'group' && invitation.chatId) {
      const chat = chats.find((c) => c.id === invitation.chatId) || (await api.getById<Chat>('chats', invitation.chatId).catch(() => null));
      if (chat) {
        const updated = [...(chat.participants || []), user.id];
        await api.put('chats', invitation.chatId, { participants: updated });
      }
    }
    await api.put('invitations', invitation.id, { status: 'accepted' });
    await api.delete('invitations', invitation.id);
    setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
    const data = await api.get<Chat[]>('chats', { companyId });
    setChats((Array.isArray(data) ? data : []).filter((c: Chat) => c.participants?.includes(user.id)));
  };

  const rejectInvitation = async (invitationId: string) => {
    await api.put('invitations', invitationId, { status: 'rejected' });
    await api.delete('invitations', invitationId);
    setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
  };

  const createGroup = async (name: string, participantIds: string[]) => {
    if (!companyId || !user?.id) return;
    const id = Math.random().toString(36).substr(2, 9);
    await api.post('chats', { id, companyId, type: 'group', name, participants: [user.id], adminIds: [user.id], createdAt: new Date().toISOString() });
    for (const pid of participantIds) {
      await sendInvitation(pid, 'group', undefined, id);
    }
    const data = await api.get<Chat[]>('chats', { companyId });
    setChats((Array.isArray(data) ? data : []).filter((c: Chat) => c.participants?.includes(user.id)));
  };

  const deleteChat = async (chatId: string) => {
    await api.delete('chats', chatId);
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChat?.id === chatId) setActiveChat(null);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        invitations,
        activeChat,
        setActiveChat,
        sendMessage,
        sendInvitation,
        acceptInvitation,
        rejectInvitation,
        createGroup,
        deleteChat,
        loading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
