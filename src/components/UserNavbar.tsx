// /components/UserNavbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Calendar, 
  User,
  Settings,
  LogOut,
  ChevronDown,
  Plus
} from 'lucide-react';

interface UserNavbarProps {
  currentPage?: string;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({ currentPage = 'dashboard' }) => {
  const { user, userProfile } = useAuth();
  const { isAdmin } = useAdmin();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'ダッシュボード', 
      href: '/dashboard', 
      icon: LayoutDashboard
    },
    { 
      id: 'courses', 
      label: '履修管理', 
      href: '/courses', 
      icon: BookOpen
    },
    { 
      id: 'schedule',
      label: '時間割',
      href: '/schedule',
      icon: Calendar
    },
    { 
      id: 'grades', 
      label: '成績管理', 
      href: '/grades', 
      icon: Award
    },
    { 
      id: 'grade-registration',
      label: '成績登録',
      href: '/grade-registration',
      icon: Plus
    },
  ];

  const handleLogout = async () => {
    try {
      // ユーザーのisActiveをfalseに設定
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          isActive: false,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      // ログアウト処理
      window.location.href = '/';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・タイトル */}
          <div className="flex items-center space-x-3">
            <div className="w-[36.8px] h-[36.8px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <img 
                src="/unicred-icon.svg" 
                alt="Unicred Logo" 
                className="w-8 h-8 filter brightness-0 invert pointer-events-none select-none"
                draggable="false"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Unicred</h1>
              <p className="text-xs text-gray-500">大阪大学履修支援システム</p>
            </div>
          </div>

          {/* ナビゲーションメニュー */}
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavigationMenuItem key={item.id}>
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(
                            navigationMenuTriggerStyle(),
                            currentPage === item.id && "bg-blue-100 text-blue-700 border border-blue-200",
                            "flex items-center gap-2"
                          )}
                        >
                          <IconComponent className="h-4 w-4" />
                          {item.label}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {userProfile?.displayName || user?.displayName || user?.email}
              </p>
              <p className="text-xs text-gray-500">
                {isAdmin ? '管理者' : '学生'}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>アカウント</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    プロフィール
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 text-red-600">
                        <Settings className="h-4 w-4" />
                        管理者パネル
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex space-x-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={true}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center transition-all duration-200 flex flex-col items-center justify-center ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
