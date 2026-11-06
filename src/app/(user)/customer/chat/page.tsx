'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { ApiClient } from '@/lib/api';
import {
  MessageSquare,
  Store as StoreIcon,
  Headphones,
  Send,
  Loader2,
  ChevronLeft,
  Plus,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChatConversation {
  id: number;
  type: 'STORE_CUSTOMER' | 'ADMIN_STORE' | 'ADMIN_CUSTOMER' | 'DISPUTE';
  store?: { id: number; name: string; slug: string; logoUrl?: string };
  customer?: { id: number; name: string; email: string };
  admin?: { id: number; name: string; email: string };
  lastMessage?: { content: string; createdAt: string } | null;
  lastMessageAt: string;
}

interface Message {
  id: number;
  senderId: number;
  sender?: { id: number; name: string; role?: string };
  content: string;
  createdAt: string;
}

interface AvailableStore {
  id: number;
  name: string;
  slug: string;
  category?: string;
  logoUrl?: string;
}

export default function CustomerChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [availableStores, setAvailableStores] = useState<AvailableStore[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const res = await ApiClient.get('/chat/conversations');
      if (res.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);
        if (res.conversations.length > 0 && !activeConversation) {
          selectConversation(res.conversations[0]);
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      const res = await ApiClient.get('/storefront/search/all?limit=25');
      if (res.success && Array.isArray(res.stores)) {
        setAvailableStores(res.stores);
      }
    } catch {
      setAvailableStores([
        { id: 1, name: 'UrbanTrend Fashion', slug: 'urbantrend', category: 'Fashion & Apparel' },
        { id: 2, name: 'GadgetHub Electronics', slug: 'gadgethub', category: 'Electronics & Tech' },
        { id: 3, name: 'Abyssinia Artisan & Coffee', slug: 'abyssinia', category: 'Heritage & Crafts' },
        { id: 4, name: 'Sheba Beauty & Organics', slug: 'shebabeauty', category: 'Beauty & Care' },
        { id: 5, name: 'FreshCorner Supermarket', slug: 'freshcorner', category: 'Groceries' },
      ]);
    }
  };

  useEffect(() => {
    loadConversations();
    loadStores();
  }, []);

  // Socket room joining and listener
  useEffect(() => {
    if (!socket || !activeConversation) return;

    socket.emit('join:conversation', activeConversation.id);

    const handleNewMessage = (newMsg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    };

    socket.on('chat:message', handleNewMessage);

    return () => {
      socket.emit('leave:conversation', activeConversation.id);
      socket.off('chat:message', handleNewMessage);
    };
  }, [socket, activeConversation]);

  const selectConversation = async (conv: ChatConversation) => {
    setActiveConversation(conv);
    setMessagesLoading(true);
    try {
      const res = await ApiClient.get(`/chat/conversations/${conv.id}/messages`);
      if (res.success && Array.isArray(res.messages)) {
        setMessages(res.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const startStoreChat = async (storeId: number) => {
    setShowNewChatModal(false);
    try {
      const res = await ApiClient.post('/chat/conversations', {
        type: 'STORE_CUSTOMER',
        storeId,
      });
      if (res.success && res.conversation) {
        await loadConversations();
        await selectConversation(res.conversation);
      }
    } catch (err) {
      console.error('Failed to start chat with store:', err);
    }
  };

  const startPlatformChat = async () => {
    setShowNewChatModal(false);
    try {
      const res = await ApiClient.post('/chat/conversations', {
        type: 'ADMIN_CUSTOMER',
      });
      if (res.success && res.conversation) {
        await loadConversations();
        await selectConversation(res.conversation);
      }
    } catch (err) {
      console.error('Failed to start platform support chat:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation || isSending) return;

    const messageText = input.trim();
    setInput('');
    setIsSending(true);

    try {
      const res: any = await ApiClient.post(`/chat/conversations/${activeConversation.id}/messages`, {
        content: messageText,
      });

      if (res.success && res.message && typeof res.message === 'object') {
        const newMsg = res.message as Message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getChatPartnerName = (conv: ChatConversation) => {
    if (conv.type === 'STORE_CUSTOMER') {
      return conv.store?.name || 'Store Owner Support';
    }
    if (conv.type === 'ADMIN_CUSTOMER') {
      return 'MyMall Platform Helpdesk';
    }
    return 'Customer Support';
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Communications & Store Chat
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Direct channels with verified Ethiopian stores and MyMall platform support.
          </p>
        </div>

        <Button
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowNewChatModal(true)}
        >
          New Conversation
        </Button>
      </div>

      {/* Main Two-Column Box */}
      <div className="flex-1 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-0">
        {/* Left Column: Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/40 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Threads ({conversations.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2 space-y-1">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                <span className="text-xs">Loading conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No chats yet</p>
                <p className="text-[11px] text-slate-400">
                  Click &ldquo;New Conversation&rdquo; to message any store or get platform assistance.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const partnerName = getChatPartnerName(conv);
                const isSelected = activeConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-white/20 border-white/30 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-brand-600'
                      }`}
                    >
                      {conv.type === 'STORE_CUSTOMER' ? (
                        <StoreIcon className="w-5 h-5" />
                      ) : (
                        <Headphones className="w-5 h-5 text-indigo-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate">{partnerName}</h4>
                        <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                          {new Date(conv.lastMessageAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
                        {conv.lastMessage?.content || 'Conversation started'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Partner Header */}
              <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 border border-brand-500/20 flex items-center justify-center font-bold">
                    {activeConversation.type === 'STORE_CUSTOMER' ? (
                      <StoreIcon className="w-5 h-5" />
                    ) : (
                      <Headphones className="w-5 h-5 text-indigo-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {getChatPartnerName(activeConversation)}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      {activeConversation.type === 'STORE_CUSTOMER'
                        ? 'Direct Store Owner Communications'
                        : 'Official Platform Support Channel'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/20 text-xs">
                {messagesLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm mx-auto">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Start your conversation
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Ask questions regarding products, delivery timing, or custom requirements.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-1 px-1">
                          {isMe ? 'You' : m.sender?.name || 'Merchant'}
                        </span>
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-medium shadow-sm ${
                            isMe
                              ? 'bg-brand-600 text-white rounded-br-none shadow-brand-600/20'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Write a message to ${getChatPartnerName(activeConversation)}...`}
                  disabled={isSending}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="p-3 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-md shadow-brand-600/20 transition-all shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Select a Conversation
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose an existing chat thread from the left or start a new conversation with any verified merchant.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Start New Conversation
                </h3>
                <p className="text-xs text-slate-500">Select a recipient to initiate messaging</p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Platform Helpdesk Option */}
            <button
              onClick={startPlatformChat}
              className="w-full text-left p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 hover:border-indigo-500 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Platform Admin Helpdesk
                  </h4>
                  <p className="text-[11px] text-slate-500">Assistance with orders, billing, and platform questions</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600">Connect</span>
            </button>

            {/* Merchant Stores List */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                Marketplace Merchants
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {availableStores.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => startStoreChat(st.id)}
                    className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600">
                        {st.name}
                      </h5>
                      <p className="text-[11px] text-slate-500">{st.category || 'Store Merchant'}</p>
                    </div>
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 px-3 py-1 rounded-xl">
                      Message
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
