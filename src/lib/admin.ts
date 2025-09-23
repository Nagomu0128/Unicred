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
    console.log('=== getAllUsers START ===');
    const usersSnapshot = await dbAdmin.collection('users').get();
    console.log('Total users found:', usersSnapshot.size);
    const users: AdminUser[] = [];
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      console.log(`Processing user ${doc.id}:`, {
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        createdAtType: typeof userData.createdAt,
        updatedAtType: typeof userData.updatedAt
      });
      
      // 日付の安全な変換
      const safeToDate = (timestamp: any, fieldName: string): Date | null => {
        try {
          console.log(`Converting ${fieldName}:`, { timestamp, type: typeof timestamp });
          
          if (timestamp && typeof timestamp.toDate === 'function') {
            const result = timestamp.toDate();
            console.log(`${fieldName} - Firestore Timestamp converted:`, result);
            return result;
          }
          if (timestamp instanceof Date) {
            console.log(`${fieldName} - Already a Date:`, timestamp);
            return timestamp;
          }
          // Firestore Timestamp の場合
          if (timestamp && timestamp._seconds !== undefined) {
            const result = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
            console.log(`${fieldName} - Firestore Timestamp (raw) converted:`, result);
            return result;
          }
          // 数値の場合（Unix timestamp）
          if (typeof timestamp === 'number') {
            const result = new Date(timestamp);
            console.log(`${fieldName} - Number timestamp converted:`, result);
            return result;
          }
          // 文字列の場合（ISO 8601形式など）
          if (typeof timestamp === 'string') {
            const parsed = new Date(timestamp);
            if (!isNaN(parsed.getTime())) {
              console.log(`${fieldName} - String timestamp converted:`, parsed);
              return parsed;
            }
          }
          // デフォルト値はnullを返して、フロントエンドで適切に処理
          console.log(`${fieldName} - No valid timestamp found, returning null`);
          return null;
        } catch (error) {
          console.error(`Error converting ${fieldName}:`, error, timestamp);
          return null;
        }
      };
      
      const createdAt = safeToDate(userData.createdAt, 'createdAt');
      const updatedAt = safeToDate(userData.updatedAt, 'updatedAt');
      const lastLoginAt = userData.lastLoginAt ? safeToDate(userData.lastLoginAt, 'lastLoginAt') : undefined;
      
      console.log(`Final converted dates for ${doc.id}:`, {
        createdAt,
        updatedAt,
        lastLoginAt
      });
      
      users.push({
        uid: doc.id,
        email: userData.email || '',
        displayName: userData.displayName || '',
        isAdmin: userData.isAdmin || false,
        createdAt: createdAt,
        updatedAt: updatedAt,
        lastLoginAt: lastLoginAt,
        isActive: userData.isActive !== false
      });
    }
    
    console.log('=== getAllUsers END - returning users ===');
    console.log('Final users array:', users.map(u => ({
      uid: u.uid,
      email: u.email,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    })));
    
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
        console.log('getUserDetails - Converting timestamp:', { timestamp, type: typeof timestamp });
        
        if (timestamp && typeof timestamp.toDate === 'function') {
          const result = timestamp.toDate();
          console.log('getUserDetails - Firestore Timestamp converted:', result);
          return result;
        }
        if (timestamp instanceof Date) {
          console.log('getUserDetails - Already a Date:', timestamp);
          return timestamp;
        }
        // Firestore Timestamp の場合
        if (timestamp && timestamp._seconds !== undefined) {
          const result = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
          console.log('getUserDetails - Firestore Timestamp (raw) converted:', result);
          return result;
        }
        // 数値の場合（Unix timestamp）
        if (typeof timestamp === 'number') {
          const result = new Date(timestamp);
          console.log('getUserDetails - Number timestamp converted:', result);
          return result;
        }
        // 文字列の場合
        if (typeof timestamp === 'string') {
          const parsed = new Date(timestamp);
          if (!isNaN(parsed.getTime())) {
            console.log('getUserDetails - String timestamp converted:', parsed);
            return parsed;
          }
        }
        // デフォルト値はnullを返して、フロントエンドで適切に処理
        console.log('getUserDetails - No valid timestamp found, returning null');
        return null;
      } catch (error) {
        console.error('getUserDetails - Error converting timestamp:', error, timestamp);
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
