import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { S3Storage } from 'coze-coding-dev-sdk';

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
});

// 获取推广内容
export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('promotion_contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: '获取推广内容失败' }, { status: 500 });
  }
}

// 创建或更新推广内容
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const videoUrlInput = formData.get('videoUrl') as string | null;
    const imageFile = formData.get('image') as File | null;
    const videoFile = formData.get('video') as File | null;
    const id = formData.get('id') as string | null;

    if (!title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    let videoUrl: string | null = null;

    // 如果有上传图片,先上传到对象存储
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `promotions/${Date.now()}_${imageFile.name}`;
      
      const imageKey = await storage.uploadFile({
        fileContent: buffer,
        fileName: fileName,
        contentType: imageFile.type,
      });

      imageUrl = await storage.generatePresignedUrl({
        key: imageKey,
        expireTime: 31536000, // 1年有效期
      });
    }

    // 如果有上传视频,上传到对象存储
    if (videoFile && videoFile.size > 0) {
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      const fileName = `videos/${Date.now()}_${videoFile.name}`;
      
      const videoKey = await storage.uploadFile({
        fileContent: buffer,
        fileName: fileName,
        contentType: videoFile.type || 'video/mp4',
      });

      videoUrl = await storage.generatePresignedUrl({
        key: videoKey,
        expireTime: 31536000, // 1年有效期
      });
    } else if (videoUrlInput && videoUrlInput.trim()) {
      // 如果没有上传视频但有链接，使用链接
      videoUrl = videoUrlInput.trim();
    }

    const client = getSupabaseClient();

    if (id) {
      // 更新现有内容
      const updateData: Record<string, any> = {
        title,
        description: description || null,
        video_url: videoUrl,
        updated_at: new Date().toISOString(),
      };
      
      if (imageUrl) {
        updateData.image_url = imageUrl;
      }

      const { data, error } = await client
        .from('promotion_contents')
        .update(updateData)
        .eq('id', parseInt(id))
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    } else {
      // 创建新内容
      const { data, error } = await client
        .from('promotion_contents')
        .insert({
          title,
          description: description || null,
          image_url: imageUrl,
          video_url: videoUrl,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error('保存推广内容失败:', error);
    return NextResponse.json({ error: '保存推广内容失败' }, { status: 500 });
  }
}

// 删除推广内容
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { error } = await client
      .from('promotion_contents')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '删除推广内容失败' }, { status: 500 });
  }
}
