'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { ApiClient } from '@/lib/api';
import { Store, StoreBankAccount } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ShoppingCart,
  Trash2,
  Truck,
  Store as StoreIcon,
  CreditCard,
  Upload,
  MapPin,
  Map,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { MapPickerModal } from '@/components/checkout/MapPickerModal';

export default function CartAndCheckoutPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, subtotal, storeId } = useCart();
  const { user } = useAuth();

  const [store, setStore] = useState<Store | null>(null);
  const [bankAccounts, setBankAccounts] = useState<StoreBankAccount[]>([]);
  const [copiedBankId, setCopiedBankId] = useState<number | null>(null);

  // Form State
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER_SCREENSHOT' | 'CHAPA'>(
    'BANK_TRANSFER_SCREENSHOT'
  );
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [chapaError, setChapaError] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phone and Contact Validation Helpers
  const isEthiopianPhoneValid = (phone: string) => {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return (
      /^0[97]\d{8}$/.test(cleaned) ||
      /^\+251[97]\d{8}$/.test(cleaned) ||
      /^251[97]\d{8}$/.test(cleaned) ||
      /^[97]\d{8}$/.test(cleaned)
    );
  };

  const normalizePhone = (phone: string) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (/^0[97]\d{8}$/.test(cleaned)) return cleaned;
    if (/^\+251[97]\d{8}$/.test(cleaned)) return `0${cleaned.slice(4)}`;
    if (/^251[97]\d{8}$/.test(cleaned)) return `0${cleaned.slice(3)}`;
    if (/^[97]\d{8}$/.test(cleaned)) return `0${cleaned}`;
    return cleaned;
  };

  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const isChapaEligible = Boolean(
    customerName.trim().length >= 2 &&
    isEmailValid(customerEmail) &&
    isEthiopianPhoneValid(customerPhone)
  );

  const handleSelectChapa = () => {
    if (!store?.hasChapaConfigured) return;
    if (!isChapaEligible) {
      setChapaError('Please fill in your full name, valid email, and a valid Ethiopian phone (09... or 07...) above before selecting Chapa.');
      return;
    }
    setChapaError(null);
    setPaymentMethod('CHAPA');
  };

  // Prefill customer details when user is authenticated
  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Load store details for currency, tax rate, and bank accounts
  useEffect(() => {
    if (items.length === 0) return;
    const targetStore = items[0]?.product?.store;
    const storeIdentifier = targetStore?.slug || (targetStore?.id ? String(targetStore.id) : null) || (storeId ? String(storeId) : 'urbantrend');

    ApiClient.get(`/storefront/${storeIdentifier}`)
      .then((res) => {
        if (res.success && res.store) {
          setStore(res.store);
          if (!res.store.hasChapaConfigured) {
            setPaymentMethod('BANK_TRANSFER_SCREENSHOT');
          }
        }
      })
      .catch(() => {});

    ApiClient.get(`/storefront/${storeIdentifier}/bank-accounts`)
      .then((res) => {
        if (res.success && res.bankAccounts) {
          setBankAccounts(res.bankAccounts);
        }
      })
      .catch(() => {});
  }, [items, storeId]);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        alert('Could not retrieve GPS coordinates. Please grant location permissions.');
        setGpsLoading(false);
      }
    );
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  // Calculations
  const taxRate = store?.taxRate ? Number(store.taxRate) / 100 : 0.15;
  const taxAmount = subtotal * taxRate;
  const shippingCost = orderType === 'DELIVERY' ? 150 : 0;
  const totalAmount = subtotal + taxAmount + shippingCost;
  const currency = store?.currency || 'ETB';

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      alert('Please fill in your contact information (name, email, and phone number).');
      return;
    }

    if (!isEmailValid(customerEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (paymentMethod === 'CHAPA') {
      if (!isEthiopianPhoneValid(customerPhone)) {
        alert('To checkout with Chapa, please enter a valid 10-digit Ethiopian mobile number (09xxxxxxxx or 07xxxxxxxx).');
        return;
      }
    }

    if (orderType === 'DELIVERY' && !shippingAddress.trim()) {
      alert('Please enter your shipping street address or pick your delivery location on the map.');
      return;
    }

    const normalizedCustomerPhone = normalizePhone(customerPhone);

    setIsSubmitting(true);
    try {
      // 1. Create order via checkout API
      const checkoutPayload = {
        storeId: storeId || 1,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: normalizedCustomerPhone,
        orderType,
        shippingAddress: orderType === 'DELIVERY' ? shippingAddress : null,
        deliveryLatitude: gpsLocation?.lat || null,
        deliveryLongitude: gpsLocation?.lng || null,
        locationPermissionGranted: !!gpsLocation,
        deliveryInstructions: orderType === 'DELIVERY' ? deliveryInstructions : null,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant?.id || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const res = await ApiClient.post('/orders/checkout', checkoutPayload);

      if (res.success && res.order) {
        const orderId = res.order.id;

        // 2. If payment is screenshot and customer uploaded a file, upload screenshot
        if (paymentMethod === 'BANK_TRANSFER_SCREENSHOT' && screenshotFile) {
          const formData = new FormData();
          formData.append('screenshot', screenshotFile);
          formData.append('notes', 'Bank transfer receipt uploaded at checkout');

          await ApiClient.post(`/orders/${orderId}/payment-proof`, formData);
        }

        // 3. If Chapa payment checkout URL is provided, redirect to gateway
        const chapaUrl = res.checkoutUrl || res.chapaCheckout?.checkoutUrl;
        if (paymentMethod === 'CHAPA' && chapaUrl) {
          clearCart();
          window.location.href = chapaUrl;
          return;
        }

        clearCart();
        router.push(`/orders/${orderId}`);
      } else {
        alert(res.message || 'Checkout failed. Please verify your order information.');
      }
    } catch (e: any) {
      alert(e.message || 'Checkout encountered an error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-20 p-12 text-center space-y-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          {t('checkout.emptyCart')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Discover unique products from independent merchants across the marketplace.
        </p>
        <div className="pt-2">
          <Link href="/explore">
            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t('checkout.startShopping')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('checkout.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fulfill your order from {items[0]?.product.store?.name || 'Store'}.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Cart Items & Checkout Form (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Cart Items List */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Selected Items ({items.length})
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <img
                    src={getImageUrl(item.product.images)}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.product.name}
                    </h4>
                    {item.variant && (
                      <span className="text-xs text-brand-600 font-semibold block">
                        Option: {item.variant.name}
                      </span>
                    )}
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {formatPrice(item.unitPrice, currency)}
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)
                      }
                      className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)
                      }
                      className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product.id, item.variant?.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Form */}
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
            {/* 1. Fulfillment Method */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-500" />
                <span>{t('checkout.deliveryMethod')}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    orderType === 'DELIVERY'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('checkout.delivery')}
                    </span>
                    <Truck className="w-4 h-4 text-brand-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Direct delivery to your doorstep (150 ETB)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('PICKUP')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    orderType === 'PICKUP'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('checkout.pickup')}
                    </span>
                    <StoreIcon className="w-4 h-4 text-brand-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Free pickup at store location
                  </p>
                </button>
              </div>

              {/* Delivery Details */}
              {orderType === 'DELIVERY' && (
                <div className="space-y-4 pt-2">
                  <Input
                    label={t('checkout.shippingAddress')}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="e.g. Bole Atlas, Next to Edna Mall, House #42"
                    required
                  />

                  <Input
                    label={t('checkout.deliveryInstructions')}
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="e.g. Ring bell at blue gate, 2nd floor apartment 4B"
                  />

                  {/* GPS & Map Location Selection */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {gpsLocation ? t('checkout.gpsCaptured') : 'Pinpoint Delivery Location'}
                        </p>
                        {gpsLocation ? (
                          <p className="text-[10px] text-emerald-600 font-mono font-bold">
                            Coordinates: {gpsLocation.lat.toFixed(5)}, {gpsLocation.lng.toFixed(5)}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500">
                            Use current device GPS or pick your spot on the interactive map
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleCaptureGps}
                        isLoading={gpsLoading}
                        className="text-xs"
                      >
                        {gpsLocation ? 'Update GPS' : 'Current GPS'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsMapModalOpen(true)}
                        className="gap-1.5 text-xs"
                      >
                        <Map className="w-3.5 h-3.5 text-brand-500" />
                        <span>Pick on Map</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Customer Contact Info */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t('checkout.contactInfo')}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  Required for delivery & payment
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('checkout.fullName')}
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (chapaError) setChapaError(null);
                  }}
                  placeholder="e.g. Abebe Bikila"
                  required
                />
                <Input
                  label={t('checkout.email')}
                  type="email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    if (chapaError) setChapaError(null);
                  }}
                  placeholder="e.g. abebe@gmail.com"
                  required
                />
              </div>

              <div>
                <Input
                  label={t('checkout.phone')}
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (chapaError) setChapaError(null);
                  }}
                  placeholder="e.g. 0912345678 or 0712345678"
                  required
                />
                <div className="flex items-center justify-between mt-1.5 px-0.5 text-[11px]">
                  <span className="text-slate-400">Ethiopian mobile format (09... or 07...)</span>
                  {customerPhone ? (
                    isEthiopianPhoneValid(customerPhone) ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Valid mobile number
                      </span>
                    ) : (
                      <span className="text-rose-500 font-medium">
                        Must be 10 digits starting with 09 or 07
                      </span>
                    )
                  ) : null}
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-500" />
                <span>{t('checkout.paymentMethod')}</span>
              </h3>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('BANK_TRANSFER_SCREENSHOT');
                    setChapaError(null);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'BANK_TRANSFER_SCREENSHOT'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 shadow-sm ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    Bank Transfer + Screenshot
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                    CBE, Telebirr, Bank of Abyssinia
                  </span>
                </button>

                {store?.hasChapaConfigured ? (
                  <button
                    type="button"
                    onClick={handleSelectChapa}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      paymentMethod === 'CHAPA'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm ring-2 ring-emerald-500/20'
                        : isChapaEligible
                        ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        Chapa Instant Gateway
                      </span>
                      {isChapaEligible ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Ready
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          Fill details first
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
                      Direct Telebirr / CBE Birr / Visa
                    </span>
                    {!isChapaEligible && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block font-medium">
                        Requires name, email & 10-digit mobile (09/07)
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-left relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Chapa Online Gateway
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        Unavailable
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      This feature is not working for now. This store has not configured Chapa online payment yet.
                    </p>
                  </div>
                )}
              </div>

              {chapaError && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{chapaError}</span>
                </div>
              )}

              {/* Bank Transfer Instructions & Screenshot Upload */}
              {paymentMethod === 'BANK_TRANSFER_SCREENSHOT' && (
                <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Store Payment Details
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Please transfer the total amount ({formatPrice(totalAmount, currency)}) to any of the merchant accounts below, then attach a screenshot of your transfer confirmation.
                    </p>
                  </div>

                  {/* Prominent High-Visibility Bank Account Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(bankAccounts.length > 0
                      ? bankAccounts
                      : [
                          {
                            id: 1,
                            storeId: 1,
                            bankName: 'Commercial Bank of Ethiopia (CBE)',
                            accountName: store?.name || 'UrbanTrend Fashion',
                            accountNumber: '1000987654321',
                            instructions: 'Please write your Order Number or Name in the transfer remark.',
                            isActive: true,
                          },
                          {
                            id: 2,
                            storeId: 1,
                            bankName: 'Telebirr SuperApp',
                            accountName: store?.name || 'UrbanTrend Fashion',
                            accountNumber: '+251911234567',
                            instructions: 'Direct transfer to our registered Telebirr merchant phone.',
                            isActive: true,
                          },
                        ]
                    ).map((bank) => (
                      <div
                        key={bank.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-brand-500/30 dark:border-slate-700 flex flex-col justify-between space-y-3 shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                              {bank.bankName}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                            Account Name: <strong className="text-slate-900 dark:text-white">{bank.accountName}</strong>
                          </p>
                          <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <span className="font-mono text-base font-black text-slate-900 dark:text-white tracking-wider">
                              {bank.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(bank.id, bank.accountNumber)}
                              className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                              title="Copy account number"
                            >
                              {copiedBankId === bank.id ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {bank.instructions && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-100/70 dark:bg-slate-800/60 p-2 rounded-lg">
                            {bank.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Screenshot File Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {t('checkout.uploadProof')}
                    </label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-brand-500 transition-colors bg-white dark:bg-slate-900">
                      <input
                        type="file"
                        accept="image/*"
                        id="screenshot-upload"
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                      <label htmlFor="screenshot-upload" className="cursor-pointer block space-y-2">
                        {screenshotPreview ? (
                          <div className="space-y-2">
                            <img
                              src={screenshotPreview}
                              alt="Receipt Preview"
                              className="max-h-40 mx-auto rounded-xl shadow-md border"
                            />
                            <p className="text-xs text-brand-600 font-semibold">
                              Click to change screenshot
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-6 h-6 text-brand-500 mx-auto" />
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Click to upload receipt image
                            </p>
                            <p className="text-[10px] text-slate-400">PNG, JPG or JPEG up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right: Order Summary Sticky Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xl space-y-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {t('checkout.cartSummary')}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{t('checkout.subtotal')}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{t('checkout.tax')} ({taxRate * 100}%)</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatPrice(taxAmount, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{t('checkout.shipping')}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {orderType === 'DELIVERY' ? formatPrice(shippingCost, currency) : 'FREE (Pickup)'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
                <span className="font-black text-slate-900 dark:text-white">
                  {t('checkout.total')}
                </span>
                <span className="font-black text-xl text-brand-600 dark:text-brand-400">
                  {formatPrice(totalAmount, currency)}
                </span>
              </div>
            </div>

            <Button
              form="checkout-form"
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('checkout.placeOrder')}
            </Button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safe & Verified Multi-Tenant Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Delivery Map Picker Modal */}
      <MapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialCoords={gpsLocation}
        initialAddress={shippingAddress}
        onSelectLocation={(loc) => {
          setGpsLocation({ lat: loc.lat, lng: loc.lng });
          if (loc.address) {
            setShippingAddress(loc.address);
          }
        }}
      />
    </div>
  );
}
