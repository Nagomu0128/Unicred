// /context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from "@/lib/firebase/client";
import nookies from 'nookies';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged を使用して、認証状態の初期化完了を待つ
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user); // ユーザー情報を更新

      // ユーザーが存在すればIDトークンをCookieにセット、いなければ削除
      if (user) {
        const token = await user.getIdToken();
        nookies.set(undefined, 'token', token, { path: '/' });
      } else {
        nookies.destroy(undefined, 'token', { path: '/' });
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);