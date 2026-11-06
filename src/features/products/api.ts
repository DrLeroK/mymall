import { ApiClient } from '@/lib/api';

export const productsFeatureApi = {
  getAll: (params?: any) => ApiClient.get('/products', params),
  getById: (id: string | number) => ApiClient.get(`/products/${id}`),
};
