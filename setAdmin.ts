#!/usr/bin/env tsx

/**
 * 管理者権限設定スクリプト（簡略版）
 * 
 * 使用方法:
 * npm run set-admin <email>
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// 環境変数の読み込み
function loadEnvVars() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.log('環境変数ファイルが見つからないか、読み込めませんでした。');
  }
}

// 環境変数を読み込み
loadEnvVars();

// Firebase Admin SDKの初期化
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

if (!projectId || !privateKey || !clientEmail) {
  console.error('❌ 環境変数が設定されていません');
  console.error('以下の環境変数を .env.local に設定してください:');
  console.error('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id');
  console.error('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  console.error('FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com');
  process.exit(1);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });
    console.log('✅ Firebase Admin SDKが初期化されました');
  } catch (error) {
    console.error('❌ Firebase Admin SDKの初期化に失敗しました:', error);
    process.exit(1);
  }
}

const auth = admin.auth();
const db = admin.firestore();

async function setAdmin(email: string) {
  try {
    console.log(`\n🔍 ユーザー "${email}" を検索中...`);
    
    // ユーザーを検索
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;
    
    console.log(`✅ ユーザーが見つかりました (UID: ${uid})`);
    
    // ユーザープロファイルを取得または作成
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.log('📝 ユーザープロファイルを作成中...');
      await db.collection('users').doc(uid).set({
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
      console.log('✅ ユーザープロファイルを作成し、管理者権限を付与しました');
    } else {
      console.log('📝 管理者権限を付与中...');
      await db.collection('users').doc(uid).update({
        isAdmin: true,
        updatedAt: new Date()
      });
      console.log('✅ 管理者権限を付与しました');
    }
    
    console.log(`\n🎉 完了: "${email}" が管理者になりました`);
    console.log('管理者ダッシュボード: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
管理者権限設定スクリプト

使用方法:
  npm run set-admin <email>

例:
  npm run set-admin admin@example.com
`);
    process.exit(0);
  }
  
  const email = args[0];
  
  if (!email) {
    console.error('❌ メールアドレスを指定してください');
    process.exit(1);
  }
  
  await setAdmin(email);
}

// スクリプト実行
main().catch(console.error);