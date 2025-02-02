## ローカル環境での起動方法(SQLite)

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

## ローカル環境での起動方法その2(PostgreSQL)

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

## ローカル環境での起動方法その3(本番環境DBへの接続)

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

## ローカル環境での起動方法その3(本番環境DBへの接続)

- firebaseをemulatorで起動
- 開発用サーバを立ち上げてホットリロード
- データベースはRender.comのPostgreSQLで起動

1. .envを開く
2. `NEXT_PUBLIC_FIREBASE_ENV`を`production`に変更
3. 以下のコマンドを実行

```bash
npm run deploy
```

## 本番環境へのデプロイ方法

```bash
npm run deploy -- --only hosting
```
