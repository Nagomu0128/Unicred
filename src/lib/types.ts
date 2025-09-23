// /lib/types.ts
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface AdminUser extends UserProfile {
  lastLoginAt?: Date | null;
  isActive: boolean;
}
