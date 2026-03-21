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

    console.log('收到请求:', { title, id, hasImage: !!imageFile, hasVideo: !!videoFile, videoUrlInput });

    if (!title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    let videoUrl: string | null = null;
    let hasNewVideo = false;

    // 如果有上传图片,先上传到对象存储
    if (imageFile && imageFile.size > 0) {
      console.log('上传图片:', imageFile.name, imageFile.size);
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
      console.log('图片上传成功:', imageUrl?.substring(0, 50));
    }

    // 如果有上传视频,上传到对象存储
    if (videoFile && videoFile.size > 0) {
      console.log('上传视频:', videoFile.name, videoFile.size);
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
      hasNewVideo = true;
      console.log('视频上传成功:', videoUrl?.substring(0, 50));
    } else if (videoUrlInput && videoUrlInput.trim()) {
      // 如果没有上传视频但有链接，使用链接
      videoUrl = videoUrlInput.trim();
      hasNewVideo = true;
    }

    const client = getSupabaseClient();

    if (id) {
      // 更新现有内容
      const updateData: Record<string, any> = {
        title,
        description: description || null,
        updated_at: new Date().toISOString(),
      };
      
      if (imageUrl) {
        updateData.image_url = imageUrl;
      }
      
      // 只有在有新视频时才更新video_url
      if (hasNewVideo) {
        updateData.video_url = videoUrl;
      }

      console.log('更新数据:', { id, updateData });

      const { data, error } = await client
        .from('promotion_contents')
        .update(updateData)
        .eq('id', parseInt(id))
        .select()
        .single();

      if (error) {
        console.error('更新失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log('更新成功:', data);
      return NextResponse.json({ data, videoUploaded: hasNewVideo });
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
        console.error('创建失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log('创建成功:', data);
      return NextResponse.json({ data, videoUploaded: hasNewVideo });
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
