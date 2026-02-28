import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Search, Hash, MessageSquare, Plus, Send, Phone, Video, Info, MoreVertical, Smile, Paperclip } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private';
}

interface User {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  avatar: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export default function Messages() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [channels] = useState<Channel[]>([
    { id: '1', name: 'general', type: 'public' },
    { id: '2', name: 'hr-team', type: 'private' },
    { id: '3', name: 'announcements', type: 'public' },
    { id: '4', name: 'engineering', type: 'public' },
  ]);

  const [users] = useState<User[]>([
    { id: 'u1', name: 'Sarah Jenkins', status: 'online', avatar: 'https://picsum.photos/seed/sarah/100/100' },
    { id: 'u2', name: 'Mike Ross', status: 'away', avatar: 'https://picsum.photos/seed/mike/100/100' },
    { id: 'u3', name: 'Emily Chen', status: 'online', avatar: 'https://picsum.photos/seed/emily/100/100' },
    { id: 'u4', name: 'David Kim', status: 'offline', avatar: 'https://picsum.photos/seed/david/100/100' },
  ]);

  const [activeChat, setActiveChat] = useState<{ type: 'channel' | 'user', id: string }>({ type: 'channel', id: '1' });
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', senderId: 'u1', text: 'Hey team, just wanted to share the new HR policies.', timestamp: '10:00 AM' },
    { id: 'm2', senderId: 'u2', text: 'Thanks Sarah, I will review them today.', timestamp: '10:05 AM' },
    { id: 'm3', senderId: 'u3', text: 'Looks good to me!', timestamp: '10:15 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const msg: Message = {
      id: Date.now().toString(),
      senderId: 'me', // Assuming current user
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const getActiveChatName = () => {
    if (activeChat.type === 'channel') {
      return '#' + channels.find(c => c.id === activeChat.id)?.name;
    }
    return users.find(u => u.id === activeChat.id)?.name;
  };

  return (
    <AdminLayout>
      <div className={`flex h-[calc(100vh-12rem)] border rounded-xl overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        
        {/* Sidebar */}
        <div className={`w-64 flex flex-col border-r ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Internal Chat</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {/* Channels */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2 px-2">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Channels</span>
                <button className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-0.5">
                {channels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChat({ type: 'channel', id: channel.id })}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      activeChat.type === 'channel' && activeChat.id === channel.id
                        ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                        : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200')
                    }`}
                  >
                    <Hash className="w-4 h-4 opacity-70" />
                    <span className="truncate">{channel.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Messages */}
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Direct Messages</span>
                <button className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-0.5">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setActiveChat({ type: 'user', id: user.id })}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      activeChat.type === 'user' && activeChat.id === user.id
                        ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                        : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200')
                    }`}
                  >
                    <div className="relative">
                      <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-900 ${
                        user.status === 'online' ? 'bg-emerald-500' : user.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                    </div>
                    <span className="truncate">{user.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className={`h-16 px-6 flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {getActiveChatName()}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <button className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Phone className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Video className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => {
              const sender = users.find(u => u.id === msg.senderId) || { name: 'Me', avatar: 'https://picsum.photos/seed/admin/100/100' };
              const isMe = msg.senderId === 'me';
              
              return (
                <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <img src={sender.avatar} alt={sender.name} className="w-10 h-10 rounded-full shrink-0" referrerPolicy="no-referrer" />
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{sender.name}</span>
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{msg.timestamp}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : isDark ? 'bg-slate-800 text-slate-200 rounded-tl-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <form onSubmit={handleSendMessage} className={`flex items-end gap-2 p-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all`}>
              <button type="button" className={`p-2 shrink-0 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}>
                <Plus className="w-5 h-5" />
              </button>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={`Message ${getActiveChatName()}`}
                className={`flex-1 max-h-32 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2 text-sm ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                rows={1}
              />
              <div className="flex items-center gap-1 shrink-0 pb-1">
                <button type="button" className={`p-1.5 rounded-md ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                  <Smile className="w-5 h-5" />
                </button>
                <button type="button" className={`p-1.5 rounded-md ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                  <Paperclip className="w-5 h-5" />
                </button>
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-1.5 rounded-md ml-1 ${
                    newMessage.trim() 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'
                  } transition-colors`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
            <div className={`text-center mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <strong>Return</strong> to send <span className="mx-2">|</span> <strong>Shift + Return</strong> to add a new line
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
