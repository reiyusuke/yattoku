# ヤットク MVP仕様書

## 1. サービス名
**ヤットク**

## 2. コピー
**めんどい段取り、全部ヤットクから。**

## 3. MVPの目的
大学内イベントに対して、学生が安全かつ簡単に参加できる最小導線を検証する。

あわせて、運営側がイベントを管理・公開し、参加申込状況を確認できる状態を作る。

---

## 4. MVPの前提
- 投稿機能は持たせない
- 決済機能は持たせない
- イベントは運営側が作成する
- 学生は公開中イベントを閲覧し、参加申込する
- 学生登録には大学メールアドレスを必須とする
- 管理画面は admin 権限ユーザーのみ利用可能

---

## 5. 想定ユーザー

### 学生
- 大学メールアドレスを持つ学生
- イベントを閲覧し、参加申込を行う

### 運営
- イベントを作成・編集・公開する担当者
- 参加申込状況を確認する担当者

---

## 6. 学生側機能

### 6-1. ホーム
- サービス概要表示
- イベント一覧導線
- ログイン導線
- 新規登録導線

### 6-2. 新規登録
- 名前入力
- 大学メールアドレス入力
- パスワード入力
- 許可ドメインのメールのみ登録可能

### 6-3. ログイン
- メールアドレス入力
- パスワード入力
- ログイン後は元いたページへ戻せる

### 6-4. イベント一覧
- 公開中イベントのみ表示
- イベント名
- イベント説明
- 日時
- 場所
- 募集状態

### 6-5. イベント詳細
- イベント名
- 内容
- 日時
- 場所
- 募集状況
- 参加ボタン

### 6-6. 参加申込
- ログイン必須
- 名前入力
- ログインユーザーで申込
- 重複申込防止
- 募集終了イベントには申込不可

### 6-7. 参加完了
- 申込完了表示
- イベント名
- 日時
- 場所
- 一覧へ戻る導線

---

## 7. 管理側機能

### 7-1. 管理トップ
- 管理機能への入口表示
- イベント管理導線
- 参加者確認導線

### 7-2. イベント一覧
- 全イベント表示
- 公開状態表示
- 募集状態表示
- 学生表示確認導線
- 編集導線
- 参加者一覧導線

### 7-3. イベント作成
入力項目:
- タイトル
- 説明
- 日時
- 場所
- 公開状態
- 募集状態

### 7-4. イベント編集
変更可能項目:
- タイトル
- 説明
- 日時
- 場所
- 公開状態
- 募集状態

### 7-5. 参加者一覧
- 申込者名
- メールアドレス
- 申込状態
- 申込日時

---

## 8. 権限制御

### 未ログイン
- 学生側閲覧画面は利用可能
- 参加申込は不可
- 管理画面は不可

### student
- 学生側機能を利用可能
- 管理画面 / 管理API は不可

### admin
- 管理画面 / 管理API を利用可能
- 学生側機能も利用可能

---

## 9. 認証仕様
- Cookie ベースの session 認証
- `sessions` テーブルで session 管理
- `/api/auth/me` で現在ユーザーを取得
- logout 時に session を削除

---

## 10. API一覧

### 認証API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### 学生側API
- `GET /api/events`
- `GET /api/events/[id]`
- `POST /api/events/[id]/applications`

### 管理側API
- `GET /api/admin/events`
- `POST /api/admin/events`
- `PATCH /api/admin/events/[id]`
- `GET /api/admin/events/[id]/applications`

---

## 11. データモデル

### users
- id
- email
- password_hash
- nickname
- role
- email_verified
- created_at
- updated_at

### sessions
- id
- user_id
- session_token
- expires_at
- created_at

### allowed_email_domains
- id
- domain
- is_active
- created_at
- updated_at

### events
- id
- title
- description
- event_date
- place
- publish_status
- application_status
- created_by
- created_at
- updated_at

### event_applications
- id
- event_id
- user_id
- input_name
- status
- applied_at

---

## 12. MVPで含めないもの
- 学生からのイベント投稿
- 決済
- コメント
- チャット
- 通知
- メール認証リンク送信
- パスワード再設定
- 画像投稿

---

## 13. 現在の到達点
- 学生側主要導線は実装済み
- 管理側主要導線は実装済み
- 認証 / session / admin保護は実装済み
- 大学メールドメイン制限は実装済み
- MVPとして画面とAPIの骨組みは成立している

---

## 14. 今後の候補
- メール認証の本実装
- 管理画面ダッシュボード
- イベント検索 / 絞り込み
- UI微調整
- 本番向けのエラーハンドリング改善
