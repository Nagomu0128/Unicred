'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  courseType: 'specialized' | 'general' | 'specializedBasic' | 'secondLanguage' | 'physical' | 'information' | 'advanced' | 'comprehensive' | 'practical' | 'global' | 'advancedInternational' | 'advancedLiberal' | 'academic';
  credits: number;
  semester: string;
  year: number;
  faculty: string;
  department: string;
  description?: string;
  prerequisites?: string[];
  isRegistered?: boolean;
  group?: string; // 専門科目の群分け
}

export default function CoursesPage() {
  const { user, userProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState<string>('all');
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [showRegisteredOnly, setShowRegisteredOnly] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);


  useEffect(() => {
    // 実際の実装ではFirestoreから講義データを取得
    // TODO: Firestoreから講義データを取得する処理を実装
    setCourses([]);
    setFilteredCourses([]);
    setLoading(false);
  }, []);

  // フィルタリング処理
  useEffect(() => {
    let filtered = courses;

    // 検索語によるフィルタリング
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 講義種別によるフィルタリング
    if (selectedCourseType !== 'all') {
      filtered = filtered.filter(course => course.courseType === selectedCourseType);
    }

    // 学期によるフィルタリング
    if (selectedSemesters.length > 0) {
      filtered = filtered.filter(course => selectedSemesters.includes(course.semester));
    }


    // 登録済みのみ表示
    if (showRegisteredOnly) {
      filtered = filtered.filter(course => course.isRegistered);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCourseType, selectedSemesters, showRegisteredOnly]);

  const getCourseTypeLabel = (type: string) => {
    switch (type) {
      case 'specialized':
        return '専門科目';
      case 'general':
        return '一般教養';
      case 'specializedBasic':
        return '専門基礎';
      case 'secondLanguage':
        return '第二言語';
      case 'physical':
        return '体育';
      case 'information':
        return '情報';
      case 'advanced':
        return 'アドバンスト';
      case 'comprehensive':
        return '総合';
      case 'practical':
        return '実習';
      case 'global':
        return 'グローバル';
      case 'advancedInternational':
        return '高度国際';
      case 'advancedLiberal':
        return '高度教養';
      case 'academic':
        return '学術';
      default:
        return type;
    }
  };

  const getCourseTypeColor = (type: string) => {
    switch (type) {
      case 'specialized':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'general':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'specializedBasic':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'secondLanguage':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'physical':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'information':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'advanced':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'comprehensive':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'practical':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'global':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'advancedInternational':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'advancedLiberal':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'academic':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRegistrationToggle = async (courseId: string, isRegistered: boolean) => {
    try {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        
        if (isRegistered) {
          // 履修登録
          await updateDoc(userRef, {
            registeredCourses: arrayUnion(courseId)
          });
        } else {
          // 履修解除
          await updateDoc(userRef, {
            registeredCourses: arrayRemove(courseId)
          });
        }

        // ローカル状態を更新
        setCourses(prevCourses =>
          prevCourses.map(course =>
            course.id === courseId
              ? { ...course, isRegistered: !isRegistered }
              : course
          )
        );
      }
    } catch (error) {
      console.error('Error updating course registration:', error);
    }
  };

  const courseTypes = [
    { value: 'all', label: 'すべて' },
    { value: 'specialized', label: '専門科目' },
    { value: 'general', label: '一般教養' },
    { value: 'specializedBasic', label: '専門基礎' },
    { value: 'secondLanguage', label: '第二言語' },
    { value: 'physical', label: '体育' },
    { value: 'information', label: '情報' },
    { value: 'advanced', label: 'アドバンスト' },
    { value: 'comprehensive', label: '総合' },
    { value: 'practical', label: '実習' },
    { value: 'global', label: 'グローバル' },
    { value: 'advancedInternational', label: '高度国際' },
    { value: 'advancedLiberal', label: '高度教養' },
    { value: 'academic', label: '学術' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <img
              src="/unicred-icon.svg"
              alt="Unicred Logo"
              className="w-12 h-12 filter brightness-0 invert pointer-events-none select-none"
              draggable="false"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">履修管理</h1>
          <p className="text-gray-600">講義情報を読み込み中...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <img
            src="/unicred-icon.svg"
            alt="Unicred Logo"
            className="w-12 h-12 filter brightness-0 invert pointer-events-none select-none"
            draggable="false"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">履修管理</h1>
        <p className="text-gray-600">履修可能な講義を確認・登録できます</p>
      </div>

      {/* 検索バー */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="講義名、講義コード、説明で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              フィルター
              {isFilterExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCourseType('all');
                setSelectedSemesters([]);
                setShowRegisteredOnly(false);
              }}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              リセット
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* フィルター詳細 */}
      {isFilterExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              詳細フィルター
            </CardTitle>
            <CardDescription>
              講義をより詳細に絞り込むことができます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 講義種別 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  講義種別
                </Label>
                <Select value={selectedCourseType} onValueChange={setSelectedCourseType}>
                  <SelectTrigger>
                    <SelectValue placeholder="講義種別を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 学期 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  開講学期
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {['春', '夏', '秋', '冬'].map((semester) => (
                    <div key={semester} className="flex items-center space-x-2">
                      <Checkbox
                        id={`semester-${semester}`}
                        checked={selectedSemesters.includes(semester)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSemesters(prev => [...prev, semester]);
                          } else {
                            setSelectedSemesters(prev => prev.filter(s => s !== semester));
                          }
                        }}
                      />
                      <Label htmlFor={`semester-${semester}`} className="text-sm cursor-pointer">
                        {semester}学期
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 表示オプション */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  表示オプション
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="registered-only"
                      checked={showRegisteredOnly}
                      onCheckedChange={(checked) => setShowRegisteredOnly(checked as boolean)}
                    />
                    <Label htmlFor="registered-only" className="text-sm cursor-pointer">
                      登録済みのみ表示
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 結果サマリー */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredCourses.length}</span>件の講義が見つかりました
        </div>
        {isFilterExpanded && (
          <div className="text-xs text-gray-500">
            {searchTerm && `検索: "${searchTerm}"`}
            {selectedCourseType !== 'all' && ` | 種別: ${courseTypes.find(t => t.value === selectedCourseType)?.label}`}
            {selectedSemesters.length > 0 && ` | 学期: ${selectedSemesters.join(', ')}`}
            {showRegisteredOnly && ' | 登録済みのみ'}
          </div>
        )}
      </div>

      {/* 講義一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">講義一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{course.courseName}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`text-xs ${getCourseTypeColor(course.courseType)}`}>
                          {getCourseTypeLabel(course.courseType)}
                        </Badge>
                        {course.group && (
                          <Badge variant="outline" className="text-xs">
                            {course.group}群
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">{course.credits}単位</span>
                        <span className="text-sm text-gray-500">{course.year}年 {course.semester}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{course.faculty} {course.department}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={course.isRegistered ? "destructive" : "default"}
                    onClick={() => handleRegistrationToggle(course.id, course.isRegistered || false)}
                  >
                    {course.isRegistered ? '履修解除' : '履修登録'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">該当する講義が見つかりませんでした</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
