## アプリについて

### 制作背景

自分の好きなパズルを簡単に保存できる場を作りたくて開発しました。
「画像・数式・手順」が複合するため、QuillやKaTeXの導入に挑戦しました。

### 工夫・技術的チャレンジ

- QuillやMUIを用いて、数式や画像を含む直感的なパズル作成UIを実装
- Prismaでリレーション構造を設計
- Firebase AuthenticationとRenderを併用し、ユーザー認証とセキュアなAPI通信を構築
- JSON形式でパズルのインポート・エクスポートを可能にし、将来的な外部連携に備えた

### アプリの概要

このアプリは、自作パズルを作成、解くことができるサービスです。
以下の機能があります。

- パズルの作成
- パズルのカテゴリー・難易度別分類
- パズルの解き方（定石）の作成
- お気に入りパズルの登録・解除
- パズルの検索
- パズルのエクスポート・インポート(JSON形式)

パズルの問題文や解き方はQuillエディタで実装しており、
ドラッグ・アンド・ドロップ等による画像添付も可能です。
またKaTeXによる数式の表示も可能です。

### 使い方

1. トップページから「パズル作成」をクリック
2. 画像や数式を挿入しながら、オリジナルの問題文や解法をエディタで作成
3. カテゴリや難易度を設定して保存
4. パズルを検索して挑戦＆お気に入り登録
5. 自作パズルをJSON形式でエクスポートし、別環境へインポート

### URL

https://puzzle-frontend-staging.onrender.com/

### 技術スタック

- **Next.js**: ルーティングとSSRを活用した高速なフロント構築
- **TypeScript**: 型安全な開発と保守性を意識
- **Prisma**: スキーマベースで安全にDB操作を行うORMとして最適なツール
- **PostgreSQL (Render)**: JSONやリレーションに強く、Render上で簡単に管理できる(MySQLは非対応)
- **Firebase Authentication**: ソーシャルログインを含む簡易なユーザー管理
- **Quill + KaTeX**: 数式・画像込みのリッチなエディタ環境を構築
- **AWS S3**: 大容量の画像アップロードに対応
- **Docker**: ローカルでのDB環境を簡易に再現

## 以下、開発者向けのドキュメント

### ローカル環境での起動方法(SQLite)

- firebaseをemulatorで起動
- 開発用サーバを立ち上げてホットリロード
- データベースはsqliteで起動

1. .envを開き、`NEXT_PUBLIC_FIREBASE_ENV`を`development`に変更
2. schema.prismaを開き、`datasource db`の`provider`を`sqlite`に変更
3. 以下のコマンドを実行

```bash
npm run generate
npm run dev
```

### ローカル環境での起動方法その2(PostgreSQL)

- firebaseをemulatorで起動
- 開発用サーバを立ち上げてホットリロード
- データベースはPostgreSQLローカルコンテナで起動

1. .envを開き、`NEXT_PUBLIC_FIREBASE_ENV`を`development`に変更
2. schema.prismaを開き、`datasource db`の`provider`を`postgresql`に変更
3. .envを開き、`POSTGRE_DATABASE_URL`を`postgresql://yama:mypassword@localhost:12345/mydb`に変更。
   また、`POSTGRES_USER``POSTGRES_PASSWORD`と`POSTGRES_DB`のコメントアウトを外す
4. /prisma/migrationsを削除
5. 以下のコマンドを実行してPostgreSQLローカルコンテナを起動

```bash
docker compose up -d postgres
```

5. 以下のコマンドを実行してデータベースを作成

```bash
npm run generate
npm run dev
```

[参考](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/limitations-and-known-issues#you-cannot-automatically-switch-database-providers)

### ローカル環境での起動方法その3(本番環境DBへの接続)

- firebaseをemulatorで起動
- 開発用サーバを立ち上げてホットリロード
- データベースはRender.comのPostgreSQLで起動

1. .envを開き、`NEXT_PUBLIC_FIREBASE_ENV`を`development`に変更
2. schema.prismaを開き、`datasource db`の`provider`を`postgresql`に変更
3. .envを開き、`POSTGRE_DATABASE_URL`を`postgresql://yama:VM...`に変更
4. 以下のコマンドを実行して本番環境のDBに接続

```bash
npm run generate
npm run dev
```

※ TablePlus等ツールでDBに接続可能

- Host: `dpg-xxx-a.oregon-postgres.render.com`
- Port: `5432`
- Database: `puzzle_app_db`
- User: `yama`
- Password: `VxxxS`

### ローカル環境での起動方法その3(本番環境DBへの接続)

- firebaseをemulatorで起動
- 開発用サーバを立ち上げてホットリロード
- データベースはRender.comのPostgreSQLで起動

1. .envを開く
2. `NEXT_PUBLIC_FIREBASE_ENV`を`production`に変更
3. 以下のコマンドを実行

```bash
npm run deploy
```

### 本番環境へのデプロイ方法

```bash
npm run deploy -- --only hosting
```
