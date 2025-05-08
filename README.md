# Image Save SAM

AWS SAM を使用した画像保存 API サービスです。このプロジェクトは、画像ファイルを S3 バケットに保存するためのサーバーレス API を提供します。

## 機能

- 画像ファイルのアップロードと保存
- S3 バケットへの画像保存
- RESTful API エンドポイント
- CORS 対応
- 環境変数による設定管理

## 技術スタック

- AWS SAM (Serverless Application Model)
- TypeScript
- Node.js 20.x
- AWS Lambda
- Amazon S3
- Amazon API Gateway

## 前提条件

- Node.js 20.x 以上
- AWS CLI
- AWS SAM CLI
- TypeScript

## セットアップ

1. リポジトリのクローン

```bash
git clone [repository-url]
cd imagesave-sam
```

2. 依存関係のインストール

```bash
npm install
```

3. ビルド

```bash
npm run build
```

4. ローカルでのテスト実行

```bash
sam local start-api
```

## デプロイ

1. デプロイ設定

```bash
sam deploy --guided
```

2. 本番環境へのデプロイ

```bash
sam deploy --config-env {環境（dev or test or prod）}
```

## 環境変数

- `BUCKET_NAME`: S3 バケット名
- `MY_AWS_REGION`: AWS リージョン
- `NODE_ENV`: 実行環境
- `ENVIRONMENT`: 環境（dev/test/prod）

## API 仕様

### エンドポイント

- POST /image-save

### リクエスト

- Content-Type: multipart/form-data
- パラメータ: image (画像ファイル)

### レスポンス

- 成功時: 200 OK
- エラー時: 適切なエラーステータスコード

## ライセンス

ISC
