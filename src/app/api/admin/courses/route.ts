import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase/admin';
import { Course } from '@/lib/types/course';

// 講義データを取得
export async function GET() {
  try {
    const coursesSnapshot = await dbAdmin.collection('courses').orderBy('createdAt', 'desc').get();
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: '講義データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 講義データを保存
export async function POST(request: NextRequest) {
  try {
    const courseData: Course = await request.json();
    
    // バリデーション
    if (!courseData.courseName || !courseData.academicYear || courseData.academicYear.length === 0 || !courseData.lectureFormat || !courseData.department.faculty || !courseData.department.department) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています（講義名、学年、授業形態、学部、学科は必須です）' },
        { status: 400 }
      );
    }

    // 現在の日時を設定
    const now = new Date();
    const courseWithTimestamp = {
      ...courseData,
      createdAt: now,
      updatedAt: now
    };

    // Firestoreに保存
    const docRef = await dbAdmin.collection('courses').add(courseWithTimestamp);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: '講義が正常に追加されました'
    });
  } catch (error) {
    console.error('Error adding course:', error);
    return NextResponse.json(
      { error: '講義の追加に失敗しました' },
      { status: 500 }
    );
  }
}

// 複数の講義データを一括保存
export async function PUT(request: NextRequest) {
  try {
    const { courses }: { courses: Course[] } = await request.json();
    
    if (!courses || !Array.isArray(courses)) {
      return NextResponse.json(
        { error: '無効なデータ形式です' },
        { status: 400 }
      );
    }

    const batch = dbAdmin.batch();
    const now = new Date();

    courses.forEach(course => {
      const courseWithTimestamp = {
        ...course,
        createdAt: now,
        updatedAt: now
      };
      const docRef = dbAdmin.collection('courses').doc();
      batch.set(docRef, courseWithTimestamp);
    });

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      count: courses.length,
      message: `${courses.length}件の講義が正常に追加されました`
    });
  } catch (error) {
    console.error('Error adding courses:', error);
    return NextResponse.json(
      { error: '講義の一括追加に失敗しました' },
      { status: 500 }
    );
  }
}
