'use client';

import React, { useState } from 'react';
import { CourseFormData, ACADEMIC_YEARS, LECTURE_FORMATS, SPECIALIZATION_LEVELS, SPECIALIZATION_FIELDS } from '@/lib/types/course';
import { universityData } from '@/lib/universityInfo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface CourseFormProps {
  onSubmit: (data: CourseFormData) => Promise<void>;
  loading?: boolean;
}

export const CourseForm: React.FC<CourseFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<CourseFormData>({
    academicYear: [],
    lectureFormat: '',
    courseName: '',
    credits: 0,
    department: {
      faculty: '',
      department: '',
      course: ''
    },
    courseClassification: {
      gatewayToLearning: false,
      foundationalLiberalArts: false,
      informationEducation: false,
      healthSports: false,
      advancedSeminar: false,
      specializedBasic: false,
      specialized: false,
      generalEnglish: false,
      practicalEnglish: false,
      secondForeignLanguage: false,
      globalUnderstanding: false,
      international: false,
      general: false
    },
    specializationRelevance: {
      electrical: '-',
      quantum: '-',
      communication: '-',
      information: '-'
    },
    offeringPeriod: {
      spring: false,
      summer: false,
      autumn: false,
      winter: false,
      intensive: false,
      online: false
    }
  });

  // 選択された授業科目の区分を管理
  const [selectedClassification, setSelectedClassification] = useState<string>('');
  
  // 学部学科コースの選択状態を管理
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // 学部選択の処理
  const handleFacultyChange = (faculty: string) => {
    setSelectedFaculty(faculty);
    setSelectedDepartment('');
    setFormData(prev => ({
      ...prev,
      department: {
        faculty,
        department: '',
        course: ''
      }
    }));
  };

  // 学科選択の処理
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    setFormData(prev => ({
      ...prev,
      department: {
        ...prev.department,
        department,
        course: ''
      }
    }));
  };

  // コース選択の処理
  const handleCourseChange = (course: string) => {
    setFormData(prev => ({
      ...prev,
      department: {
        ...prev.department,
        course
      }
    }));
  };

  // 授業科目の区分の選択を処理
  const handleClassificationChange = (classification: string) => {
    setSelectedClassification(classification);
    
    // すべての区分をfalseにリセット
    const newClassification = {
      gatewayToLearning: false,
      foundationalLiberalArts: false,
      informationEducation: false,
      healthSports: false,
      advancedSeminar: false,
      specializedBasic: false,
      specialized: false,
      generalEnglish: false,
      practicalEnglish: false,
      secondForeignLanguage: false,
      globalUnderstanding: false,
      international: false,
      general: false
    };

    // 選択された区分のみtrueに設定
    if (classification) {
      newClassification[classification as keyof typeof newClassification] = true;
    }

    setFormData(prev => ({
      ...prev,
      courseClassification: newClassification,
      // 専門科目の分類が無効になった場合、専門科目の分類をリセット
      specializationRelevance: (classification === 'specializedBasic' || classification === 'specialized') 
        ? prev.specializationRelevance 
        : {
            electrical: '-',
            quantum: '-',
            communication: '-',
            information: '-'
          }
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const newData = {
          ...prev,
          [parent]: {
            ...prev[parent as 'courseClassification' | 'specializationRelevance' | 'offeringPeriod'],
            [child]: value
          }
        };

        // 専門科目の分類が無効になった場合、専門科目の分類をリセット
        if (parent === 'courseClassification' && (child === 'specializedBasic' || child === 'specialized')) {
          const isSpecializationEnabled = (child === 'specializedBasic' && value) || 
                                        (child === 'specialized' && value) ||
                                        (child === 'specializedBasic' && prev.courseClassification.specialized) ||
                                        (child === 'specialized' && prev.courseClassification.specializedBasic);
          
          if (!isSpecializationEnabled) {
            newData.specializationRelevance = {
              electrical: '-',
              quantum: '-',
              communication: '-',
              information: '-'
            };
          }
        }

        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // 専門科目の分類が有効かどうかを判定
  const isSpecializationEnabled = formData.courseClassification.specializedBasic || formData.courseClassification.specialized;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション：最低1つの学年が選択されているかチェック
    if (formData.academicYear.length === 0) {
      alert('最低1つの学年を選択してください');
      return;
    }
    
    // バリデーション：学部学科が選択されているかチェック
    if (!formData.department.faculty || !formData.department.department) {
      alert('学部と学科を選択してください');
      return;
    }
    
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">基本情報</CardTitle>
          <CardDescription>講義の基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 学部学科コース選択 */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800">学部学科コース</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty">
                  学部 <span className="text-green-500">*</span>
                </Label>
                <Select
                  value={selectedFaculty}
                  onValueChange={handleFacultyChange}
                  required
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
                    <SelectValue placeholder="学部を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(universityData['大阪大学']).map(faculty => (
                      <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">
                  学科 <span className="text-green-500">*</span>
                </Label>
                <Select
                  value={selectedDepartment}
                  onValueChange={handleDepartmentChange}
                  disabled={!selectedFaculty}
                  required
                >
                  <SelectTrigger className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    !selectedFaculty ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}>
                    <SelectValue placeholder="学科を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFaculty && Object.keys(universityData['大阪大学'][selectedFaculty as keyof typeof universityData['大阪大学']]).map(department => (
                      <SelectItem key={department} value={department}>{department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">
                  コース
                </Label>
                <Select
                  value={formData.department.course || ''}
                  onValueChange={handleCourseChange}
                  disabled={!selectedDepartment}
                >
                  <SelectTrigger className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    !selectedDepartment ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}>
                    <SelectValue placeholder="コースを選択してください（任意）" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFaculty && selectedDepartment && 
                      universityData['大阪大学'][selectedFaculty as keyof typeof universityData['大阪大学']][selectedDepartment]?.map(course => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">
                配当学年 <span className="text-green-500">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ACADEMIC_YEARS.map(year => (
                  <div key={year} className="flex items-center space-x-2">
                    <Checkbox
                      id={`academicYear-${year}`}
                      checked={formData.academicYear.includes(year)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          // 学年を追加
                          setFormData(prev => ({
                            ...prev,
                            academicYear: [...prev.academicYear, year]
                          }));
                        } else {
                          // 学年を削除
                          setFormData(prev => ({
                            ...prev,
                            academicYear: prev.academicYear.filter(y => y !== year)
                          }));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`academicYear-${year}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {year}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.academicYear.length === 0 && (
                <p className="text-sm text-red-500">最低1つの学年を選択してください</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lectureFormat">
                授業形態 <span className="text-green-500">*</span>
              </Label>
              <Select
                value={formData.lectureFormat}
                onValueChange={(value) => handleInputChange('lectureFormat', value)}
                required
              >
                <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                  <SelectValue placeholder="授業形態を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {LECTURE_FORMATS.map(format => (
                    <SelectItem key={format} value={format}>{format}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="courseName">
                授業科目 <span className="text-green-500">*</span>
              </Label>
              <Input
                id="courseName"
                type="text"
                value={formData.courseName}
                onChange={(e) => handleInputChange('courseName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                placeholder="例: コンピュータシステム I"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits">
                単位数 <span className="text-green-500">*</span>
              </Label>
              <Input
                id="credits"
                type="number"
                value={formData.credits}
                onChange={(e) => handleInputChange('credits', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                min="0"
                max="10"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 授業科目の区分 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">授業科目の区分</CardTitle>
          <CardDescription>該当する教育区分を一つ選択してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'gatewayToLearning', label: '学問の扉' },
              { key: 'foundationalLiberalArts', label: '基盤教養' },
              { key: 'informationEducation', label: '情報教育' },
              { key: 'healthSports', label: '健康スポーツ' },
              { key: 'advancedSeminar', label: 'アドヴァンスト・セミナー' },
              { key: 'specializedBasic', label: '専門基礎科目' },
              { key: 'specialized', label: '専門科目' },
              { key: 'generalEnglish', label: '総合英語' },
              { key: 'practicalEnglish', label: '実践英語' },
              { key: 'secondForeignLanguage', label: '第二外国語' },
              { key: 'globalUnderstanding', label: 'グローバル理解' },
              { key: 'international', label: '高度国際性涵養教育科目' },
              { key: 'general', label: '高度教養教育科目' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`courseClassification.${key}`}
                  name="courseClassification"
                  value={key}
                  checked={selectedClassification === key}
                  onChange={(e) => handleClassificationChange(e.target.value)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                />
                <Label
                  htmlFor={`courseClassification.${key}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 専門分野の関連性 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">専門科目の分類</CardTitle>
          <CardDescription>
            {isSpecializationEnabled 
              ? '専門科目の場合、その分類を選択してください' 
              : '専門基礎教育科目または専門教育科目を選択すると、専門科目の分類が有効になります'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SPECIALIZATION_FIELDS.map(field => (
              <div key={field.key} className="flex items-center space-x-4">
                <Label className="w-48 text-sm font-medium text-gray-700">
                  {field.label}
                </Label>
                <Select
                  value={formData.specializationRelevance[field.key as keyof typeof formData.specializationRelevance]}
                  onValueChange={(value) => handleInputChange(`specializationRelevance.${field.key}`, value)}
                  disabled={!isSpecializationEnabled}
                >
                  <SelectTrigger className={`w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 ${
                    !isSpecializationEnabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    <SelectValue placeholder="分類を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATION_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 開講区分 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">開講区分</CardTitle>
          <CardDescription>開講される学期を選択してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(formData.offeringPeriod).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`offeringPeriod.${key}`}
                  checked={value}
                  onCheckedChange={(checked) => handleInputChange(`offeringPeriod.${key}`, checked)}
                />
                <Label
                  htmlFor={`offeringPeriod.${key}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {key === 'spring' && '春学期'}
                  {key === 'summer' && '夏学期'}
                  {key === 'autumn' && '秋学期'}
                  {key === 'winter' && '冬学期'}
                  {key === 'intensive' && '集中'}
                  {key === 'online' && 'オンライン'}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 送信ボタン */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '追加中...' : '講義を追加'}
        </Button>
      </div>
    </form>
  );
};
