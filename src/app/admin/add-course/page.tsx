'use client';

import React, { useState, useEffect } from 'react';
import { CourseForm } from '@/components/admin/CourseForm';
import { CourseFormData } from '@/lib/types/course';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

export default function AddCoursePage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // プロフィールの完全性をチェック
  useEffect(() => {
    const checkProfileCompleteness = async () => {
      if (!user || !isAdmin) return;

      try {
        const userProfileDoc = await getDoc(doc(db, 'users', user.uid));
        const userProfile = userProfileDoc.data();

        const isProfileComplete = userProfile && 
          userProfile.displayName && 
          userProfile.university && 
          userProfile.faculty && 
          userProfile.department && 
          userProfile.grade;

        if (!isProfileComplete) {
          console.log('Profile incomplete, redirecting to registration');
          router.push('/public/registration');
        }
      } catch (error) {
        console.error('Error checking profile completeness:', error);
        router.push('/protected/registration');
      }
    };

    checkProfileCompleteness();
  }, [user, isAdmin, router]);

  // 管理者権限チェック
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">権限を確認中...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-11/12 border border-red-200">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">アクセス拒否</h1>
          <p className="text-red-600 mb-6">このページにアクセスするには管理者権限が必要です。</p>
          <a
            href="/protected/dashboard"
            className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            ダッシュボードに戻る
          </a>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (data: CourseFormData) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        // フォームをリセット
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '講義の追加に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch('/api/admin/courses/csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setCsvFile(null);
        // ファイル入力をリセット
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'CSVファイルのアップロードに失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleCsvDownload = async () => {
    try {
      const response = await fetch('/api/admin/courses/csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'course_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setMessage({ type: 'error', text: 'CSVテンプレートのダウンロードに失敗しました' });
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <div className="w-[73.6px] h-[73.6px] bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <img 
              src="/unicred-icon.svg" 
              alt="Unicred Logo" 
              className="w-16 h-16 filter brightness-0 invert"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">講義追加</h1>
          <p className="text-gray-600 text-sm">新しい講義を追加またはCSVファイルで一括登録</p>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <Alert className={`mb-6 ${
            message.type === 'success' 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <AlertDescription className={
              message.type === 'success' 
                ? 'text-green-800' 
                : 'text-red-800'
            }>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* コンテンツ */}
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">個別追加</TabsTrigger>
            <TabsTrigger value="csv">CSV一括登録</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <CourseForm onSubmit={handleFormSubmit} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="csv" className="mt-6">
            <div className="space-y-6">
              {/* CSVテンプレートダウンロード */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-blue-800">テンプレートのダウンロード</CardTitle>
                  <CardDescription className="text-blue-700">
                    CSVファイルで講義を一括登録する場合は、まずテンプレートをダウンロードしてExcelで編集してください。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleCsvDownload}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    CSVテンプレートをダウンロード
                  </Button>
                </CardContent>
              </Card>

              {/* CSVファイルアップロード */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800">CSVファイルのアップロード</CardTitle>
                  <CardDescription>編集したCSVファイルをアップロードして講義を一括登録します</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCsvUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="csv-file">ファイル選択</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="w-full"
                        required
                      />
                      <p className="text-sm text-gray-500">
                        CSVファイルを選択してください（最大10MB）
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={!csvFile || loading}
                        className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                      >
                        {loading ? 'アップロード中...' : 'CSVファイルをアップロード'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* 使用方法の説明 */}
              <Card className="border-gray-200 bg-gray-50">
                <CardHeader>
                  <CardTitle className="font-semibold text-gray-800">使用方法</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>上記の「CSVテンプレートをダウンロード」ボタンからテンプレートをダウンロード</li>
                    <li>Excelでテンプレートを開き、講義データを入力</li>
                    <li>「名前を付けて保存」で「CSV (カンマ区切り)」形式で保存</li>
                    <li>保存したCSVファイルを上記のフォームでアップロード</li>
                    <li>システムが自動的にFirestoreにデータを登録</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
