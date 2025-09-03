"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { universityData } from "@/lib/universityInfo";
import { grades } from "@/lib/universityInfo";

type UniversityData = typeof universityData;
type UniversityName = keyof UniversityData;

export default function UserRegistrationPage() {
  const [name, setName] = useState('');
  const [university, setUniversity] = useState<UniversityName | ''>('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [grade, setGrade] = useState('');

  const faculties = useMemo(() => {
    return university ? Object.keys(universityData[university]) : [];
  }, [university]);

  const departments = useMemo(() => {
    if (university && faculty) {
      const currentUniversityData = universityData[university];
      if (currentUniversityData && faculty in currentUniversityData) {
        return Object.keys(currentUniversityData[faculty as keyof typeof currentUniversityData]);
      }
    }
    return [];
  }, [university, faculty]);

  const courses = useMemo(() => {
    if (university && faculty && department) {
      const currentUniversityData = universityData[university];
      if (currentUniversityData && faculty in currentUniversityData) {
        const currentFacultyData = currentUniversityData[faculty as keyof typeof currentUniversityData];
        if (currentFacultyData && department in currentFacultyData) {
          return currentFacultyData[department as keyof typeof currentFacultyData] || [];
        }
      }
    }
    return [];
  }, [university, faculty, department]);

  const handleUniversityChange = (value: UniversityName) => {
    setUniversity(value);
    setFaculty('');
    setDepartment('');
    setCourse('');
  };

  const handleFacultyChange = (value: string) => {
    setFaculty(value);
    setDepartment('');
    setCourse('');
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setCourse('');
  };

  const isSubmittable = name && university && faculty && department && grade;

  const handleSubmit = () => {
    if (!isSubmittable) {
      alert('すべての必須項目を入力してください。');
      return;
    }
    const formData = {
      name,
      university,
      faculty,
      department,
      course: course || 'N/A',
      grade,
    };
    console.log("登録データ:", formData);
    alert('登録が完了しました！');
  };

  return (
    <div className="font-sans flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-lg w-11/12 border border-gray-100">
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ユーザー情報登録</h1>
          <p className="text-gray-600 text-sm">基本情報を入力してください</p>
        </div>

        <div className="space-y-6 text-left">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">氏名</Label>
            <Input 
              id="name" 
              placeholder="山田 太郎" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-800 mb-2">大学</Label>
            <Select onValueChange={handleUniversityChange} value={university}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                <SelectValue placeholder="大学を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(universityData).map((uni) => (
                  <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-800 mb-2">学部</Label>
            <Select onValueChange={handleFacultyChange} value={faculty} disabled={!university}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                <SelectValue placeholder="学部を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((fac) => (
                  <SelectItem key={fac} value={fac}>{fac}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-800 mb-2">学科</Label>
            <Select onValueChange={handleDepartmentChange} value={department} disabled={!faculty}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                <SelectValue placeholder="学科を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dep) => (
                  <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-800 mb-2">コース <span className="text-gray-500 text-xs">(任意)</span></Label>
            <Select onValueChange={setCourse} value={course} disabled={!department || courses.length === 0}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                <SelectValue placeholder="コースを選択してください" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((cour: string) => (
                  <SelectItem key={cour} value={cour}>{cour}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-800 mb-2">学年</Label>
            <Select onValueChange={setGrade} value={grade}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                <SelectValue placeholder="学年を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-all duration-300 ease-in-out mt-8" 
          onClick={handleSubmit} 
          disabled={!isSubmittable}
        >
          登録する
        </Button>

        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="text-green-800 font-medium text-sm">プロフィール設定完了</span>
          </div>
          <p className="text-green-700 text-xs">履修計画に最適化された機能をご利用いただけます</p>
        </div>
      </div>
    </div>
  );
}