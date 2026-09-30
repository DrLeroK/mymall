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
  User,
  Shield,
  Clock,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChatConversation {
  id: number;
  type: 'STORE_CUSTOMER' | 'ADMIN_STORE' | 'ADMIN_CUSTOMER' | 'DISPUTE';
  store?: { id: number; name: string; slug: string; logoUrl?: string };
  customer?: { id: number; name: string; email: string };
  admin?: { id: number; name: string; email: string };
  order?: { id: number; orderNumber: string; totalAmount: number; status: string };
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

export default function MerchantChatPage() {
  const { user, storeId } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  useEffect(() => {
    loadConversations();
  }, [storeId]);

  // Real-time socket message handler
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: { conversationId: number; message: Message }) => {
      if (activeConversation && activeConversation.id === data.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === data.conversationId) {
            return {
              ...c,
              lastMessage: { content: data.message.content, createdAt: data.message.createdAt },
              lastMessageAt: data.message.createdAt,
            };
          }
          return c;
        })
      );
    };

    socket.on('chat:message', handleNewMessage);
    return () => {
      socket.off('chat:message', handleNewMessage);
    };
  }, [socket, activeConversation]);

  const selectConversation = async (conversation: ChatConversation) => {
    setActiveConversation(conversation);
    setMessagesLoading(true);

    if (socket) {
      socket.emit('chat:join', { conversationId: conversation.id });
    }

    try {
      const res = await ApiClient.get(`/chat/conversations/${conversation.id}/messages`);
      if (res.success && Array.isArray(res.messages)) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation || isSending) return;

    const content = input.trim();
    setInput('');
    setIsSending(true);

    try {
      const res: any = await ApiClient.post(`/chat/conversations/${activeConversation.id}/messages`, {
        content,
      });

      const newMsg: Message | undefined = res.message || res.chatMessage;
      if (res.success && newMsg && typeof newMsg === 'object') {
        setMessages((prev) => [...prev, newMsg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  lastMessage: { content: newMsg.content, createdAt: newMsg.createdAt },
                  lastMessageAt: newMsg.createdAt,
                }
              : c
          )
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleStartAdminSupport = async () => {
    try {
      const res = await ApiClient.post('/chat/conversations', {
        type: 'ADMIN_STORE',
        storeId,
      });

      if (res.success && res.conversation) {
        const existing = conversations.find((c) => c.id === res.conversation.id);
        if (!existing) {
          setConversations([res.conversation, ...conversations]);
        }
        selectConversation(res.conversation);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate admin support chat');
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = search.toLowerCase();
    if (c.type === 'STORE_CUSTOMER') {
      return (
        c.customer?.name.toLowerCase().includes(q) ||
        c.customer?.email.toLowerCase().includes(q) ||
        c.lastMessage?.content.toLowerCase().includes(q)
      );
    }
    return (
      'platform support admin'.includes(q) ||
      c.lastMessage?.content?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Store Communications & Support
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time chat with customers inquiring about items, orders, and direct support with platform admins.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Headphones className="w-4 h-4 text-brand-500" />}
          onClick={handleStartAdminSupport}
        >
          Message Platform Admin
        </Button>
      </div>

      <div className="h-[750px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Column: Conversation Sidebar */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col ${
            activeConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <div className="flex items-center justify-center p-8 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-xs font-medium">Loading conversations...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">No conversations yet</p>
                <p>When customers message your store or orders, conversations will appear here.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const isCustomer = conv.type === 'STORE_CUSTOMER';

                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/40 border-r-2 border-brand-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      {isCustomer ? (
                        conv.customer?.name ? conv.customer.name[0].toUpperCase() : <User className="w-5 h-5" />
                      ) : (
                        <Shield className="w-5 h-5 text-indigo-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {isCustomer
                            ? conv.customer?.name || 'Customer'
                            : 'Platform Support (Super Admin)'}
                        </h4>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      {conv.order && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 mb-1">
                          <Package className="w-3 h-3" />
                          <span>Order #{conv.order.orderNumber}</span>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-500 truncate">
                        {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/40 ${
            !activeConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {activeConversation.type === 'STORE_CUSTOMER' ? (
                      activeConversation.customer?.name ? activeConversation.customer.name[0].toUpperCase() : <User className="w-5 h-5" />
                    ) : (
                      <Shield className="w-5 h-5 text-indigo-500" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {activeConversation.type === 'STORE_CUSTOMER'
                        ? activeConversation.customer?.name || 'Customer'
                        : 'Platform Support (Super Admin)'}
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {activeConversation.type === 'STORE_CUSTOMER' ? 'Customer' : 'Super Admin'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {activeConversation.type === 'STORE_CUSTOMER'
                        ? activeConversation.customer?.email || 'Store customer'
                        : 'Official SaaS Administration Channel'}
                    </p>
                  </div>
                </div>

                {activeConversation.order && (
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 block">Related Order</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      #{activeConversation.order.orderNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Messages Body */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-xs">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p>No messages yet. Send a greeting to start this conversation.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {!isMe && (
                          <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1">
                            {m.sender?.name || (activeConversation.type === 'ADMIN_STORE' ? 'Super Admin' : 'Customer')}
                          </span>
                        )}
                        <div
                          className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-brand-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
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

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isSending}
                  rightIcon={isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Select a conversation
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Choose a customer conversation from the list to reply to order inquiries, or start a direct conversation with platform support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
