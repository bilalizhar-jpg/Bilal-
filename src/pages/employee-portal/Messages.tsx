import React, { useState, useEffect, useRef } from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { useTheme } from '../../context/ThemeContext';
import { useChat, Chat } from '../../context/ChatContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Hash, Plus, Send, Video, Phone, X, Trash2, Users } from 'lucide-react';

export default function EmployeeMessages() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { chats, messages, activeChat, setActiveChat, sendMessage, sendInvitation, createGroup, deleteChat } = useChat();
  const isDark = theme === 'dark';

  const [newMessage, setNewMessage] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') return chat.name;
    const otherUserId = chat.participants.find(p => p !== user?.id);
    const otherUser = employees.find(e => e.id === otherUserId);
    return otherUser?.name || 'Unknown User';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') return null;
    const otherUserId = chat.participants.find(p => p !== user?.id);
    const otherUser = employees.find(e => e.id === otherUserId);
    return otherUser?.avatar;
  };

  const getChatStatus = (chat: Chat) => {
    if (chat.type === 'group') return null;
    const otherUserId = chat.participants.find(p => p !== user?.id);
    const otherUser = employees.find(e => e.id === otherUserId);
    return otherUser?.status || 'offline';
  };

  const filteredEmployees = employees.filter(emp => 
    emp.id !== user?.id && 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <EmployeeLayout>
      <div className={`flex h-[calc(100vh-10rem)] border rounded-3xl overflow-hidden shadow-2xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
        
        {/* Sidebar */}
        <div className={`w-80 flex flex-col border-r ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} flex justify-between items-center`}>
            <h2 className={`font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Messages</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowCreateGroupModal(true)}
                title="Create Group"
                className={`p-2 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-800 text-slate-400 hover:text-indigo-400' : 'bg-white text-slate-500 hover:text-indigo-600 shadow-sm'}`}
              >
                <Users className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowAddUserModal(true)}
                title="New Chat"
                className={`p-2 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-800 text-slate-400 hover:text-indigo-400' : 'bg-white text-slate-500 hover:text-indigo-600 shadow-sm'}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm transition-all ${
                  activeChat?.id === chat.id
                    ? (isDark ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20')
                    : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-white hover:shadow-sm')
                }`}
              >
                <div className="relative shrink-0">
                  {chat.type === 'group' ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeChat?.id === chat.id ? 'bg-indigo-500' : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`}>
                      <Hash className="w-5 h-5" />
                    </div>
                  ) : (
                    <>
                      <img 
                        src={getChatAvatar(chat) || `https://ui-avatars.com/api/?name=${getChatName(chat)}`} 
                        alt={getChatName(chat)} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${activeChat?.id === chat.id ? 'border-indigo-600' : (isDark ? 'border-slate-900' : 'border-white')} ${
                        getChatStatus(chat) === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold truncate">{getChatName(chat)}</p>
                  {chat.lastMessage && (
                    <p className={`text-xs truncate ${activeChat?.id === chat.id ? 'text-indigo-100' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                      {chat.lastMessage.senderId === user?.id ? 'You: ' : ''}{chat.lastMessage.text}
                    </p>
                  )}
                </div>
              </button>
            ))}

            {chats.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-slate-500 text-sm font-medium">No chats yet. Start a new conversation!</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeChat ? (
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 dark:bg-slate-900/30">
            {/* Chat Header */}
            <div className={`h-20 px-8 flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} bg-white/50 dark:bg-slate-900/50 backdrop-blur-md`}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {activeChat.type === 'group' ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <Hash className="w-5 h-5 text-indigo-500" />
                    </div>
                  ) : (
                    <img 
                      src={getChatAvatar(activeChat) || `https://ui-avatars.com/api/?name=${getChatName(activeChat)}`} 
                      alt={getChatName(activeChat)} 
                      className="w-10 h-10 rounded-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  )}
                </div>
                <div>
                  <h3 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {getChatName(activeChat)}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeChat.type === 'group' ? `${activeChat.participants.length} members` : getChatStatus(activeChat)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowVideoCall(true)}
                  className={`p-2.5 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-800 text-slate-400 hover:text-indigo-400' : 'bg-white text-slate-500 hover:text-indigo-600 shadow-sm'}`}
                  title="Video Call"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this chat?')) {
                      deleteChat(activeChat.id);
                    }
                  }}
                  className={`p-2.5 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-800 text-slate-400 hover:text-rose-400' : 'bg-white text-slate-500 hover:text-rose-600 shadow-sm'}`}
                  title="Delete Chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {messages.map((msg, idx) => {
                const sender = employees.find(e => e.id === msg.senderId);
                const isMe = msg.senderId === user?.id;
                const prevMsg = messages[idx - 1];
                const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
                
                return (
                  <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''} ${!showAvatar ? 'mt-1' : ''}`}>
                    <div className="w-10 shrink-0">
                      {showAvatar && (
                        <img 
                          src={sender?.avatar || `https://ui-avatars.com/api/?name=${sender?.name || 'User'}`} 
                          alt={sender?.name} 
                          className="w-10 h-10 rounded-full object-cover shadow-sm" 
                          referrerPolicy="no-referrer" 
                        />
                      )}
                    </div>
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      {showAvatar && (
                        <div className="flex items-baseline gap-2 mb-1 px-1">
                          <span className={`font-bold text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {sender?.name || 'Unknown'}
                          </span>
                          <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      )}
                      <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : isDark ? 'bg-slate-800 text-slate-200 rounded-tl-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className={`p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <form onSubmit={handleSendMessage} className={`flex items-end gap-3 p-3 rounded-2xl border transition-all focus-within:ring-4 focus-within:ring-indigo-500/10 ${isDark ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500' : 'bg-white border-slate-200 focus-within:border-indigo-500 shadow-sm'}`}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={`Write a message to ${getChatName(activeChat)}...`}
                  className={`flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-2.5 text-sm ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                  rows={1}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-xl transition-all active:scale-95 ${
                    newMessage.trim() 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20' 
                      : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 dark:bg-slate-900/30">
            <div className={`w-20 h-20 mb-6 rounded-3xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white shadow-xl shadow-slate-200/50'}`}>
              <Search className="w-10 h-10 text-indigo-500 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your Conversations</h3>
            <p className="text-slate-500 font-medium">Select a chat or start a new conversation to get started.</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>New Chat</h3>
              <button onClick={() => setShowAddUserModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all focus:ring-4 focus:ring-indigo-500/10 ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-indigo-500'}`}
              />
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => {
                    sendInvitation(emp.id, 'direct');
                    setShowAddUserModal(false);
                    alert(`Invitation sent to ${emp.name}`);
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group`}
                >
                  <img 
                    src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}`} 
                    alt={emp.name} 
                    className="w-12 h-12 rounded-full object-cover shadow-sm" 
                  />
                  <div className="text-left flex-1">
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-indigo-600 transition-colors`}>{emp.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{emp.designation}</p>
                  </div>
                  <Plus className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <CreateGroupModal 
          onClose={() => setShowCreateGroupModal(false)} 
          employees={employees}
          currentUserId={user?.id}
          onCreate={createGroup}
          isDark={isDark}
        />
      )}

      {/* Video Call Modal (Simulated) */}
      {showVideoCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl">
          <div className="relative w-full max-w-5xl aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute top-6 left-6 z-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-xs font-bold flex items-center gap-3 border border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              LIVE SESSION
            </div>
            
            {/* Main Video (Remote) */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <img 
                    src={getChatAvatar(activeChat!) || `https://ui-avatars.com/api/?name=${getChatName(activeChat!)}`} 
                    alt="Caller" 
                    className="w-32 h-32 rounded-full mx-auto border-4 border-white/10 shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{getChatName(activeChat!)}</h3>
                <p className="text-indigo-300 font-medium animate-pulse tracking-widest text-xs uppercase">Connecting Securely...</p>
              </div>
            </div>

            {/* Self Video (Local) */}
            <div className="absolute bottom-8 right-8 w-64 aspect-video bg-slate-800 rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl ring-1 ring-black/50">
               <VideoPreview />
            </div>

            {/* Controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6">
              <button className="p-5 rounded-2xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all active:scale-90 border border-white/10">
                <Video className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setShowVideoCall(false)}
                className="p-6 rounded-3xl bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-500/30 transition-all active:scale-90"
              >
                <Phone className="w-8 h-8 rotate-[135deg]" />
              </button>
              <button className="p-5 rounded-2xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all active:scale-90 border border-white/10">
                <Users className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </EmployeeLayout>
  );
}

function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing camera:", err));
  }, []);

  return <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale-[0.2]" />;
}

function CreateGroupModal({ onClose, employees, currentUserId, onCreate, isDark }: any) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter((emp: any) => 
    emp.id !== currentUserId && 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUsers.length === 0) return;
    onCreate(groupName, selectedUsers);
    onClose();
  };

  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Group</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl border transition-all focus:ring-4 focus:ring-indigo-500/10 ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-indigo-500'}`}
              placeholder="e.g. Marketing Team"
              required
            />
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Add Members</label>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all focus:ring-4 focus:ring-indigo-500/10 ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-indigo-500'}`}
              />
            </div>
            <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-1 pr-2">
              {filteredEmployees.map((emp: any) => (
                <div
                  key={emp.id}
                  onClick={() => toggleUser(emp.id)}
                  className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${
                    selectedUsers.includes(emp.id) 
                      ? (isDark ? 'bg-indigo-900/30 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-100')
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedUsers.includes(emp.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                  }`}>
                    {selectedUsers.includes(emp.id) && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <img 
                    src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}`} 
                    alt={emp.name} 
                    className="w-10 h-10 rounded-full object-cover shadow-sm" 
                  />
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!groupName.trim() || selectedUsers.length === 0}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}