'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { ApiClient } from '@/lib/api';

interface SocketNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'inventory' | 'billing' | 'chat';
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: SocketNotification[];
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, role, storeId } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);

  // Load existing notifications from backend on authentication
  useEffect(() => {
    if (!user?.id) return;

    ApiClient.get('/notifications')
      .then((res) => {
        if (res.success && Array.isArray(res.alerts)) {
          const mapped: SocketNotification[] = res.alerts.map((a: any) => ({
            id: String(a.id),
            title: a.title,
            message: a.message,
            type: (a.type || '').toLowerCase().includes('order')
              ? 'order'
              : (a.type || '').toLowerCase().includes('stock')
              ? 'inventory'
              : (a.type || '').toLowerCase().includes('billing') || (a.type || '').toLowerCase().includes('subscription')
              ? 'billing'
              : (a.type || '').toLowerCase().includes('message')
              ? 'chat'
              : 'order',
            timestamp: a.createdAt,
          }));
          setNotifications(mapped);
        }
      })
      .catch(() => {});
  }, [user?.id, role, storeId]);

  useEffect(() => {
    // Dynamically resolve socket URL from environment variable or port 5001 fallback
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== 'undefined'
        ? window.location.port === '3000'
          ? `${window.location.protocol}//${window.location.hostname}:5001`
          : window.location.origin
        : 'http://localhost:5001');

    console.log(`🔌 Initializing Socket.io connection to: ${socketUrl}`);

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ Connected to MyMall real-time socket:', socketInstance.id);

      // Join rooms according to user role
      if (role === 'SUPER_ADMIN') {
        socketInstance.emit('join:superadmin');
      }
      if ((role === 'STORE_OWNER' || role === 'STORE_STAFF') && storeId) {
        socketInstance.emit('join:store', storeId);
      }
      if (user?.id) {
        socketInstance.emit('join:user', user.id);
      }
    });

    // If socket is already connected when user auth resolves
    if (socketInstance.connected) {
      if (role === 'SUPER_ADMIN') {
        socketInstance.emit('join:superadmin');
      }
      if ((role === 'STORE_OWNER' || role === 'STORE_STAFF') && storeId) {
        socketInstance.emit('join:store', storeId);
      }
      if (user?.id) {
        socketInstance.emit('join:user', user.id);
      }
    }

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time event listeners
    socketInstance.on('order:new', (payload: any) => {
      // ONLY notify Store Owner or Store Staff - never Admins or Customers
      if (role !== 'STORE_OWNER' && role !== 'STORE_STAFF') {
        return;
      }
      addNotification({
        id: Math.random().toString(),
        title: 'New Online Order!',
        message: `Order #${payload.order?.orderNumber || 'New'} received from ${payload.order?.customerName || 'Customer'}.`,
        type: 'order',
        timestamp: new Date().toISOString(),
      });
    });

    socketInstance.on('order:created', (payload: any) => {
      addNotification({
        id: Math.random().toString(),
        title: 'Order Placed Successfully!',
        message: `Your order #${payload.order?.orderNumber} has been received and is being processed.`,
        type: 'order',
        timestamp: new Date().toISOString(),
      });
    });

    socketInstance.on('order:status_updated', (payload: any) => {
      addNotification({
        id: Math.random().toString(),
        title: `Order #${payload.orderNumber || ''} Updated`,
        message: `Status changed to ${payload.status}.`,
        type: 'order',
        timestamp: new Date().toISOString(),
      });
    });

    socketInstance.on('payment:proof_submitted', (payload: any) => {
      addNotification({
        id: Math.random().toString(),
        title: 'Payment Proof Uploaded',
        message: `Customer uploaded transfer screenshot for Order #${payload.orderNumber}.`,
        type: 'order',
        timestamp: new Date().toISOString(),
      });
    });

    socketInstance.on('payment:rejected', (payload: any) => {
      addNotification({
        id: Math.random().toString(),
        title: 'Payment Proof Rejected',
        message: `Your proof for Order #${payload.orderNumber} was not accepted: ${payload.notes || 'Please re-upload'}.`,
        type: 'order',
        timestamp: new Date().toISOString(),
      });
    });

    socketInstance.on('subscription:approved', (payload: any) => {
      addNotification({
        id: Math.random().toString(),
        title: 'SaaS Plan Activated!',
        message: `Your ${payload.planName || ''} subscription is now active! Invoice #${payload.invoiceNumber || ''}.`,
        type: 'billing',
        timestamp: new Date().toISOString(),
      });
    });

    socketInstance.on('alert:low_stock', (payload: any) => {
      addNotification({
        id: Math.random().toString(),
        title: 'Low Stock Alert!',
        message: `Product stock dropped below threshold: ${payload.productName || 'Item'}`,
        type: 'inventory',
        timestamp: new Date().toISOString(),
      });
    });

    socketInstance.on('billing:new_verification_request', (payload: any) => {
      addNotification({
        id: Math.random().toString(),
        title: 'New Subscription Proof',
        message: `Store ${payload.storeName || ''} submitted a SaaS billing payment screenshot for review.`,
        type: 'billing',
        timestamp: new Date().toISOString(),
      });
    });

    socketInstance.on('chat:message', (payload: any) => {
      // Don't notify the sender of their own message
      if (payload.senderId === user?.id || payload.sender?.id === user?.id) {
        return;
      }
      addNotification({
        id: Math.random().toString(),
        title: `Message from ${payload.sender?.name || 'Someone'}`,
        message: payload.content?.slice(0, 80) || 'Sent a message',
        type: 'chat',
        timestamp: new Date().toISOString(),
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id, role, storeId]);

  const addNotification = (notif: SocketNotification) => {
    setNotifications((prev) => [notif, ...prev.slice(0, 9)]);
  };

  const clearNotifications = () => {
    setNotifications([]);
    ApiClient.patch('/notifications/read-all', {}).catch(() => {});
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
