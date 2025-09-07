'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { usePresence } from '@/context/PresenceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';
import { universityData, grades } from '@/lib/universityInfo';

type UniversityName = keyof typeof universityData;

export default function ProfilePage() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const { isAdmin } = useAdmin();
  const { isOnline } = usePresence();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // フォームデータの状態
  const [formData, setFormData] = useState({
    displayName: '',
    university: '',
    faculty: '',
    department: '',
    course: '',
    grade: ''
  });

  // 学部の選択肢を計算
  const faculties = useMemo(() => {
    if (!formData.university) {
      return [];
    }
    const universityInfo = universityData[formData.university as UniversityName];
    if (!universityInfo) {
      return [];
    }
    return Object.keys(universityInfo);
  }, [formData.university]);

  // 学科の選択肢を計算
  const departments = useMemo(() => {
    if (!formData.university || !formData.faculty) {
      return [];
    }
    const universityInfo = universityData[formData.university as UniversityName];
    if (!universityInfo) {
      return [];
    }
    const facultyInfo = universityInfo[formData.faculty as keyof typeof universityInfo];
    if (!facultyInfo || typeof facultyInfo !== 'object') {
      return [];
    }
    return Object.keys(facultyInfo);
  }, [formData.university, formData.faculty]);

  // コースの選択肢を計算
  const courses = useMemo(() => {
    if (!formData.university || !formData.faculty || !formData.department) {
      return [];
    }
    const universityInfo = universityData[formData.university as UniversityName];
    if (!universityInfo) {
      return [];
    }
    const facultyInfo = universityInfo[formData.faculty as keyof typeof universityInfo];
    if (!facultyInfo || typeof facultyInfo !== 'object') {
      return [];
    }
    const departmentInfo = facultyInfo[formData.department as keyof typeof facultyInfo];
    if (!Array.isArray(departmentInfo)) {
      return [];
    }
    return departmentInfo;
  }, [formData.university, formData.faculty, formData.department]);

  // プロフィールデータをフォームに設定
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        university: userProfile.university || '',
        faculty: userProfile.faculty || '',
        department: userProfile.department || '',
        course: userProfile.course || '',
        grade: userProfile.grade || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 階層的な選択肢のリセット処理
      if (field === 'university') {
        newData.faculty = '';
        newData.department = '';
        newData.course = '';
      } else if (field === 'faculty') {
        newData.department = '';
        newData.course = '';
      } else if (field === 'department') {
        newData.course = '';
      }
      
      // コースが「未分属」の場合は空文字列に変換
      if (field === 'course' && value === '未分属') {
        newData.course = '';
      }
      
      return newData;
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: new Date()
      });

      // プロフィールを再取得
      await refreshUserProfile();
      
      setMessage({ type: 'success', text: 'プロフィールを更新しました' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'プロフィールの更新に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        university: userProfile.university || '',
        faculty: userProfile.faculty || '',
        department: userProfile.department || '',
        course: userProfile.course || '',
        grade: userProfile.grade || ''
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ヘッダーセクション */}
      <div className="mb-8 text-center">
        <div className="w-[73.6px] h-[73.6px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <img 
            src="/unicred-icon.svg" 
            alt="Unicred Logo" 
            className="w-16 h-16 filter brightness-0 invert"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">プロフィール</h1>
        <div className="flex items-center justify-center space-x-4">
          <p className="text-gray-600 text-sm">
            {isAdmin ? '管理者プロフィール' : '学生プロフィール'}
          </p>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isOnline ? 'オンライン' : 'オフライン'}
            </span>
          </div>
        </div>
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

      {/* プロフィール情報 */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
            <p className="text-gray-600 mt-1">あなたの基本情報を管理できます</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            size="lg"
            className="px-6"
          >
            {isEditing ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                キャンセル
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                編集
              </>
            )}
          </Button>
        </div>

        {/* プロフィールカード */}
        <Card className="overflow-hidden shadow-lg border-0 bg-white">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">基本情報</h2>
            <p className="text-sm text-gray-600">個人情報と学籍情報</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* 氏名とメール */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                  氏名
                </Label>
                {isEditing ? (
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="氏名を入力してください"
                    className="h-11"
                  />
                ) : (
                  <div className="h-11 flex items-center px-3 bg-gray-50 rounded-md border">
                    <span className="text-gray-900 font-medium">
                      {userProfile?.displayName || '未設定'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  メールアドレス
                </Label>
                <div className="h-11 flex items-center px-3 bg-gray-50 rounded-md border">
                  <span className="text-gray-900 font-medium">{user?.email}</span>
                </div>
                <p className="text-xs text-gray-500">メールアドレスは変更できません</p>
              </div>
            </div>

            {/* 学籍情報 */}
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-gray-800 mb-4">学籍情報</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="university" className="text-sm font-medium text-gray-700">
                      大学
                    </Label>
                    {isEditing ? (
                      <Select
                        value={formData.university}
                        onValueChange={(value) => handleInputChange('university', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="大学を選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="大阪大学">大阪大学</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-11 flex items-center px-3 bg-gray-50 rounded-md border">
                        <span className="text-gray-900 font-medium">
                          {userProfile?.university || '未設定'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faculty" className="text-sm font-medium text-gray-700">
                      学部
                    </Label>
                    {isEditing ? (
                      <Select
                        value={formData.faculty}
                        onValueChange={(value) => handleInputChange('faculty', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="学部を選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculties.length > 0 ? (
                            faculties.map((faculty) => (
                              <SelectItem key={faculty} value={faculty}>
                                {faculty}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="placeholder" disabled>
                              大学を選択してください
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-11 flex items-center px-3 bg-gray-50 rounded-md border">
                        <span className="text-gray-900 font-medium">
                          {userProfile?.faculty || '未設定'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                      学科名
                    </Label>
                    {isEditing ? (
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleInputChange('department', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="学科を選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.length > 0 ? (
                            departments.map((department) => (
                              <SelectItem key={department} value={department}>
                                {department}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="placeholder" disabled>
                              学部を選択してください
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-11 flex items-center px-3 bg-gray-50 rounded-md border">
                        <span className="text-gray-900 font-medium">
                          {userProfile?.department || '未設定'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-sm font-medium text-gray-700">
                      コース
                    </Label>
                    {isEditing ? (
                      <Select
                        value={formData.course || '未分属'}
                        onValueChange={(value) => handleInputChange('course', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="コースを選択してください（任意）" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="未分属">未分属</SelectItem>
                          {courses.length > 0 && courses.map((course) => (
                            <SelectItem key={course} value={course}>
                              {course}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-11 flex items-center px-3 bg-gray-50 rounded-md border">
                        <span className="text-gray-900 font-medium">
                          {userProfile?.course || '未分属'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-medium text-gray-700">
                      学年
                    </Label>
                    {isEditing ? (
                      <Select
                        value={formData.grade}
                        onValueChange={(value) => handleInputChange('grade', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="学年を選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-11 flex items-center px-3 bg-gray-50 rounded-md border">
                        <span className="text-gray-900 font-medium">
                          {userProfile?.grade || '未設定'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="lg"
                  className="px-6"
                  disabled={saving}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="lg"
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      保存中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      保存
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 管理者向けメッセージ */}
      {isAdmin && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <img 
              src="/unicred-icon.svg" 
              alt="Unicred Logo" 
              className="w-8 h-8 mr-2"
            />
            <p className="text-sm text-yellow-800">
              管理者権限をお持ちです。詳細な管理機能は
              <a href="/admin" className="font-medium underline hover:text-yellow-900">管理者パネル</a>
              からアクセスできます。
            </p>
          </div>
        </div>
      )}
    </>
  );
}
