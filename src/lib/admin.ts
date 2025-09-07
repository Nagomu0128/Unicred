// /lib/admin.ts
import { db } from '@/lib/firebase/client';
import { authAdmin, dbAdmin } from '@/lib/firebase/admin';
import { UserProfile, AdminUser } from './types';
import { collection, doc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore';

/**
 * ユーザーが管理者かどうかをチェックする
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const userDoc = await dbAdmin.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return false;
    }
    
    const userData = userDoc.data();
    return userData?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * ユーザーに管理者権限を付与する
 */
export async function grantAdminRole(uid: string): Promise<boolean> {
  try {
    await dbAdmin.collection('users').doc(uid).update({
      isAdmin: true,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error granting admin role:', error);
    return false;
  }
}

/**
 * ユーザーから管理者権限を削除する
 */
export async function revokeAdminRole(uid: string): Promise<boolean> {
  try {
    await dbAdmin.collection('users').doc(uid).update({
      isAdmin: false,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error revoking admin role:', error);
    return false;
  }
}

/**
 * 全ユーザーのリストを取得する（管理者用）
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const usersSnapshot = await dbAdmin.collection('users').get();
    const users: AdminUser[] = [];
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // 日付の安全な変換
      const safeToDate = (timestamp: any): Date => {
        try {
          if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
          }
          if (timestamp instanceof Date) {
            return timestamp;
          }
          return new Date();
        } catch {
          return new Date();
        }
      };
      
      users.push({
        uid: doc.id,
        email: userData.email || '',
        displayName: userData.displayName || '',
        isAdmin: userData.isAdmin || false,
        createdAt: safeToDate(userData.createdAt),
        updatedAt: safeToDate(userData.updatedAt),
        lastLoginAt: userData.lastLoginAt ? safeToDate(userData.lastLoginAt) : undefined,
        isActive: userData.isActive !== false
      });
    }
    
    return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * ユーザーの詳細情報を取得する
 */
export async function getUserDetails(uid: string): Promise<AdminUser | null> {
  try {
    const userDoc = await dbAdmin.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = userDoc.data();
    if (!userData) {
      return null;
    }
    
    // 日付の安全な変換
    const safeToDate = (timestamp: any): Date => {
      try {
        if (timestamp && typeof timestamp.toDate === 'function') {
          return timestamp.toDate();
        }
        if (timestamp instanceof Date) {
          return timestamp;
        }
        return new Date();
      } catch {
        return new Date();
      }
    };
    
    return {
      uid: userDoc.id,
      email: userData.email || '',
      displayName: userData.displayName || '',
      isAdmin: userData.isAdmin || false,
      createdAt: safeToDate(userData.createdAt),
      updatedAt: safeToDate(userData.updatedAt),
      lastLoginAt: userData.lastLoginAt ? safeToDate(userData.lastLoginAt) : undefined,
      isActive: userData.isActive !== false
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}
