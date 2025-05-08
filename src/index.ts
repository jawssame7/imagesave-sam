import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'ap-northeast-1' });
const BUCKET_NAME = process.env.BUCKET_NAME || 'testbucket-devsame73-dev';

// CORSヘッダーの設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
};

// メタデータの値をエンコードする関数
const encodeMetadata = (metadata: Record<string, string>) => {
  const encodedMetadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    encodedMetadata[key] = encodeURIComponent(value);
  }
  return encodedMetadata;
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // OPTIONSリクエストの処理
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // リクエストボディの取得
    const body = event.body ? JSON.parse(event.body) : {};
    const { imageData, fileName, metadata } = body;

    if (!imageData || !fileName) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Bad Request: imageData and fileName are required',
        }),
      };
    }

    // 現在の日付を取得してフォルダ名を生成
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dateFolder = `${year}/${month}/${day}`;

    // ファイル名に日時情報を追加
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    const fileNameWithTimestamp = `${timestamp}_${fileName}`;

    // Base64データをバッファに変換
    const imageBuffer = Buffer.from(imageData, 'base64');

    // メタデータをエンコード
    const encodedMetadata = encodeMetadata(metadata);

    const objectKey = `${dateFolder}/${fileNameWithTimestamp}`;

    // S3にアップロード
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: imageBuffer,
      ContentType: 'image/png',
      Metadata: encodedMetadata,
    });

    await s3Client.send(putCommand);

    // 署名付きURLを生成（7日間有効）
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
    });

    const signedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 604800, // 7日間
    });

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Success',
        imageUrl: signedUrl,
        metadata: metadata,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
