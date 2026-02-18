// ============================================
// FaOnSisT - S3 Storage Adapter (Stub)
// Placeholder for AWS S3 / compatible storage
// ============================================

// TODO: Install AWS SDK when ready:
//   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

// import {
//   S3Client,
//   PutObjectCommand,
//   DeleteObjectCommand,
//   GetObjectCommand,
// } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { StorageAdapter } from '../storage';

export class S3Storage implements StorageAdapter {
  // private client: S3Client;
  // private bucket: string;
  // private region: string;

  constructor() {
    // TODO: Initialize S3 client when ready
    //
    // this.bucket = process.env.AWS_S3_BUCKET!;
    // this.region = process.env.AWS_S3_REGION || 'eu-central-1';
    //
    // this.client = new S3Client({
    //   region: this.region,
    //   credentials: {
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    //   },
    // });
  }

  async upload(_file: Buffer, _filename: string, _folder: string): Promise<string> {
    // TODO: Implement S3 upload
    //
    // const key = `${folder}/${Date.now()}-${filename}`;
    // await this.client.send(new PutObjectCommand({
    //   Bucket: this.bucket,
    //   Key: key,
    //   Body: file,
    //   ContentType: mimeType, // pass as param or detect
    // }));
    // return key; // or full URL: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`

    throw new Error('S3 storage is not configured. Install @aws-sdk/client-s3 and implement S3Storage.');
  }

  async delete(_filePath: string): Promise<void> {
    // TODO: Implement S3 deletion
    //
    // await this.client.send(new DeleteObjectCommand({
    //   Bucket: this.bucket,
    //   Key: filePath,
    // }));

    throw new Error('S3 storage is not configured. Install @aws-sdk/client-s3 and implement S3Storage.');
  }

  getUrl(_filePath: string): string {
    // TODO: Return signed URL or public URL
    //
    // For public buckets:
    //   return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filePath}`;
    //
    // For private buckets (signed URL):
    //   const command = new GetObjectCommand({ Bucket: this.bucket, Key: filePath });
    //   return await getSignedUrl(this.client, command, { expiresIn: 3600 });

    throw new Error('S3 storage is not configured. Install @aws-sdk/client-s3 and implement S3Storage.');
  }
}
