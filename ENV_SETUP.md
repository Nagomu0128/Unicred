# Firebase Realtime Database 環境変数設定

## 必要な環境変数

`.env.local`ファイルに以下の環境変数を追加してください：

```env
# 既存のFirebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# 新しく追加するRealtime Database設定
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://unicred-338a4-default-rtdb.asia-northeast1.firebasedb.app/
```

## Realtime Database URLの取得方法

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「unicred-338a4」を選択
3. 左メニューから「Realtime Database」をクリック
4. 「データベースのURL」をコピー
5. `.env.local`ファイルに`NEXT_PUBLIC_FIREBASE_DATABASE_URL`として追加

## 注意事項

- URLの末尾に`/`を必ず付けてください
- 環境変数名は`NEXT_PUBLIC_`で始まる必要があります（クライアントサイドで使用するため）
