import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase/admin';

interface RouteParams {
  params: {
    id: string;
  };
}

// 問い合わせのステータスを更新
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (!status || !['read', 'replied'].includes(status)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      );
    }

    await dbAdmin.collection('contacts').doc(id).update({
      status,
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'ステータスを更新しました' 
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    return NextResponse.json(
      { error: 'ステータスの更新に失敗しました' },
      { status: 500 }
    );
  }
}
