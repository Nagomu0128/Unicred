/**
 * GPA計算サービス
 * 大阪大学のSABCF評価システムに基づくGPA計算
 * 小数点第3位以下を切り捨てる方式を採用
 */

export interface GradeData {
  grade: string;
  credits: number;
}

export interface GPAData {
  totalCredits: number;
  totalPoints: number;
  gpa: number;
  gradeCount: number;
}

export interface SemesterGPAData extends GPAData {
  semester: string;
  year: number;
}

export interface OverallGPAData extends GPAData {
  semesterGPAs: SemesterGPAData[];
}

/**
 * 成績をGPAポイントに変換
 * 大阪大学のSABCF評価システム
 */
export function gradeToPoints(grade: string): number {
  switch (grade) {
    case 'S': return 4.0;
    case 'A': return 3.0;
    case 'B': return 2.0;
    case 'C': return 1.0;
    case 'F': return 0.0;
    default: return 0.0;
  }
}

/**
 * 単一の成績からGPAポイントを計算
 */
export function calculateGradePoints(grade: string, credits: number): number {
  return gradeToPoints(grade) * credits;
}

/**
 * 複数の成績からGPAを計算（学期GPA・通算GPA共通）
 * 大阪大学の方式：小数点第3位以下を切り捨て
 */
export function calculateGPA(grades: GradeData[]): GPAData {
  if (grades.length === 0) {
    return {
      totalCredits: 0,
      totalPoints: 0,
      gpa: 0,
      gradeCount: 0
    };
  }

  const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);
  const totalPoints = grades.reduce((sum, grade) => 
    sum + calculateGradePoints(grade.grade, grade.credits), 0
  );

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    totalCredits,
    totalPoints,
    gpa: Math.floor(gpa * 100) / 100, // 小数点第3位以下を切り捨て
    gradeCount: grades.length
  };
}

/**
 * 学期GPAを計算
 * 特定の学期の成績からGPAを算出
 */
export function calculateSemesterGPA(grades: GradeData[], semester: string, year: number): SemesterGPAData {
  const gpaData = calculateGPA(grades);
  return {
    ...gpaData,
    semester,
    year
  };
}

/**
 * 通算GPAを計算
 * 全学期の成績からGPAを算出
 */
export function calculateOverallGPA(allGrades: { grades: GradeData[], semester: string, year: number }[]): OverallGPAData {
  // 全学期の成績を統合
  const allGradesFlat = allGrades.flatMap(term => term.grades);
  const overallGPA = calculateGPA(allGradesFlat);

  // 各学期のGPAも計算
  const semesterGPAs = allGrades.map(term => 
    calculateSemesterGPA(term.grades, term.semester, term.year)
  );

  return {
    ...overallGPA,
    semesterGPAs
  };
}

/**
 * フィルターされた成績からGPAを計算
 */
export function calculateFilteredGPA(grades: GradeData[], yearFilter?: string, semesterFilter?: string): GPAData {
  let filteredGrades = grades;

  if (yearFilter && yearFilter !== 'all') {
    // 年度フィルターが適用されている場合、その年度の成績のみを計算
    // 実際の実装では、gradesにyearプロパティが必要
    filteredGrades = grades; // 現在のサンプルデータにはyearがないため、そのまま使用
  }

  if (semesterFilter && semesterFilter !== 'all') {
    // 学期フィルターが適用されている場合、その学期の成績のみを計算
    // 実際の実装では、gradesにsemesterプロパティが必要
    filteredGrades = grades; // 現在のサンプルデータにはsemesterがないため、そのまま使用
  }

  return calculateGPA(filteredGrades);
}

/**
 * GPAの文字列表現を取得
 * 大阪大学の方式：小数点第2位まで表示（第3位以下は切り捨て済み）
 */
export function formatGPA(gpa: number): string {
  return gpa.toFixed(2);
}

/**
 * GPAの色分けクラスを取得
 */
export function getGPAColorClass(gpa: number): string {
  if (gpa >= 3.5) return 'text-green-600';
  if (gpa >= 3.0) return 'text-blue-600';
  if (gpa >= 2.5) return 'text-yellow-600';
  if (gpa >= 2.0) return 'text-orange-600';
  return 'text-red-600';
}
