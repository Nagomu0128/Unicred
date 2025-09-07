import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase/admin';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// 問い合わせフォームの送信
export async function POST(request: NextRequest) {
  try {
    const formData: ContactFormData = await request.json();
    
    // バリデーション
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // 現在の日時を設定
    const now = new Date();
    const contactData = {
      ...formData,
      createdAt: now,
      status: 'new' // new, read, replied
    };

    // Firestoreに保存
    const docRef = await dbAdmin.collection('contacts').add(contactData);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: 'お問い合わせを送信しました。ありがとうございます。'
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'お問い合わせの送信に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
