import { ApiClient } from '@/lib/api';

export const ordersFeatureApi = {
  getAll: () => ApiClient.get('/orders'),
  getById: (id: string | number) => ApiClient.get(`/orders/${id}`),
};
