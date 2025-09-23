// /lib/admin.ts
import { db } from '@/lib/firebase/client';
import { authAdmin, dbAdmin } from '@/lib/firebase/admin';
import { UserProfile, AdminUser } from './types';
import { collection, doc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore';
import admin from 'firebase-admin';

/**
 * ユーザーが管理者かどうかをチェックする
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const userDoc = await dbAdmin.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      console.log('User document does not exist for admin check:', uid);
      return false;
    }
    
    const userData = userDoc.data();
    const isAdmin = userData?.isAdmin === true;
    console.log('Admin status check result:', { uid, isAdmin });
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * ユーザーが存在するかチェックする
 */
export async function userExists(uid: string): Promise<boolean> {
  try {
    const userDoc = await dbAdmin.collection('users').doc(uid).get();
    const exists = userDoc.exists;
    console.log('User existence check:', { uid, exists });
    return exists;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}

/**
 * ユーザーに管理者権限を付与する
 */
export async function grantAdminRole(uid: string): Promise<boolean> {
  try {
    console.log('Attempting to grant admin role to user:', uid);
    
    const userDoc = await dbAdmin.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.error('User document does not exist for UID:', uid);
      return false;
    }

    console.log('User document exists, updating admin status...');
    await dbAdmin.collection('users').doc(uid).update({
      isAdmin: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Successfully granted admin role to user:', uid);
    return true;
  } catch (error) {
    console.error('Error granting admin role for UID:', uid, 'Error:', error);
    return false;
  }
}

/**
 * ユーザーから管理者権限を削除する
 */
export async function revokeAdminRole(uid: string): Promise<boolean> {
  try {
    console.log('Attempting to revoke admin role from user:', uid);
    
    const userDoc = await dbAdmin.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.error('User document does not exist for UID:', uid);
      return false;
    }

    console.log('User document exists, updating admin status...');
    await dbAdmin.collection('users').doc(uid).update({
      isAdmin: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Successfully revoked admin role from user:', uid);
    return true;
  } catch (error) {
    console.error('Error revoking admin role for UID:', uid, 'Error:', error);
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
    
    console.log('Fetching users, total documents:', usersSnapshot.size);
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // 基本的なデータ検証
      if (!userData.email) {
        console.warn('Skipping user with no email:', doc.id);
        continue;
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
          // Firestore Timestamp の場合
          if (timestamp && timestamp._seconds !== undefined) {
            return new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
          }
          // 数値の場合（Unix timestamp）
          if (typeof timestamp === 'number') {
            return new Date(timestamp);
          }
          // 文字列の場合
          if (typeof timestamp === 'string') {
            const parsed = new Date(timestamp);
            if (!isNaN(parsed.getTime())) {
              return parsed;
            }
          }
          // デフォルト値はnullを返して、フロントエンドで適切に処理
          return null;
        } catch (error) {
          console.error('Error converting timestamp:', error, timestamp);
          return null;
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
    
    console.log('Successfully processed users:', users.length);
    
    return users.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * ユーザーを削除する
 */
export async function deleteUser(uid: string): Promise<boolean> {
  try {
    const userDoc = await dbAdmin.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.error('User document does not exist:', uid);
      // Firestoreドキュメントが存在しない場合、Firebase Authからは削除を試行
      try {
        await authAdmin.deleteUser(uid);
        console.log('Firebase Auth user deleted successfully');
      } catch (authError) {
        console.error('Error deleting Firebase Auth user:', authError);
      }
      return false;
    }

    // Firestoreからユーザードキュメントを削除
    await dbAdmin.collection('users').doc(uid).delete();
    
    // Firebase Authからもユーザーを削除
    await authAdmin.deleteUser(uid);
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
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
    const safeToDate = (timestamp: any): Date | null => {
      try {
        if (timestamp && typeof timestamp.toDate === 'function') {
          return timestamp.toDate();
        }
        if (timestamp instanceof Date) {
          return timestamp;
        }
        // Firestore Timestamp の場合
        if (timestamp && timestamp._seconds !== undefined) {
          return new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
        }
        // 数値の場合（Unix timestamp）
        if (typeof timestamp === 'number') {
          return new Date(timestamp);
        }
        // 文字列の場合
        if (typeof timestamp === 'string') {
          const parsed = new Date(timestamp);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        }
        // デフォルト値はnullを返して、フロントエンドで適切に処理
        return null;
      } catch (error) {
        console.error('Error converting timestamp:', error, timestamp);
        return null;
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
