// /lib/types.ts
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser extends UserProfile {
  lastLoginAt?: Date;
  isActive: boolean;
}
