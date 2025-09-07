'use client';

import React, { useState } from 'react';
import { CourseFormData, ACADEMIC_YEARS, LECTURE_FORMATS, SPECIALIZATION_LEVELS, SPECIALIZATION_FIELDS } from '@/lib/types/course';
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
    academicYear: '',
    lectureFormat: '',
    courseName: '',
    credits: 0,
    courseClassification: {
      specializedBasic: false,
      specialized: false,
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
      intensive: false
    }
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">
                配当学年 <span className="text-green-500">*</span>
              </Label>
              <Select
                value={formData.academicYear}
                onValueChange={(value) => handleInputChange('academicYear', value)}
                required
              >
                <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                  <SelectValue placeholder="学年を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <CardDescription>該当する教育区分を選択してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(formData.courseClassification).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`courseClassification.${key}`}
                  checked={value}
                  onCheckedChange={(checked) => handleInputChange(`courseClassification.${key}`, checked)}
                />
                <Label
                  htmlFor={`courseClassification.${key}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {key === 'specializedBasic' && '専門基礎教育科目'}
                  {key === 'specialized' && '専門教育科目'}
                  {key === 'international' && '高度国際性涵養教育科目'}
                  {key === 'general' && '高度教養教育科目'}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 専門分野の関連性 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">専門分野の関連性</CardTitle>
          <CardDescription>各専門分野との関連性レベルを選択してください</CardDescription>
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
                >
                  <SelectTrigger className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                    <SelectValue placeholder="関連性を選択" />
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
