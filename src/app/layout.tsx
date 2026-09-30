import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '@/context/I18nContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { SocketProvider } from '@/context/SocketContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { LiveChatDrawer } from '@/components/chat/LiveChatDrawer';
import { NotificationBanner } from '@/components/common/NotificationBanner';

export const metadata: Metadata = {
  title: 'MyMall - Multi-Tenant E-Commerce Platform & POS',
  description:
    'Production-grade multi-tenant e-commerce platform engine with screenshot bank transfer verification, POS integration, and real-time inventory sync.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedTheme = localStorage.getItem('theme');
                if (storedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-slate-50 dark:bg-[#090e17] text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <I18nProvider>
            <AuthProvider>
              <CartProvider>
                <SocketProvider>
                  {/* Real-time Socket.io popups */}
                  <NotificationBanner />
                  {/* Navigation Bar */}
                  <Navbar />
                  {/* Main Page Content */}
                  <main className="flex-1 w-full">{children}</main>
                  {/* Live Chat Drawer */}
                  <LiveChatDrawer />
                  {/* Footer */}
                  <Footer />
                </SocketProvider>
              </CartProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
