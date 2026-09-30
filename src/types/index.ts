export type Role = 'SUPER_ADMIN' | 'STORE_OWNER' | 'STORE_STAFF' | 'CUSTOMER';

export type StaffRole = 'MANAGER' | 'CASHIER' | 'INVENTORY_CLERK';

export type StoreStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'INACTIVE';

export type BillingCycle = 'MONTHLY' | 'THREE_MONTHS' | 'SIX_MONTHS' | 'YEARLY';

export type PaymentStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type OrderStatus =
  | 'PENDING'
  | 'AWAITING_VERIFICATION'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderType = 'DELIVERY' | 'PICKUP';

export type PaymentProofStatus = 'NONE' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export type POSPaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'CARD' | 'SPLIT';

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export type DisputeType = 'ORDER_ISSUE' | 'PAYMENT_DISPUTE' | 'STORE_POLICY' | 'PLATFORM_REPORT';

export type ConversationType = 'ADMIN_STORE' | 'STORE_CUSTOMER' | 'ADMIN_CUSTOMER' | 'DISPUTE';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  staffRole?: StaffRole | null;
  avatarUrl?: string | null;
  storeId?: number | null;
  isEmailVerified: boolean;
  ownedStores?: Store[];
  assignedStore?: Store | null;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  category: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  currency: string;
  taxRate: number | string;
  returnPolicy?: string | null;
  businessHours?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  hideOutOfStock: boolean;
  status: StoreStatus;
  ownerId: number;
  owner?: User;
  currentPlanId?: number | null;
  plan?: SubscriptionPlan | null;
  subscriptionEndsAt?: string | null;
  bankAccounts?: StoreBankAccount[];
  hasChapaConfigured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string | null;
  monthlyPrice: number | string;
  threeMonthsPrice: number | string;
  sixMonthsPrice: number | string;
  yearlyPrice: number | string;
  maxProducts: number;
  maxStaff: number;
  searchRankBoost: number;
  analyticsLevel: string; // 'BASIC' | 'ADVANCED' | 'PRO'
  customDomainAllowed: boolean;
  isActive: boolean;
}

export interface PlatformBankAccount {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string | null;
  qrCodeUrl?: string | null;
  isActive: boolean;
}

export interface StoreBankAccount {
  id: number;
  storeId: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string | null;
  qrCodeUrl?: string | null;
  isActive: boolean;
}

export interface ProductCategory {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  products?: Product[];
}

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  price?: number | string | null;
  stockQuantity: number;
  options: string; // JSON string e.g. {"color": "Red", "size": "XL"}
}

export interface Product {
  id: number;
  storeId: number;
  store?: Store;
  categoryId?: number | null;
  category?: ProductCategory | null;
  name: string;
  slug: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  costPrice: number | string;
  sellingPrice: number | string;
  compareAtPrice?: number | string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
  images: string; // JSON array of string URLs
  isActive: boolean;
  hasVariants: boolean;
  variants?: ProductVariant[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  variantId?: number | null;
  variant?: ProductVariant | null;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
}

export interface Order {
  id: number;
  orderNumber: string;
  storeId: number;
  store?: Store;
  customerId?: number | null;
  customer?: User | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: OrderType;
  shippingAddress?: string | null;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  locationPermissionGranted: boolean;
  deliveryInstructions?: string | null;
  pickupStoreAddress?: string | null;
  subtotal: number | string;
  taxAmount: number | string;
  shippingCost: number | string;
  totalAmount: number | string;
  status: OrderStatus;
  paymentMethod: string;
  paymentProofUrl?: string | null;
  paymentProofStatus: PaymentProofStatus;
  paymentProofNotes?: string | null;
  chapaTxRef?: string | null;
  verifiedById?: number | null;
  verifiedBy?: User | null;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface POSSaleItem {
  id: number;
  posSaleId: number;
  productId: number;
  product: Product;
  variantId?: number | null;
  variant?: ProductVariant | null;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
}

export interface POSSale {
  id: number;
  receiptNumber: string;
  storeId: number;
  cashierId: number;
  cashier: User;
  customerName?: string | null;
  customerPhone?: string | null;
  totalAmount: number | string;
  discountAmount: number | string;
  taxAmount: number | string;
  netAmount: number | string;
  paymentMethod: POSPaymentMethod;
  paymentDetails?: string | null;
  offlineId?: string | null;
  notes?: string | null;
  items: POSSaleItem[];
  createdAt: string;
}

export interface StoreSubscription {
  id: number;
  storeId: number;
  store?: Store;
  planId: number;
  plan?: SubscriptionPlan;
  billingCycle: BillingCycle;
  amount: number | string;
  paymentMethod: string;
  paymentProofUrl?: string | null;
  chapaTxRef?: string | null;
  status: PaymentStatus;
  startDate?: string | null;
  endDate?: string | null;
  adminNotes?: string | null;
  reviewedById?: number | null;
  reviewedBy?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  storeId: number;
  store?: Store;
  subscriptionId?: number | null;
  subscription?: StoreSubscription | null;
  amount: number | string;
  currency: string;
  status: string;
  paidAt: string;
  createdAt: string;
}

export interface Review {
  id: number;
  storeId?: number;
  productId?: number;
  customerId?: number | null;
  customer?: User | null;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface SiteReview {
  id: number;
  userId?: number | null;
  user?: User | null;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title?: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreReview {
  id: number;
  storeId: number;
  customerId?: number | null;
  customer?: User | null;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface Dispute {
  id: number;
  disputeNumber: string;
  type: DisputeType;
  status: DisputeStatus;
  title: string;
  description: string;
  resolutionNotes?: string | null;
  reporterId: number;
  reporter?: User;
  storeId?: number | null;
  store?: Store | null;
  orderId?: number | null;
  order?: Order | null;
  resolvedById?: number | null;
  resolvedBy?: User | null;
  conversation?: ChatConversation | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  sender?: User;
  content: string;
  attachmentUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: number;
  type: ConversationType;
  storeId?: number | null;
  store?: Store | null;
  customerId?: number | null;
  customer?: User | null;
  adminId?: number | null;
  admin?: User | null;
  orderId?: number | null;
  order?: Order | null;
  disputeId?: number | null;
  dispute?: Dispute | null;
  lastMessageAt: string;
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface StaffInvite {
  id: number;
  storeId: number;
  store?: Store;
  email: string;
  assignedRole: StaffRole;
  inviteCode: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  invitedById: number;
  invitedBy?: User;
  expiresAt: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: number;
  userId: number;
  label: string;
  recipientName: string;
  recipientPhone: string;
  streetAddress: string;
  city?: string | null;
  subcity?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  deliveryInstructions?: string | null;
  isDefault: boolean;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
  unitPrice: number;
}
