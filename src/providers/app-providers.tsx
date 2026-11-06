'use client';

import React from 'react';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { I18nProvider } from '@/context/I18nContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { SocketProvider } from '@/context/SocketContext';
import { NotificationBanner } from '@/components/common/NotificationBanner';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <QueryProvider>
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <SocketProvider>
                <NotificationBanner />
                {children}
              </SocketProvider>
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
