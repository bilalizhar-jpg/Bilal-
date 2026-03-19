import React, { createContext, useContext, useState, useEffect, ReactNode} from 'react';
import { 
 collection, 
 onSnapshot, 
 doc, 
 setDoc, 
 updateDoc, 
 deleteDoc, 
 query,
 where,
 addDoc,
 orderBy,
 serverTimestamp,
 getDoc,
 limit
} from 'firebase/firestore';
import { db} from '../firebase';
import { useAuth} from './AuthContext';
import { useEmployees} from './EmployeeContext';
import { handleFirestoreError, OperationType} from '../utils/firestoreErrorHandler';

export interface Chat {
 id: string;
 companyId: string;
 type: 'direct' | 'group';
 name?: string;
 participants: string[];
 adminIds?: string[];
 lastMessage?: {
 text: string;
 senderId: string;
 timestamp: any;
};
 createdAt: any;
}

export interface Message {
 id: string;
 chatId: string;
 senderId: string;
 text: string;
 timestamp: any;
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
 timestamp: any;
 scheduledTime?: any;
}

interface ChatContextType {
 chats: Chat[];
 messages: Message[];
 invitations: Invitation[];
 activeChat: Chat | null;
 setActiveChat: (chat: Chat | null) => void;
 sendMessage: (text: string) => Promise<void>;
 sendInvitation: (toUserId: string, type: 'direct' | 'group' | 'videoCall', groupName?: string, chatId?: string, scheduledTime?: any) => Promise<void>;
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
  const { user, isFirebaseReady } = useAuth();
  const { employees } = useEmployees();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Chats
  useEffect(() => {
    if (!isFirebaseReady || !user?.companyId || !user?.id) return;

 // We need to query chats where the user is a participant.
 // Firestore array-contains query.
 const q = query(
 collection(db, 'chats'), 
 where('companyId', '==', user.companyId),
 where('participants', 'array-contains', user.id)
 );

 const unsubscribe = onSnapshot(q, (snapshot) => {
 const chatList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as Chat));
 // Sort by last message timestamp locally since we can't easily order by it with array-contains in one go without composite index
 chatList.sort((a, b) => {
 const t1 = a.lastMessage?.timestamp?.toMillis() || a.createdAt?.toMillis() || 0;
 const t2 = b.lastMessage?.timestamp?.toMillis() || b.createdAt?.toMillis() || 0;
 return t2 - t1;
});
 setChats(chatList);
 setLoading(false);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'chats');
});

  return () => unsubscribe();
}, [user?.companyId, user?.id, isFirebaseReady]);

  // Fetch Messages for Active Chat
 useEffect(() => {
 if (!activeChat?.id) {
 setMessages([]);
 return;
}

 const q = query(
 collection(db, 'chats', activeChat.id, 'messages'),
 orderBy('timestamp', 'asc')
 );

 const unsubscribe = onSnapshot(q, (snapshot) => {
 const msgList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as Message));
 setMessages(msgList);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'messages');
});

 return () => unsubscribe();
}, [activeChat?.id]);

  // Fetch Invitations
  useEffect(() => {
    if (!isFirebaseReady || !user?.companyId || !user?.id) return;

 const q = query(
 collection(db, 'invitations'),
 where('companyId', '==', user.companyId),
 where('toUserId', '==', user.id),
 where('status', '==', 'pending')
 );

 const unsubscribe = onSnapshot(q, (snapshot) => {
 const inviteList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as Invitation));
 setInvitations(inviteList);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'invitations');
});

  return () => unsubscribe();
}, [user?.companyId, user?.id, isFirebaseReady]);

  const sendMessage = async (text: string) => {
 if (!activeChat || !user) return;

 try {
 const messageData = {
 chatId: activeChat.id,
 senderId: user.id,
 text,
 timestamp: serverTimestamp(),
 type: 'text'
};

 await addDoc(collection(db, 'chats', activeChat.id, 'messages'), messageData);

 // Update last message in chat
 await updateDoc(doc(db, 'chats', activeChat.id), {
 lastMessage: {
 text,
 senderId: user.id,
 timestamp: serverTimestamp()
}
});
} catch (error) {
 handleFirestoreError(error, OperationType.CREATE, 'messages');
}
};

 const sendInvitation = async (toUserId: string, type: 'direct' | 'group' | 'videoCall', groupName?: string, chatId?: string, scheduledTime?: any) => {
 if (!user?.companyId || !user?.id) return;

 // Check if chat already exists for direct messages
 if (type === 'direct') {
 const existingChat = chats.find(c => c.type === 'direct' && c.participants.includes(toUserId));
 if (existingChat) {
 alert('Chat already exists with this user.');
 return;
}
}

 try {
 await addDoc(collection(db, 'invitations'), {
 companyId: user.companyId,
 fromUserId: user.id,
 toUserId,
 type,
 groupName: groupName || null,
 chatId: chatId || null,
 status: 'pending',
 timestamp: serverTimestamp(),
 scheduledTime: scheduledTime || null
});
} catch (error) {
 handleFirestoreError(error, OperationType.CREATE, 'invitations');
}
};

 const acceptInvitation = async (invitation: Invitation) => {
 if (!user) return;

 try {
 if (invitation.type === 'direct') {
 // Create new chat
 const chatData = {
 companyId: user.companyId,
 type: 'direct',
 participants: [invitation.fromUserId, user.id],
 createdAt: serverTimestamp()
};
 await addDoc(collection(db, 'chats'), chatData);
} else if (invitation.type === 'group') {
 if (invitation.chatId) {
 // Add to existing chat
 const chatRef = doc(db, 'chats', invitation.chatId);
 const chatSnap = await getDoc(chatRef);
 if (chatSnap.exists()) {
 const chat = chatSnap.data() as Chat;
 const updatedParticipants = [...chat.participants, user.id];
 await updateDoc(chatRef, { participants: updatedParticipants});
}
}
} else if (invitation.type === 'videoCall') {
 // Handle video call acceptance
 // This will be handled by the UI listening to invitation status
}

 // Update invitation status
 await updateDoc(doc(db, 'invitations', invitation.id), { status: 'accepted'});
 await deleteDoc(doc(db, 'invitations', invitation.id));

} catch (error) {
 handleFirestoreError(error, OperationType.UPDATE, 'invitations');
}
};

 const rejectInvitation = async (invitationId: string) => {
 try {
 await updateDoc(doc(db, 'invitations', invitationId), { status: 'rejected'});
 await deleteDoc(doc(db, 'invitations', invitationId));
} catch (error) {
 handleFirestoreError(error, OperationType.UPDATE, 'invitations');
}
};

 const createGroup = async (name: string, participantIds: string[]) => {
 if (!user?.companyId || !user?.id) return;

 try {
 // Create the chat first with ONLY the creator
 const chatData = {
 companyId: user.companyId,
 type: 'group',
 name,
 participants: [user.id],
 adminIds: [user.id],
 createdAt: serverTimestamp()
};
 
 const chatRef = await addDoc(collection(db, 'chats'), chatData);

 // Send invitations to others
 for (const participantId of participantIds) {
 await sendInvitation(participantId, 'group', undefined, chatRef.id);
}
} catch (error) {
 handleFirestoreError(error, OperationType.CREATE, 'chats');
}
};

 const deleteChat = async (chatId: string) => {
 try {
 await deleteDoc(doc(db, 'chats', chatId));
 if (activeChat?.id === chatId) {
 setActiveChat(null);
}
} catch (error) {
 handleFirestoreError(error, OperationType.DELETE, 'chats');
}
};

 return (
 <ChatContext.Provider value={{
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
 loading
}}>
 {children}
 </ChatContext.Provider>
 );
};
