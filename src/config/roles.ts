export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  STORE_OWNER = 'STORE_OWNER',
  STORE_STAFF = 'STORE_STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum StaffSubRole {
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  INVENTORY_CLERK = 'INVENTORY_CLERK',
}

export type Permission =
  | 'admin:access'
  | 'admin:stores:manage'
  | 'admin:verifications:approve'
  | 'admin:disputes:resolve'
  | 'admin:plans:manage'
  | 'store:access'
  | 'store:products:manage'
  | 'store:orders:manage'
  | 'store:staff:manage'
  | 'store:billing:manage'
  | 'store:settings:manage'
  | 'pos:access'
  | 'pos:checkout'
  | 'pos:reconciliation'
  | 'customer:access'
  | 'customer:orders:view'
  | 'customer:chat';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    'admin:access',
    'admin:stores:manage',
    'admin:verifications:approve',
    'admin:disputes:resolve',
    'admin:plans:manage',
  ],
  [UserRole.STORE_OWNER]: [
    'store:access',
    'store:products:manage',
    'store:orders:manage',
    'store:staff:manage',
    'store:billing:manage',
    'store:settings:manage',
    'pos:access',
    'pos:checkout',
    'pos:reconciliation',
  ],
  [UserRole.STORE_STAFF]: [
    'store:access',
    'store:products:manage',
    'store:orders:manage',
    'pos:access',
    'pos:checkout',
  ],
  [UserRole.CUSTOMER]: [
    'customer:access',
    'customer:orders:view',
    'customer:chat',
  ],
};
