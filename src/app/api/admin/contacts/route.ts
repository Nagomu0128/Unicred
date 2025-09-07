import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase/admin';

// 問い合わせ一覧を取得
export async function GET() {
  try {
    const contactsSnapshot = await dbAdmin.collection('contacts').orderBy('createdAt', 'desc').get();
    const contacts = contactsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // FirestoreのTimestampをISO文字列に変換
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      };
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: '問い合わせデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}
