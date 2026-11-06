import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { LiveChatDrawer } from '@/components/chat/LiveChatDrawer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <LiveChatDrawer />
      <Footer />
    </div>
  );
}
