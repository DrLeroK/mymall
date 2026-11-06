import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  CreditCard,
  MessageSquare,
  Building2,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Sliders,
  DollarSign,
  Receipt,
  Store,
  FolderTree,
  Banknote,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  roles?: string[];
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/admin', icon: LayoutDashboard },
  { title: 'Subscription Incomes', href: '/admin/subscriptions', icon: Banknote },
  { title: 'Store Owners', href: '/admin/merchants', icon: Users },
  { title: 'Verifications', href: '/admin/verifications', icon: CheckCircle2 },
  { title: 'Bank Accounts', href: '/admin/bank-accounts', icon: CreditCard },
  { title: 'Disputes', href: '/admin/disputes', icon: ShieldAlert },
  { title: 'Subscription Plans', href: '/admin/plans', icon: Sliders },
  { title: 'Platform Reviews', href: '/admin/reviews', icon: FileText },
  { title: 'Support Chat', href: '/admin/chat', icon: MessageSquare },
];

export const MERCHANT_NAV_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/merchant', icon: LayoutDashboard },
  { title: 'Products & Stock', href: '/merchant/products', icon: Package },
  { title: 'Categories', href: '/merchant/categories', icon: FolderTree },
  { title: 'Orders & Dispatch', href: '/merchant/orders', icon: ShoppingBag },
  { title: 'Staff & Cashiers', href: '/merchant/staff', icon: Users },
  { title: 'Customer Chat', href: '/merchant/chat', icon: MessageSquare },
  { title: 'POS Register', href: '/pos', icon: Receipt },
  { title: 'SaaS Billing', href: '/merchant/billing', icon: CreditCard },
  { title: 'Store Settings', href: '/merchant/settings', icon: Settings },
];

export const CUSTOMER_NAV_ITEMS: NavItem[] = [
  { title: 'My Dashboard', href: '/customer', icon: LayoutDashboard },
  { title: 'Orders History', href: '/customer#orders', icon: ShoppingBag },
  { title: 'Merchant Chat', href: '/customer/chat', icon: MessageSquare },
  { title: 'Marketplace', href: '/explore', icon: Store },
];
