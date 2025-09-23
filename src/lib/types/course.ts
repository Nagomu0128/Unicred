// 講義データの型定義
export interface Course {
  id?: string;
  academicYear: string[]; // 配当学年（複数選択可能）
  lectureFormat: string; // 授業形態
  courseName: string; // 授業科目
  credits: number; // 単位数
  department: {
    faculty: string; // 学部
    department: string; // 学科
    course?: string; // コース（オプション）
  };
  courseClassification: {
    gatewayToLearning: boolean; // 学問の扉
    foundationalLiberalArts: boolean; // 基盤教養
    informationEducation: boolean; // 情報教育
    healthSports: boolean; // 健康スポーツ
    advancedSeminar: boolean; // アドヴァンスト・セミナー
    specializedBasic: boolean; // 専門基礎科目
    specialized: boolean; // 専門科目
    generalEnglish: boolean; // 総合英語
    practicalEnglish: boolean; // 実践英語
    secondForeignLanguage: boolean; // 第二外国語
    globalUnderstanding: boolean; // グローバル理解
    international: boolean; // 高度国際性涵養教育科目
    general: boolean; // 高度教養教育科目
  };
  specializationRelevance: {
    electrical: string; // 電気工学 (◎, O, A, B, C, F, G, -)
    quantum: string; // 量子情報エレクトロニクス
    communication: string; // 通信工学
    information: string; // 情報システム工学
  };
  offeringPeriod: {
    spring: boolean; // 春学期
    summer: boolean; // 夏学期
    autumn: boolean; // 秋学期
    winter: boolean; // 冬学期
    intensive: boolean; // 集中
    online: boolean; // オンライン
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseFormData {
  academicYear: string[];
  lectureFormat: string;
  courseName: string;
  credits: number;
  department: {
    faculty: string;
    department: string;
    course?: string;
  };
  courseClassification: {
    gatewayToLearning: boolean;
    foundationalLiberalArts: boolean;
    informationEducation: boolean;
    healthSports: boolean;
    advancedSeminar: boolean;
    specializedBasic: boolean;
    specialized: boolean;
    generalEnglish: boolean;
    practicalEnglish: boolean;
    secondForeignLanguage: boolean;
    globalUnderstanding: boolean;
    international: boolean;
    general: boolean;
  };
  specializationRelevance: {
    electrical: string;
    quantum: string;
    communication: string;
    information: string;
  };
  offeringPeriod: {
    spring: boolean;
    summer: boolean;
    autumn: boolean;
    winter: boolean;
    intensive: boolean;
    online: boolean;
  };
}

// 定数定義
export const ACADEMIC_YEARS = ['1年', '2年', '3年', '4年'] as const;

export const LECTURE_FORMATS = [
  '講義',
  '講義・演習',
  '実験',
  '演習',
  '実習',
  'ゼミナール',
  '卒業研究',
  'オンライン'
] as const;

export const SPECIALIZATION_LEVELS = [
  { value: '◎', label: '◎ (コア科目)' },
  { value: 'O', label: 'O (関連科目)' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'F', label: 'F' },
  { value: 'G', label: 'G' },
  { value: '-', label: '- (該当なし)' }
] as const;

export const SPECIALIZATION_FIELDS = [
  { key: 'electrical', label: '電気工学' },
  { key: 'quantum', label: '量子情報エレクトロニクス' },
  { key: 'communication', label: '通信工学' },
  { key: 'information', label: '情報システム工学' }
] as const;
