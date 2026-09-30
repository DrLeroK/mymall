'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import {
  MessageSquare,
  X,
  Send,
  Minimize2,
  Store as StoreIcon,
  ShieldAlert,
  ChevronLeft,
  Headphones,
  Plus,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { ApiClient } from '@/lib/api';

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
  tagline?: string;
  category?: string;
}

export function LiveChatDrawer() {
  const { user, isAuthenticated, role } = useAuth();
  const { socket } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [availableStores, setAvailableStores] = useState<AvailableStore[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [view, setView] = useState<'list' | 'chat' | 'new_store_chat'>('list');

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat without scrolling the window
  useEffect(() => {
    if (messagesContainerRef.current && view === 'chat') {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, view]);

  // Fetch conversations when drawer opens & user is authenticated
  const loadConversations = async () => {
    if (!ApiClient.getAccessToken()) return;
    try {
      setIsLoading(true);
      const res = await ApiClient.get('/chat/conversations');
      if (res.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available stores to start a chat with
  const loadAvailableStores = async () => {
    try {
      const res = await ApiClient.get('/storefront/search/all?limit=20');
      if (res.success && Array.isArray(res.stores)) {
        setAvailableStores(res.stores);
      }
    } catch (err) {
      // Fallback demo stores if offline
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
    if (isOpen && isAuthenticated) {
      loadConversations();
      loadAvailableStores();
    }
  }, [isOpen, isAuthenticated]);

  // Socket listeners for real-time messages
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

  // Open an existing conversation
  const selectConversation = async (conv: ChatConversation) => {
    setActiveConversation(conv);
    setView('chat');
    setIsLoading(true);
    try {
      const res = await ApiClient.get(`/chat/conversations/${conv.id}/messages`);
      if (res.success && Array.isArray(res.messages)) {
        setMessages(res.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start or open conversation with a specific Store Owner
  const startStoreChat = async (storeId: number) => {
    setIsLoading(true);
    try {
      const res = await ApiClient.post('/chat/conversations', {
        type: 'STORE_CUSTOMER',
        storeId,
      });
      if (res.success && res.conversation) {
        await selectConversation(res.conversation);
      }
    } catch (err) {
      console.error('Failed to start store conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Start or open conversation with Platform Admin Support
  const startAdminChat = async () => {
    setIsLoading(true);
    try {
      const isStoreOwner = role === 'STORE_OWNER' || role === 'STORE_STAFF';
      const convType = isStoreOwner ? 'ADMIN_STORE' : 'ADMIN_CUSTOMER';
      const payload: any = { type: convType };
      if (isStoreOwner && user?.storeId) {
        payload.storeId = user.storeId;
      }

      const res = await ApiClient.post('/chat/conversations', payload);
      if (res.success && res.conversation) {
        await selectConversation(res.conversation);
      }
    } catch (err) {
      console.error('Failed to start admin conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message in active conversation
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

  // Helper to format conversation title
  const getConversationTitle = (conv: ChatConversation) => {
    if (conv.type === 'STORE_CUSTOMER') {
      return conv.store?.name ? `Store: ${conv.store.name}` : 'Store Owner Support';
    }
    if (conv.type === 'ADMIN_STORE') {
      return `Platform Support (Admin & Store: ${conv.store?.name || ''})`;
    }
    if (conv.type === 'ADMIN_CUSTOMER') {
      return 'MyMall Platform Helpdesk';
    }
    return 'Dispute Resolution Chat';
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-5 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <span>Live Chat & Support</span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in zoom-in-95">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view !== 'list' && (
                <button
                  onClick={() => {
                    setView('list');
                    loadConversations();
                  }}
                  className="p-1 -ml-1 text-white/80 hover:text-white rounded-lg transition-colors"
                  title="Back to conversation list"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h4 className="text-sm font-black leading-tight">
                  {view === 'chat' && activeConversation
                    ? getConversationTitle(activeConversation)
                    : view === 'new_store_chat'
                    ? 'Select Store to Message'
                    : 'MyMall Live Communications'}
                </h4>
                <p className="text-xs text-brand-100 flex items-center gap-1.5 mt-0.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Direct Customer & Merchant Channel
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Not Authenticated Warning */}
          {!isAuthenticated ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 dark:bg-slate-950">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600">
                <Headphones className="w-7 h-7" />
              </div>
              <div>
                <h5 className="text-base font-bold text-slate-900 dark:text-white">Authentication Required</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Sign in to chat directly with verified store owners or get real-time order assistance from platform support.
                </p>
              </div>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all text-center"
              >
                Sign In to Start Chat
              </Link>
            </div>
          ) : view === 'list' ? (
            /* ================= Conversations List View ================= */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
              {/* Quick Actions / New Chat Triggers */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setView('new_store_chat')}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-bold text-xs transition-colors"
                >
                  <StoreIcon className="w-4 h-4 text-brand-600" />
                  <span>Chat with Store</span>
                </button>
                <button
                  onClick={startAdminChat}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors"
                >
                  <Headphones className="w-4 h-4 text-indigo-600" />
                  <span>Platform Help</span>
                </button>
              </div>

              {/* Conversation Threads */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                  Active Conversations
                </div>

                {isLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                    <span className="text-xs">Loading conversations...</span>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl my-2">
                    <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No chat conversations yet.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Click &ldquo;Chat with Store&rdquo; above to talk directly with any merchant.
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className="w-full text-left p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm transition-all flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 text-brand-600">
                        {conv.type === 'STORE_CUSTOMER' ? (
                          <StoreIcon className="w-5 h-5" />
                        ) : (
                          <Headphones className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {getConversationTitle(conv)}
                          </h5>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400">
                            {new Date(conv.lastMessageAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                          {conv.lastMessage?.content || 'Started new conversation'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : view === 'new_store_chat' ? (
            /* ================= Store Selection View ================= */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Select an Ethiopian merchant to discuss product stock, custom orders, or delivery timing:
                </p>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                {availableStores.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => startStoreChat(st.id)}
                    className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 shadow-sm transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600">
                        {st.name}
                      </h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{st.category || 'Verified Marketplace Merchant'}</p>
                    </div>
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 px-3 py-1 rounded-xl">
                      Chat
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ================= Active Chat View ================= */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
              {/* Messages Body */}
              <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {isLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                    <span>Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-6 text-center text-slate-600 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs font-semibold">Start the conversation!</p>
                    <p className="text-[11px] mt-1">Send a message below to connect with this merchant.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mb-0.5 px-1">
                          {isMe ? 'You' : m.sender?.name || 'Store Agent'}
                        </span>
                        <div
                          className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm font-medium'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5 px-1">
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

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isSending}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-md shadow-brand-600/20 transition-all shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
