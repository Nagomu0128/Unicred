'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';

interface Course {
  id: string;
  courseName: string;
  courseType: 'specialized' | 'general' | 'specializedBasic' | 'secondLanguage' | 'physical';
  courseCode: string;
  dayOfWeek: number; // 0: 月曜, 1: 火曜, ..., 5: 土曜
  period: number; // 1-6限
  semester: string;
  year: number;
  credits: number;
}

interface TimetableData {
  year: number;
  semester: string;
  courses: Course[];
}

export default function SchedulePage() {
  const { user, userProfile } = useAuth();
  const [timetableData, setTimetableData] = useState<TimetableData[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newDayOfWeek, setNewDayOfWeek] = useState<number>(0);
  const [newPeriod, setNewPeriod] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    // 実際の実装ではFirestoreから時間割データを取得
    // TODO: Firestoreから時間割データを取得する処理を実装
    setTimetableData([]);
    setLoading(false);
  }, []);

  const getCourseTypeLabel = (type: string) => {
    switch (type) {
      case 'specialized':
        return '専門科目';
      case 'general':
        return '基盤教養';
      case 'specializedBasic':
        return '専門基礎科目';
      case 'secondLanguage':
        return '第二外国語';
      case 'physical':
        return '健康スポーツ';
      case 'information':
        return '情報教育';
      case 'advanced':
        return 'アドヴァンスト・セミナー';
      case 'comprehensive':
        return '総合英語';
      case 'practical':
        return '実践英語';
      case 'global':
        return 'グローバル理解';
      case 'advancedInternational':
        return '高度国際性涵養教育科目';
      case 'advancedLiberal':
        return '高度教養教育科目';
      case 'academic':
        return '学問の扉';
      default:
        return 'その他';
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

  const handleCourseClick = (course: Course) => {
    setEditingCourse(course);
    setNewDayOfWeek(course.dayOfWeek);
    setNewPeriod(course.period);
    setIsModalOpen(true);
  };

  const handleSaveChanges = () => {
    if (!editingCourse) return;

    // 実際の実装ではFirestoreを更新
    setTimetableData(prevData => {
      return prevData.map(timetable => {
        if (timetable.year === editingCourse.year && timetable.semester === editingCourse.semester) {
          return {
            ...timetable,
            courses: timetable.courses.map(course => 
              course.id === editingCourse.id 
                ? { ...course, dayOfWeek: newDayOfWeek, period: newPeriod }
                : course
            )
          };
        }
        return timetable;
      });
    });

    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const getCurrentTimetable = () => {
    if (!selectedTimetable || timetableData.length === 0) {
      return { year: 2025, semester: '前期', courses: [] };
    }
    // 選択された時間割を取得
    const [year, semester] = selectedTimetable.split('-');
    return timetableData.find(t => t.year.toString() === year && t.semester === semester) || 
           { year: 2025, semester: '前期', courses: [] };
  };

  const getCourseAtSlot = (dayOfWeek: number, period: number) => {
    const currentTimetable = getCurrentTimetable();
    return currentTimetable.courses.find(course => 
      course.dayOfWeek === dayOfWeek && course.period === period
    );
  };

  const daysOfWeek = ['月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];
  const periods = [
    { number: 1, time: '9:00-10:30' },
    { number: 2, time: '10:40-12:10' },
    { number: 3, time: '13:10-14:40' },
    { number: 4, time: '14:50-16:20' },
    { number: 5, time: '16:30-18:00' },
    { number: 6, time: '18:10-19:40' }
  ];

  const timetableOptions = timetableData.map(t => ({
    value: `${t.year}-${t.semester}`,
    label: `${t.year}年度 ${t.semester}`
  }));

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">時間割</h1>
          <p className="text-gray-600">時間割情報を読み込み中...</p>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // 時間割データが空の場合
  if (timetableData.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">時間割</h1>
          <p className="text-gray-600">登録済みの履修科目の時間割を確認できます</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">時間割が登録されていません</h3>
            <p className="text-gray-500">履修登録を行ってから時間割を確認してください。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentTimetable = getCurrentTimetable();

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">時間割</h1>
        <p className="text-gray-600">登録済みの履修科目の時間割を確認できます</p>
      </div>

      {/* 学期選択 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">学期選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">表示する学期:</label>
            <Select value={selectedTimetable} onValueChange={setSelectedTimetable}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="学期を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {timetableOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 時間割グリッド */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentTimetable.year}年度 {currentTimetable.semester} 時間割
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[900px] border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="w-20 p-3 text-center font-medium text-gray-600">
                      時限
                    </th>
                    {daysOfWeek.map((day) => (
                      <th key={day} className="p-3 text-center font-medium text-gray-600">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => (
                    <tr key={period.number} className="border-b border-gray-300 last:border-b-0">
                      {/* 時限列 */}
                      <td className="w-20 p-3 text-center text-sm text-gray-600 bg-gray-50">
                        <div className="font-medium">{period.number}限</div>
                        <div className="text-xs">{period.time}</div>
                      </td>
                      
                      {/* 曜日列 */}
                      {daysOfWeek.map((_, dayIndex) => {
                        const course = getCourseAtSlot(dayIndex, period.number);
                        return (
                          <td key={dayIndex} className="p-2 min-h-[90px] align-top w-1/6">
                        {course ? (
                          <div 
                            className="h-full p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleCourseClick(course)}
                          >
                            <div className="space-y-1">
                              <div className="font-medium text-sm text-gray-900 line-clamp-2 break-words">
                                {course.courseName}
                              </div>
                              <Badge 
                                className={`text-xs ${getCourseTypeColor(course.courseType)}`}
                              >
                                {getCourseTypeLabel(course.courseType)}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                              <div className="h-full p-2 bg-white min-h-[60px]">
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 講義統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">講義統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(() => {
              // 登録されている講義種別を取得
              const courseTypes = [...new Set(currentTimetable.courses.map(course => course.courseType))];
              
              return courseTypes.map((type) => {
                const count = currentTimetable.courses.filter(course => course.courseType === type).length;
                return (
                  <div key={type} className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCourseTypeColor(type)}`}>
                      {getCourseTypeLabel(type)}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-500">科目</div>
                  </div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>

      {/* 講義編集モーダル */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>講義の時限を変更</DialogTitle>
            <DialogDescription>
              {editingCourse?.courseName} の曜日と時限を変更できます。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="dayOfWeek" className="text-right text-sm font-medium">
                曜日
              </label>
              <Select value={newDayOfWeek.toString()} onValueChange={(value) => setNewDayOfWeek(parseInt(value))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="曜日を選択" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="period" className="text-right text-sm font-medium">
                時限
              </label>
              <Select value={newPeriod.toString()} onValueChange={(value) => setNewPeriod(parseInt(value))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="時限を選択" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.number} value={period.number.toString()}>
                      {period.number}限 ({period.time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              キャンセル
            </Button>
            <Button onClick={handleSaveChanges}>
              変更を保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
