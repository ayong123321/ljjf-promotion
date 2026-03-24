import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
});

export const maxDuration = 300; // 5分钟超时

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' or 'video'
    
    if (!file) {
      return NextResponse.json({ success: false, error: '没有选择文件' });
    }

    // 验证文件类型
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    
    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: '只支持 JPG、PNG、GIF、WebP 格式的图片' });
    }
    
    if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: '只支持 MP4、MOV、AVI、WebM 格式的视频' });
    }

    // 限制文件大小（图片 10MB，视频 100MB）
    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: `文件太大，${type === 'image' ? '图片' : '视频'}最大支持 ${type === 'image' ? '10MB' : '100MB'}` 
      });
    }

    // 生成文件名
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `promotions/${type}s/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`开始上传文件: ${fileName}, 大小: ${file.size} bytes`);

    // 上传到对象存储
    const key = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: file.type,
    });

    console.log(`文件上传成功, key: ${key}`);

    // 生成访问 URL（有效期 30 天）
    const url = await storage.generatePresignedUrl({
      key: key,
      expireTime: 30 * 24 * 60 * 60, // 30 天
    });

    return NextResponse.json({ 
      success: true, 
      data: { 
        key: key,
        url: url 
      } 
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '上传失败，请重试' 
    });
  }
}
