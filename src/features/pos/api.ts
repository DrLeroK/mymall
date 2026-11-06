import { ApiClient } from '@/lib/api';

export const posFeatureApi = {
  checkout: (data: any) => ApiClient.post('/pos/checkout', data),
  getReconciliation: () => ApiClient.get('/pos/reconciliation'),
};
