// /context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db, rtdb } from "@/lib/firebase/client";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, set, serverTimestamp, onDisconnect } from 'firebase/database';
import nookies from 'nookies';

type UserProfile = {
  displayName?: string;
  university?: string;
  faculty?: string;
  department?: string;
  course?: string;
  grade?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userProfile: null, 
  loading: true, 
  refreshUserProfile: async () => {} 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // ユーザープロファイルを取得する関数（メモ化）
  const fetchUserProfile = useCallback(async (uid: string) => {
    try {
      const userProfileDoc = await getDoc(doc(db, 'users', uid));
      if (userProfileDoc.exists()) {
        const profileData = userProfileDoc.data();
        setUserProfile(profileData as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  }, []);

  // ユーザープロファイルを手動で更新する関数
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // onAuthStateChanged を使用して、認証状態の初期化完了を待つ
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      
      setUser(user); // ユーザー情報を更新

      // ユーザーが存在すればIDトークンをCookieにセット、いなければ削除
      if (user) {
        // トークン取得とCookie設定を非同期で実行
        user.getIdToken().then(token => {
          if (mounted) {
            nookies.set(undefined, 'token', token, { path: '/' });
          }
        }).catch(console.error);
        
        // ユーザープロファイルを取得
        await fetchUserProfile(user.uid);
        
        // Realtime Databaseでユーザーのアクティブ状態を管理（非同期で実行）
        setTimeout(() => {
          if (mounted) {
            setupUserPresence(user);
          }
        }, 0);
      } else {
        nookies.destroy(undefined, 'token', { path: '/' });
        setUserProfile(null);
      }

      if (mounted) {
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [fetchUserProfile]);

  // ユーザーのプレゼンス（アクティブ状態）を設定
  const setupUserPresence = async (user: User) => {
    try {
      const userPresenceRef = ref(rtdb, `presence/${user.uid}`);
      
      // ユーザーをアクティブ状態に設定
      await set(userPresenceRef, {
        online: true,
        lastSeen: serverTimestamp(),
        displayName: user.displayName || user.email,
        uid: user.uid,
      });

      // FirestoreのisActiveも更新
      await updateDoc(doc(db, 'users', user.uid), {
        isActive: true,
        updatedAt: new Date(),
      });

      // 接続が切れた時の自動処理
      onDisconnect(userPresenceRef).set({
        online: false,
        lastSeen: serverTimestamp(),
        displayName: user.displayName || user.email,
        uid: user.uid,
      });

      // ページが閉じられる前の処理
      const handleBeforeUnload = async () => {
        await set(userPresenceRef, {
          online: false,
          lastSeen: serverTimestamp(),
          displayName: user.displayName || user.email,
          uid: user.uid,
        });
        
        // FirestoreのisActiveも更新
        await updateDoc(doc(db, 'users', user.uid), {
          isActive: false,
          updatedAt: new Date(),
        });
      };

      // ページの可視性が変わった時の処理
      const handleVisibilityChange = async () => {
        if (document.hidden) {
          await set(userPresenceRef, {
            online: false,
            lastSeen: serverTimestamp(),
            displayName: user.displayName || user.email,
            uid: user.uid,
          });
          
          await updateDoc(doc(db, 'users', user.uid), {
            isActive: false,
            updatedAt: new Date(),
          });
        } else {
          await set(userPresenceRef, {
            online: true,
            lastSeen: serverTimestamp(),
            displayName: user.displayName || user.email,
            uid: user.uid,
          });
          
          await updateDoc(doc(db, 'users', user.uid), {
            isActive: true,
            updatedAt: new Date(),
          });
        }
      };

      // イベントリスナーを追加
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // クリーンアップ関数を返す
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } catch (error) {
      console.error('Error setting up user presence:', error);
    }
  };

  // Contextの値をメモ化
  const contextValue = useMemo(() => ({
    user,
    userProfile,
    loading,
    refreshUserProfile
  }), [user, userProfile, loading, refreshUserProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);