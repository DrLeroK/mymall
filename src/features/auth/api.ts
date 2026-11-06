import { ApiClient } from '@/lib/api';

export const authFeatureApi = {
  login: (data: any) => ApiClient.post('/auth/login', data),
  register: (data: any) => ApiClient.post('/auth/register', data),
};
