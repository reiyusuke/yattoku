# Yattoku

ヤットク MVP 開発用リポジトリ。

## サービス概要
ヤットクは、大学内イベントを簡単に見つけて参加できるサービスです。  
運営側がイベントを作成・公開し、学生はイベント一覧や詳細を確認して参加申込できます。

## MVP方針
- 投稿機能なし
- 決済機能なし
- 大学メールアドレス必須
- 運営がイベントを作成
- 学生がイベントを閲覧して参加申込
- 管理画面は admin 権限のみ利用可能

## 現在の実装範囲

### 学生側画面
- ホーム
- ログイン
- 新規登録
- イベント一覧
- イベント詳細
- 参加画面
- 参加完了画面

### 管理側画面
- 管理トップ
- イベント一覧
- イベント作成
- イベント編集
- 参加者一覧

### API
#### 認証
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

#### 学生側
- GET /api/events
- GET /api/events/[id]
- POST /api/events/[id]/applications

#### 管理側
- GET /api/admin/events
- POST /api/admin/events
- PATCH /api/admin/events/[id]
- GET /api/admin/events/[id]/applications

## 認証仕様
- 許可ドメインに含まれる大学メールアドレスのみ登録可能
- Cookie ベースの session 認証
- 学生は student ロール
- 管理者は admin ロール
- 管理API / 管理画面は admin のみ利用可能

## 使用技術
- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Docker

## データベース
主なテーブル:
- users
- sessions
- allowed_email_domains
- events
- event_applications

## ディレクトリ構成
yattoku/
├── README.md
├── docs/
│   └── mvp-spec.md
├── infra/
│   └── docker-compose.yml
└── app/
    ├── prisma/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── generated/
    │   └── lib/
    ├── package.json
    ├── prisma.config.ts
    └── .env

## ローカルセットアップ

### 1. PostgreSQL を起動
cd ~/yattoku/infra
docker compose up -d
docker compose ps

### 2. アプリ側へ移動
cd ~/yattoku/app

### 3. .env を確認
現在の想定:
DATABASE_URL="postgresql://yattoku:yattoku_pass@localhost:5434/yattoku_dev?schema=public"

### 4. 依存関係を入れる
npm install

### 5. Prisma を反映
npx prisma format
npx prisma generate
npx prisma migrate dev

### 6. seed を入れる
npm run seed

### 7. 開発サーバ起動
npm run dev

## 起動確認URL

### 学生側
- http://localhost:3000
- http://localhost:3000/events

### 認証
- http://localhost:3000/login
- http://localhost:3000/signup

### 管理側
- http://localhost:3000/admin
- http://localhost:3000/admin/events

## 初期データ

### 管理者
- email: admin@yattoku.local
- password: admin123456

### 許可ドメイン
- osaka-ue.ac.jp

### テスト学生
必要なら以下で作成:
curl -i -X POST http://127.0.0.1:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@osaka-ue.ac.jp",
    "password": "password123",
    "nickname": "テストユーザー"
  }'

## よく使う確認コマンド

### テーブル一覧
docker exec -i yattoku-postgres psql -U yattoku -d yattoku_dev -c '\dt'

### users 確認
docker exec -i yattoku-postgres psql -U yattoku -d yattoku_dev -c "SELECT id, email, role, email_verified FROM users ORDER BY id;"

### events 確認
docker exec -i yattoku-postgres psql -U yattoku -d yattoku_dev -c "SELECT id, title, publish_status, application_status FROM events ORDER BY id;"

### event_applications 確認
docker exec -i yattoku-postgres psql -U yattoku -d yattoku_dev -c "SELECT id, event_id, user_id, input_name, status FROM event_applications ORDER BY id;"

### sessions 確認
docker exec -i yattoku-postgres psql -U yattoku -d yattoku_dev -c "SELECT id, user_id, session_token, expires_at FROM sessions ORDER BY id;"

## 開発メモ
- 開発DB は PostgreSQL (Docker)
- Prisma Client 出力先は src/generated/prisma
- 管理APIは admin 権限必須
- 参加申込APIはログイン必須
- 学生向けイベント一覧は published のみ表示

## 現在の到達点
- 学生側主要導線は実装済み
- 管理側主要導線は実装済み
- 認証 / session / admin保護は実装済み
- 大学メールドメイン制限は実装済み
- MVPとして画面とAPIの骨組みは成立している

## 今後の候補
- メール認証の本実装
- 管理画面ダッシュボード
- イベント検索 / 絞り込み
- UI微調整
- 本番向けのエラーハンドリング改善

## Vercel デプロイメモ
- GitHub リポジトリ: `reiyusuke/yattoku`
- Vercel の Root Directory は `app`
- 本番DBは Vercel Marketplace の Postgres プロバイダ（例: Neon, Supabase, Aurora）を利用
- `DATABASE_URL` を Production / Preview に設定
- デプロイ前に Prisma migration を本番DBへ適用する運用を決める
