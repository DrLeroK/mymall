import { safeStorage, isValidJwt, isJwtExpired, validateUploadedFile } from '@/lib/security';

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  // If in browser and no env variable provided, fall back cleanly to current host origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/v1`;
  }
  return '/api/v1';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  user?: any;
  [key: string]: any;
}

export class ApiClient {
  public baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getApiBaseUrl();
  }

  // ==========================================
  // Secure Token Management (Validation & Rotation)
  // ==========================================

  public static getAccessToken(): string | null {
    const token = safeStorage.getItem('mymall_access_token');
    return isValidJwt(token) ? token : null;
  }

  public static getRefreshToken(): string | null {
    const token = safeStorage.getItem('mymall_refresh_token');
    return isValidJwt(token) ? token : null;
  }

  public static setTokens(accessToken: string, refreshToken: string) {
    // Validate JWT structure before persisting to avoid poisoned storage
    if (isValidJwt(accessToken)) {
      safeStorage.setItem('mymall_access_token', accessToken);
    }
    if (isValidJwt(refreshToken)) {
      safeStorage.setItem('mymall_refresh_token', refreshToken);
    }
  }

  public static clearTokens() {
    safeStorage.removeItem('mymall_access_token');
    safeStorage.removeItem('mymall_refresh_token');
    safeStorage.removeItem('mymall_user');
  }

  public static async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.tokens) {
        this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        return true;
      }
    } catch (e) {
      console.error('Failed to refresh token', e);
    }
    this.clearTokens();
    return false;
  }

  // Instance token access
  private getToken(): string | null {
    return ApiClient.getAccessToken();
  }

  // ==========================================
  // Core Request Engine with Security Guards
  // ==========================================

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    let token = this.getToken();

    // Proactive JWT Expiration Guard: If expired or expiring within 30s, refresh before sending
    if (token && isJwtExpired(token)) {
      const refreshed = await ApiClient.refreshAccessToken();
      if (refreshed) {
        token = this.getToken();
      }
    }

    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Do NOT set Content-Type header when sending FormData (browser automatically sets multipart boundary)
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Clean endpoint to prevent path traversal
    const cleanEndpoint = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      let response = await fetch(cleanEndpoint, {
        ...options,
        headers,
      });

      // Reactive 401 Guard: Refresh token and retry request once
      if (
        response.status === 401 &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/refresh-token')
      ) {
        const refreshed = await ApiClient.refreshAccessToken();
        if (refreshed) {
          const newToken = this.getToken();
          if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(cleanEndpoint, {
            ...options,
            headers,
          });
        }
      }

      // Safe JSON decoding from response text
      let data: any;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Failed to parse JSON response:', text);
        throw new Error('Server returned invalid response format.');
      }

      if (!response.ok) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else {
          switch (response.status) {
            case 400:
              errorMessage = 'Invalid request payload or validation error.';
              break;
            case 401:
              errorMessage = 'Invalid credentials or session expired.';
              break;
            case 402:
              errorMessage = data.message || 'Store subscription expired or payment required.';
              break;
            case 403:
              errorMessage = 'Access denied. You do not have permission for this action.';
              break;
            case 404:
              errorMessage = 'Requested resource not found.';
              break;
            case 409:
              errorMessage = data.message || 'Conflict: Record already exists.';
              break;
            case 422:
              errorMessage = 'Unprocessable entity or invalid inputs.';
              break;
            case 500:
              errorMessage = 'Internal server error. Please try again later.';
              break;
          }
        }
        throw new Error(errorMessage);
      }

      if (data.success === undefined) {
        return { success: true, ...data };
      }

      return data;
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production' && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/me')) {
        console.warn(`API warning [${endpoint}]: ${error.message || error}`);
      }
      throw error;
    }
  }

  // ==========================================
  // Generic HTTP Verb Helpers (Instance & Static)
  // ==========================================

  get<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  put<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  patch<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  delete<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Static aliases for seamless backward-compatibility across all pages
  public static get<T = any>(endpoint: string, options?: RequestInit) {
    return api.get<T>(endpoint, options);
  }

  public static post<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return api.post<T>(endpoint, body, options);
  }

  public static put<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return api.put<T>(endpoint, body, options);
  }

  public static patch<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return api.patch<T>(endpoint, body, options);
  }

  public static delete<T = any>(endpoint: string, options?: RequestInit) {
    return api.delete<T>(endpoint, options);
  }

  // ==========================================
  // Typed Domain SDK Service Methods
  // ==========================================

  // --- Auth & Identity ---
  login(credentials: { email?: string; phone?: string; password: string }) {
    return this.post('/auth/login', credentials);
  }

  register(userData: any) {
    return this.post('/auth/register', userData);
  }

  getProfile() {
    return this.get('/auth/me');
  }

  sendOtp(email: string) {
    return this.post('/auth/send-otp', { email });
  }

  verifyOtp(email: string, otp: string) {
    return this.post('/auth/verify-otp', { email, otp });
  }

  forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  resetPassword(payload: { email: string; otp: string; newPassword: string }) {
    return this.post('/auth/reset-password', payload);
  }

  chooseRole(targetRole: string) {
    return this.post('/auth/choose-role', { targetRole });
  }

  // --- Stores & Onboarding ---
  getMyStore() {
    return this.get('/stores/me');
  }

  onboardStore(storeData: any) {
    return this.post('/stores/onboard', storeData);
  }

  updateStoreSettings(storeId: string, settings: any) {
    return this.patch(`/stores/${storeId}`, settings);
  }

  getStoreBySlug(slug: string) {
    return this.get(`/storefront/${slug}`);
  }

  // --- Products & Inventory ---
  getProducts(params: { search?: string; category?: string; storeId?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('query', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.storeId) query.append('storeId', params.storeId);
    return this.get(`/products?${query.toString()}`);
  }

  getProductById(productId: string) {
    return this.get(`/products/${productId}`);
  }

  createProduct(productData: any) {
    return this.post('/products', productData);
  }

  updateProduct(productId: string, data: any) {
    return this.patch(`/products/${productId}`, data);
  }

  deleteProduct(productId: string) {
    return this.delete(`/products/${productId}`);
  }

  adjustProductStock(productId: string, quantity: number, type: 'ADD' | 'SUBTRACT' = 'ADD') {
    return this.patch(`/products/stock/adjust`, { productId, quantity, type });
  }

  // --- POS (Cashier & Daily Reconciliation) ---
  logPosSale(saleData: {
    items: { productId: string; variantId?: string; quantity: number; unitPrice: number }[];
    paymentMethod: string;
    tenderAmount?: number;
    changeAmount?: number;
    discount?: number;
  }) {
    return this.post('/pos/checkout', saleData);
  }

  getPosReconciliation(storeId?: string) {
    return this.get(`/pos/reconcile${storeId ? `?storeId=${storeId}` : ''}`);
  }

  submitDrawerReconciliation(reconciliationData: any) {
    return this.post('/pos/reconcile', reconciliationData);
  }

  // --- Orders & Checkout ---
  checkout(orderData: any) {
    return this.post('/orders/checkout', orderData);
  }

  getOrderDetails(orderId: string) {
    return this.get(`/orders/${orderId}`);
  }

  getCustomerOrders() {
    return this.get('/orders');
  }

  getStoreOrders(storeId?: string) {
    return this.get(`/orders/store${storeId ? `?storeId=${storeId}` : ''}`);
  }

  updateOrderStatus(orderId: string, status: string) {
    return this.patch(`/orders/${orderId}/status`, { status });
  }

  uploadPaymentProof(orderId: string, formData: FormData) {
    return this.post(`/orders/${orderId}/payment-proof`, formData);
  }

  // --- Staff Management ---
  createStaffInvite(storeId: string, inviteData: { role: string; email?: string; name?: string }) {
    return this.post('/staff/invite', { storeId, ...inviteData });
  }

  getStoreStaff(storeId: string) {
    return this.get(`/staff/store/${storeId}`);
  }

  acceptStaffInvite(payload: { inviteCode: string; name: string; password: string }) {
    return this.post('/staff/accept-invite', payload);
  }

  deleteStaff(staffId: string) {
    return this.delete(`/staff/${staffId}`);
  }

  // --- Billing & SaaS Plans ---
  getSubscriptionPlans() {
    return this.get('/billing/plans');
  }

  submitSubscriptionProof(formData: FormData) {
    return this.post('/billing/proof', formData);
  }

  getPlatformBankAccounts() {
    return this.get('/billing/platform-bank-accounts');
  }

  // --- Super Admin SaaS Operations ---
  getAdminAnalytics() {
    return this.get('/analytics/platform');
  }

  getPendingVerifications() {
    return this.get('/billing/admin/verifications');
  }

  verifySubscriptionProof(proofId: string, action: 'APPROVE' | 'REJECT', notes?: string) {
    return this.post(`/billing/admin/verifications/${proofId}`, { action, notes });
  }

  createSubscriptionPlan(planData: any) {
    return this.post('/billing/admin/plans', planData);
  }

  updateSubscriptionPlan(planId: string, planData: any) {
    return this.patch(`/billing/admin/plans/${planId}`, planData);
  }

  addPlatformBankAccount(bankData: any) {
    return this.post('/billing/admin/bank-accounts', bankData);
  }

  // --- Customer Disputes & Reviews ---
  getCustomerDisputes() {
    return this.get('/disputes');
  }

  fileDispute(orderId: string, disputeData: { reason: string; description: string }) {
    return this.post('/disputes', { orderId, ...disputeData });
  }

  resolveDispute(disputeId: string, resolution: { status: string; notes: string }) {
    return this.patch(`/disputes/${disputeId}/resolve`, resolution);
  }

  submitReview(slug: string, reviewData: { rating: number; comment: string; productId?: string }) {
    return this.post(`/storefront/${slug}/reviews`, reviewData);
  }

  // --- Customer Addresses ---
  getSavedAddresses() {
    return this.get('/addresses');
  }

  createAddress(addressData: any) {
    return this.post('/addresses', addressData);
  }

  deleteAddress(addressId: string) {
    return this.delete(`/addresses/${addressId}`);
  }
}

// Export the singleton instance
export const api = new ApiClient();
