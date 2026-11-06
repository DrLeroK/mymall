import { ApiClient } from '@/lib/api';

export const merchantFeatureApi = {
  getStore: () => ApiClient.get('/stores/me'),
  getStaff: () => ApiClient.get('/staff'),
  changeRole: (staffId: string | number, role: string) => ApiClient.patch(`/staff/${staffId}/role`, { role }),
  toggleStatus: (staffId: string | number) => ApiClient.patch(`/staff/${staffId}/toggle-status`, {}),
  deleteStaff: (staffId: string | number) => ApiClient.delete(`/staff/${staffId}`),
};
