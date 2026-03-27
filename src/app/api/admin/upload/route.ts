import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/storage/database/supabase-client';

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
    const fileName = `${type}s/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`开始上传文件: ${fileName}, 大小: ${file.size} bytes`);

    // 上传到 Supabase Storage
    const client = getSupabaseServiceClient();
    const bucketName = 'promotions';
    
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('文件上传失败:', error);
      return NextResponse.json({ 
        success: false, 
        error: `上传失败: ${error.message}` 
      });
    }

    console.log(`文件上传成功, path: ${data.path}`);

    // 生成公开访问 URL
    const { data: urlData } = client.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return NextResponse.json({ 
      success: true, 
      data: { 
        key: data.path,
        url: urlData.publicUrl 
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
