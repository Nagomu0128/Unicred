import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase/admin';
import { Course } from '@/lib/types/course';

// CSVファイルをアップロードして講義データを一括登録
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // CSVファイルの内容を読み取り
    const csvText = await file.text();
    const courses = parseCSV(csvText);

    if (courses.length === 0) {
      return NextResponse.json(
        { error: '有効な講義データが見つかりませんでした' },
        { status: 400 }
      );
    }

    // Firestoreに一括保存
    const batch = dbAdmin.batch();
    const now = new Date();

    courses.forEach(course => {
      const courseWithTimestamp = {
        ...course,
        createdAt: now,
        updatedAt: now
      };
      //下記のコレクションパスをいじって保存先を変更する
      const docRef = dbAdmin.collection('departments').doc('faculty-of-engineering').collection('engineering').doc('electronic-information').collection('courses').doc();
      batch.set(docRef, courseWithTimestamp);
    });

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      count: courses.length,
      message: `${courses.length}件の講義が正常に追加されました`
    });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    return NextResponse.json(
      { error: 'CSVファイルのアップロードに失敗しました' },
      { status: 500 }
    );
  }
}

// CSVテンプレートをダウンロード
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const faculty = searchParams.get('faculty') || '';
    const department = searchParams.get('department') || '';
    const course = searchParams.get('course') || '';
    
    const csvTemplate = generateCSVTemplate(faculty, department, course);
    
    const filename = `course_template${faculty ? `_${faculty}` : ''}${department ? `_${department}` : ''}${course ? `_${course}` : ''}.csv`;
    
    return new NextResponse(csvTemplate, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error generating CSV template:', error);
    return NextResponse.json(
      { error: 'CSVテンプレートの生成に失敗しました' },
      { status: 500 }
    );
  }
}

// CSVを解析して講義データに変換
function parseCSV(csvText: string): Course[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const courses: Course[] = [];
  const headers = lines[0].split(',').map(h => h.trim());

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < headers.length) continue;

    try {
      // 複数の区分が選択されている場合は最初の一つだけを有効にする
      const classificationFlags = [
        { key: 'gatewayToLearning', value: values[7] === 'true' || values[7] === '1' },
        { key: 'foundationalLiberalArts', value: values[8] === 'true' || values[8] === '1' },
        { key: 'informationEducation', value: values[9] === 'true' || values[9] === '1' },
        { key: 'healthSports', value: values[10] === 'true' || values[10] === '1' },
        { key: 'advancedSeminar', value: values[11] === 'true' || values[11] === '1' },
        { key: 'specializedBasic', value: values[12] === 'true' || values[12] === '1' },
        { key: 'specialized', value: values[13] === 'true' || values[13] === '1' },
        { key: 'generalEnglish', value: values[14] === 'true' || values[14] === '1' },
        { key: 'practicalEnglish', value: values[15] === 'true' || values[15] === '1' },
        { key: 'secondForeignLanguage', value: values[16] === 'true' || values[16] === '1' },
        { key: 'globalUnderstanding', value: values[17] === 'true' || values[17] === '1' },
        { key: 'international', value: values[18] === 'true' || values[18] === '1' },
        { key: 'general', value: values[19] === 'true' || values[19] === '1' }
      ];

      // 最初に選択されている区分を特定
      const selectedClassification = classificationFlags.find(flag => flag.value);
      const selectedKey = selectedClassification ? selectedClassification.key : null;

      const courseClassification = {
        gatewayToLearning: selectedKey === 'gatewayToLearning',
        foundationalLiberalArts: selectedKey === 'foundationalLiberalArts',
        informationEducation: selectedKey === 'informationEducation',
        healthSports: selectedKey === 'healthSports',
        advancedSeminar: selectedKey === 'advancedSeminar',
        specializedBasic: selectedKey === 'specializedBasic',
        specialized: selectedKey === 'specialized',
        generalEnglish: selectedKey === 'generalEnglish',
        practicalEnglish: selectedKey === 'practicalEnglish',
        secondForeignLanguage: selectedKey === 'secondForeignLanguage',
        globalUnderstanding: selectedKey === 'globalUnderstanding',
        international: selectedKey === 'international',
        general: selectedKey === 'general'
      };

      // 専門科目の分類が有効かどうかを判定
      const isSpecializationEnabled = courseClassification.specializedBasic || courseClassification.specialized;

      // 学年を複数対応（カンマ区切りで複数の学年を指定可能）
      const academicYearStr = values[0] || '';
      const academicYear = academicYearStr ? academicYearStr.split(',').map(year => year.trim()).filter(year => year) : [];

      const course: Course = {
        academicYear,
        lectureFormat: values[1] || '',
        courseName: values[2] || '',
        credits: parseInt(values[3]) || 0,
        department: {
          faculty: values[4] || '',
          department: values[5] || '',
          course: values[6] || undefined
        },
        courseClassification,
        specializationRelevance: isSpecializationEnabled ? {
          electrical: values[20] || '-',
          quantum: values[21] || '-',
          communication: values[22] || '-',
          information: values[23] || '-'
        } : {
          electrical: '-',
          quantum: '-',
          communication: '-',
          information: '-'
        },
        offeringPeriod: {
          spring: values[24] === 'true' || values[24] === '1',
          summer: values[25] === 'true' || values[25] === '1',
          autumn: values[26] === 'true' || values[26] === '1',
          winter: values[27] === 'true' || values[27] === '1',
          intensive: values[28] === 'true' || values[28] === '1',
          online: values[29] === 'true' || values[29] === '1'
        }
      };

      // 必須フィールドのチェック
      if (course.courseName && course.academicYear.length > 0 && course.lectureFormat && course.department.faculty && course.department.department) {
        courses.push(course);
      }
    } catch (error) {
      console.error(`Error parsing line ${i + 1}:`, error);
    }
  }

  return courses;
}

// CSVテンプレートを生成
function generateCSVTemplate(faculty: string = '', department: string = '', course: string = ''): string {
  const headers = [
    '配当学年（複数の場合はカンマ区切りで入力：例「1年,2年」）',
    '授業形態',
    '授業科目',
    '単位数',
    '学部',
    '学科',
    'コース（任意）',
    '学問の扉',
    '基盤教養',
    '情報教育',
    '健康スポーツ',
    'アドヴァンスト・セミナー',
    '専門基礎科目',
    '専門科目',
    '総合英語',
    '実践英語',
    '第二外国語',
    'グローバル理解',
    '高度国際性涵養教育科目',
    '高度教養教育科目',
    '電気工学',
    '量子情報エレクトロニクス',
    '通信工学',
    '情報システム工学',
    '春学期',
    '夏学期',
    '秋学期',
    '冬学期',
    '集中',
    'オンライン'
  ];

  // デフォルト値が指定されている場合はサンプル行を追加
  if (faculty || department || course) {
    const sampleRow = [
      '1年,2年', // 配当学年
      '講義', // 授業形態
      'サンプル講義名', // 授業科目
      '2', // 単位数
      faculty, // 学部
      department, // 学科
      course, // コース
      'false', // 学問の扉
      'false', // 基盤教養
      'false', // 情報教育
      'false', // 健康スポーツ
      'false', // アドヴァンスト・セミナー
      'false', // 専門基礎科目
      'false', // 専門科目
      'false', // 総合英語
      'false', // 実践英語
      'false', // 第二外国語
      'false', // グローバル理解
      'false', // 高度国際性涵養教育科目
      'false', // 高度教養教育科目
      '-', // 電気工学
      '-', // 量子情報エレクトロニクス
      '-', // 通信工学
      '-', // 情報システム工学
      'true', // 春学期
      'false', // 夏学期
      'false', // 秋学期
      'false', // 冬学期
      'false', // 集中
      'false' // オンライン
    ];
    
    return headers.join(',') + '\n' + sampleRow.join(',');
  }

  return headers.join(',');
}
