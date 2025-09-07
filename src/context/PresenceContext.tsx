// /context/PresenceContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { rtdb } from '@/lib/firebase/client';
import { ref, onDisconnect, onValue, set, serverTimestamp, remove } from 'firebase/database';

type PresenceContextType = {
  isOnline: boolean;
  onlineUsers: string[];
  loading: boolean;
};

const PresenceContext = createContext<PresenceContextType>({
  isOnline: false,
  onlineUsers: [],
  loading: true,
});

export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsOnline(false);
      setOnlineUsers([]);
      setLoading(false);
      return;
    }

    const userPresenceRef = ref(rtdb, `presence/${user.uid}`);
    const onlineUsersRef = ref(rtdb, 'presence');

    // ユーザーをオンライン状態に設定
    const setUserOnline = async () => {
      try {
        await set(userPresenceRef, {
          online: true,
          lastSeen: serverTimestamp(),
          displayName: user.displayName || user.email,
        });
        setIsOnline(true);
      } catch (error) {
        console.error('Error setting user online:', error);
      }
    };

    // ユーザーがオフラインになった時の処理
    const setUserOffline = async () => {
      try {
        await set(userPresenceRef, {
          online: false,
          lastSeen: serverTimestamp(),
          displayName: user.displayName || user.email,
        });
        setIsOnline(false);
      } catch (error) {
        console.error('Error setting user offline:', error);
      }
    };

    // 接続が切れた時の自動処理
    onDisconnect(userPresenceRef).set({
      online: false,
      lastSeen: serverTimestamp(),
      displayName: user.displayName || user.email,
    });

    // オンラインユーザーリストを監視
    const unsubscribeOnlineUsers = onValue(onlineUsersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        const onlineUserIds = Object.keys(users).filter(
          (uid) => users[uid]?.online === true && uid !== user.uid
        );
        setOnlineUsers(onlineUserIds);
      } else {
        setOnlineUsers([]);
      }
      setLoading(false);
    });

    // ユーザーをオンラインに設定
    setUserOnline();

    // ページが閉じられる前の処理
    const handleBeforeUnload = () => {
      setUserOffline();
    };

    // ページの可視性が変わった時の処理
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setUserOffline();
      } else {
        setUserOnline();
      }
    };

    // イベントリスナーを追加
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // クリーンアップ
    return () => {
      unsubscribeOnlineUsers();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setUserOffline();
    };
  }, [user]);

  return (
    <PresenceContext.Provider value={{ isOnline, onlineUsers, loading }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => useContext(PresenceContext);
