import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
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
    const batch = adminDb.batch();
    const now = new Date();

    courses.forEach(course => {
      const courseWithTimestamp = {
        ...course,
        createdAt: now,
        updatedAt: now
      };
      const docRef = adminDb.collection('courses').doc();
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
export async function GET() {
  try {
    const csvTemplate = generateCSVTemplate();
    
    return new NextResponse(csvTemplate, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="course_template.csv"'
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
      const course: Course = {
        academicYear: values[0] || '',
        lectureFormat: values[1] || '',
        courseName: values[2] || '',
        credits: parseInt(values[3]) || 0,
        courseClassification: {
          specializedBasic: values[4] === 'true' || values[4] === '1',
          specialized: values[5] === 'true' || values[5] === '1',
          international: values[6] === 'true' || values[6] === '1',
          general: values[7] === 'true' || values[7] === '1'
        },
        specializationRelevance: {
          electrical: values[8] || '-',
          quantum: values[9] || '-',
          communication: values[10] || '-',
          information: values[11] || '-'
        },
        offeringPeriod: {
          spring: values[12] === 'true' || values[12] === '1',
          summer: values[13] === 'true' || values[13] === '1',
          autumn: values[14] === 'true' || values[14] === '1',
          winter: values[15] === 'true' || values[15] === '1',
          intensive: values[16] === 'true' || values[16] === '1'
        }
      };

      // 必須フィールドのチェック
      if (course.courseName && course.academicYear && course.lectureFormat) {
        courses.push(course);
      }
    } catch (error) {
      console.error(`Error parsing line ${i + 1}:`, error);
    }
  }

  return courses;
}

// CSVテンプレートを生成
function generateCSVTemplate(): string {
  const headers = [
    '配当学年',
    '授業形態',
    '授業科目',
    '単位数',
    '専門基礎教育科目',
    '専門教育科目',
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
    '集中'
  ];

  const sampleData = [
    '1年,講義,コンピュータシステム I,2,true,false,false,false,C,F,F,G,true,false,false,false,false',
    '2年,講義・演習,電子情報工学序論,3,true,false,false,false,◎,O,O,O,true,false,true,false,false'
  ];

  return [headers.join(','), ...sampleData].join('\n');
}
