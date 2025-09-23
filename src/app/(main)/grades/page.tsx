'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { calculateGPA, calculateFilteredGPA, calculateSemesterGPA, calculateOverallGPA, formatGPA, getGPAColorClass, type GradeData, type SemesterGPAData, type OverallGPAData } from '@/services/gpaCalculator';

interface Grade {
  id: string;
  courseName: string;
  courseCode: string;
  courseType: 'specialized' | 'general' | 'specializedBasic' | 'secondLanguage' | 'physical' | 'information' | 'advanced' | 'comprehensive' | 'practical' | 'global' | 'advancedInternational' | 'advancedLiberal' | 'academic';
  credits: number;
  grade: string;
  semester: string;
  year: number;
  gp: number;
  group?: string; // 専門科目の群分け（A、B、C、Ⅰ、Ⅱなど）
}

export default function GradesPage() {
  const { user, userProfile } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [expandedSpecializedGroup, setExpandedSpecializedGroup] = useState<string | null>(null);


  useEffect(() => {
    // 実際の実装ではFirestoreから成績データを取得
    // TODO: Firestoreから成績データを取得する処理を実装
    setGrades([]);
    setLoading(false);
  }, []);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'A':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'B':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  const filteredGrades = grades.filter(grade => {
    const semesterMatch = selectedSemester === 'all' || grade.semester === selectedSemester;
    const yearMatch = selectedYear === 'all' || grade.year.toString() === selectedYear;
    return semesterMatch && yearMatch;
  });

  const calculateCurrentGPA = () => {
    const gradeData: GradeData[] = filteredGrades.map(grade => ({
      grade: grade.grade,
      credits: grade.credits
    }));
    return calculateGPA(gradeData);
  };

  const calculateCurrentSemesterGPA = () => {
    // 現在選択されている学期・年度のGPAを計算
    const currentSemesterGrades = filteredGrades.filter(grade => 
      grade.semester === selectedSemester || selectedSemester === 'all'
    ).filter(grade => 
      grade.year.toString() === selectedYear || selectedYear === 'all'
    );

    const gradeData: GradeData[] = currentSemesterGrades.map(grade => ({
      grade: grade.grade,
      credits: grade.credits
    }));

    const currentYear = selectedYear !== 'all' ? parseInt(selectedYear) : 2024;
    const currentSemester = selectedSemester !== 'all' ? selectedSemester : '前期';

    return calculateSemesterGPA(gradeData, currentSemester, currentYear);
  };

  const calculateCurrentOverallGPA = () => {
    // 全学期の成績を整理
    const allSemesterGrades = grades.reduce((acc, grade) => {
      const key = `${grade.year}-${grade.semester}`;
      if (!acc[key]) {
        acc[key] = { grades: [], semester: grade.semester, year: grade.year };
      }
      acc[key].grades.push({
        grade: grade.grade,
        credits: grade.credits
      });
      return acc;
    }, {} as Record<string, { grades: GradeData[], semester: string, year: number }>);

    const semesterData = Object.values(allSemesterGrades);
    return calculateOverallGPA(semesterData);
  };

  const getTotalCredits = () => {
    return filteredGrades.reduce((sum, grade) => sum + grade.credits, 0);
  };

  // 分野別の単位取得状況を計算
  const getCategoryProgress = () => {
    const categoryTotals: Record<string, { earned: number; required: number; courses: Grade[] }> = {
      'academic': { earned: 0, required: 2, courses: [] },
      'general': { earned: 0, required: 4, courses: [] },
      'information': { earned: 0, required: 2, courses: [] },
      'physical': { earned: 0, required: 2, courses: [] },
      'advanced': { earned: 0, required: 2, courses: [] },
      'specializedBasic': { earned: 0, required: 24, courses: [] },
      'specialized': { earned: 0, required: 81, courses: [] },
      'comprehensive': { earned: 0, required: 6, courses: [] },
      'practical': { earned: 0, required: 2, courses: [] },
      'secondLanguage': { earned: 0, required: 2, courses: [] },
      'global': { earned: 0, required: 4, courses: [] },
      'advancedInternational': { earned: 0, required: 1, courses: [] },
      'advancedLiberal': { earned: 0, required: 1, courses: [] }
    };

    // フィルターされた成績を各分野に分類
    filteredGrades.forEach(grade => {
      if (categoryTotals[grade.courseType]) {
        categoryTotals[grade.courseType].earned += grade.credits;
        categoryTotals[grade.courseType].courses.push(grade);
      }
    });

    return Object.entries(categoryTotals).map(([type, data]) => ({
      type,
      label: getCourseTypeLabel(type),
      earned: data.earned,
      required: data.required,
      progress: Math.min((data.earned / data.required) * 100, 100),
      courses: data.courses,
      color: getCourseTypeColor(type)
    })).filter(item => item.earned > 0 || item.required > 0); // 取得済みまたは必要単位がある分野のみ表示
  };

  // 専門科目の群分け進捗を計算
  const getSpecializedGroupProgress = () => {
    const specializedGrades = filteredGrades.filter(grade => 
      grade.courseType === 'specialized' && grade.group
    );

    const groupTotals: Record<string, { earned: number; required: number; courses: Grade[] }> = {};

    // 各群の必要単位数を設定（実際の実装ではFirestoreから取得）
    const groupRequirements: Record<string, number> = {
      'A': 12, // 基礎プログラミング群
      'B': 9,  // 機械学習群
      'C': 6,  // グラフィックス群
      'Ⅰ': 6,  // ソフトウェア工学群
      'Ⅱ': 6   // システム設計群
    };

    specializedGrades.forEach(grade => {
      if (grade.group) {
        if (!groupTotals[grade.group]) {
          groupTotals[grade.group] = { 
            earned: 0, 
            required: groupRequirements[grade.group] || 6, 
            courses: [] 
          };
        }
        groupTotals[grade.group].earned += grade.credits;
        groupTotals[grade.group].courses.push(grade);
      }
    });

    return Object.entries(groupTotals).map(([group, data]) => ({
      group,
      label: `専門科目 ${group}群`,
      earned: data.earned,
      required: data.required,
      progress: Math.min((data.earned / data.required) * 100, 100),
      courses: data.courses,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    })).filter(item => item.earned > 0 || item.required > 0);
  };

  const gpaData = calculateCurrentGPA();
  const semesterGPA = calculateCurrentSemesterGPA();
  const overallGPA = calculateCurrentOverallGPA();

  const uniqueYears = [...new Set(grades.map(grade => grade.year))].sort((a, b) => b - a);
  const uniqueSemesters = [...new Set(grades.map(grade => grade.semester))];

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">成績管理</h1>
          <p className="text-gray-600">成績情報を読み込み中...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">成績管理</h1>
        <p className="text-gray-600">履修科目の成績を確認できます</p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">学期GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGPAColorClass(semesterGPA.gpa)}`}>
              {formatGPA(semesterGPA.gpa)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {selectedYear !== 'all' ? `${selectedYear}年 ` : '2024年 '}
              {selectedSemester !== 'all' ? selectedSemester : '前期'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">通算GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGPAColorClass(overallGPA.gpa)}`}>
              {formatGPA(overallGPA.gpa)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              全学期合計
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">取得単位数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gpaData.totalCredits}</div>
            <div className="text-xs text-gray-500 mt-1">
              表示中の成績
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">履修科目数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{gpaData.gradeCount}</div>
            <div className="text-xs text-gray-500 mt-1">
              表示中の成績
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タブ形式の表示切り替え */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">成績一覧</TabsTrigger>
          <TabsTrigger value="progress">分野別進捗</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
          {/* フィルター */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">フィルター</CardTitle>
              <CardDescription>
                年度と学期で成績を絞り込むことができます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="year-filter" className="text-sm font-medium">
                    年度
                  </Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="year-filter">
                      <SelectValue placeholder="年度を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {uniqueYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester-filter" className="text-sm font-medium">
                    学期
                  </Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger id="semester-filter">
                      <SelectValue placeholder="学期を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {uniqueSemesters.map(semester => (
                        <SelectItem key={semester} value={semester}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    表示中: {filteredGrades.length}件の成績データ
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedYear('all');
                        setSelectedSemester('all');
                      }}
                    >
                      リセット
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 成績一覧 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">成績一覧</CardTitle>
              <CardDescription>
                {filteredGrades.length}件の成績データ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredGrades.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">該当する成績データがありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGrades.map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-medium text-gray-900">{grade.courseName}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`text-xs ${getCourseTypeColor(grade.courseType)}`}>
                                {getCourseTypeLabel(grade.courseType)}
                              </Badge>
                              <p className="text-sm text-gray-500">{grade.credits}単位</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{grade.year}年 {grade.semester}</p>
                        </div>
                        <Badge className={`${getGradeColor(grade.grade)} font-semibold`}>
                          {grade.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* 分野別進捗 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">分野別単位取得状況</CardTitle>
              <CardDescription>
                卒業までに必要な講義種別の単位取得状況を確認できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {getCategoryProgress().map((category) => (
                  <div key={category.type} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge className={`text-sm px-3 py-1 ${category.color}`}>
                          {category.label}
                        </Badge>
                        <span className="text-base font-medium text-gray-700">
                          {category.earned} / {category.required} 単位
                        </span>
                        {category.type === 'specialized' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedSpecializedGroup(
                              expandedSpecializedGroup === 'specialized' ? null : 'specialized'
                            )}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            {expandedSpecializedGroup === 'specialized' ? '詳細を閉じる' : '詳細を表示'}
                          </Button>
                        )}
                      </div>
                      <span className="text-base font-semibold text-emerald-600">
                        {Math.round(category.progress)}%
                      </span>
                    </div>
                    <Progress 
                      value={category.progress} 
                      className="h-3"
                    />
                    
                    {/* 専門科目の群分け表示 */}
                    {category.type === 'specialized' && expandedSpecializedGroup === 'specialized' && (
                      <div className="ml-4 mt-4 space-y-4 border-l-2 border-blue-200 pl-4">
                        {getSpecializedGroupProgress().map((group) => (
                          <div key={group.group} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Badge className={`text-xs px-2 py-1 ${group.color}`}>
                                  {group.label}
                                </Badge>
                                <span className="text-sm font-medium text-gray-700">
                                  {group.earned} / {group.required} 単位
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-emerald-500">
                                {Math.round(group.progress)}%
                              </span>
                            </div>
                            <Progress 
                              value={group.progress} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
