import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { S3Storage } from 'coze-coding-dev-sdk';

// 从文本中提取URL（处理抖音分享文字）
const extractUrl = (text: string): string | null => {
  if (!text) return null;
  
  // 如果已经是干净的URL，直接返回
  if (/^https?:\/\/[^\s]+$/.test(text.trim())) {
    return text.trim();
  }
  
  // 尝试匹配抖音短链接（可能包含下划线等字符）
  const douyinMatch = text.match(/https?:\/\/v\.douyin\.com\/[a-zA-Z0-9_-]+\/?/);
  if (douyinMatch) {
    return douyinMatch[0];
  }
  
  // 再尝试匹配其他抖音链接
  const douyinMatch2 = text.match(/https?:\/\/[^\s]*?douyin\.com\/[^\s]*/);
  if (douyinMatch2) {
    let url = douyinMatch2[0];
    url = url.replace(/[^\w\/-]$/, '');
    return url;
  }
  
  // 最后匹配通用的 http/https URL
  const urlMatch = text.match(/https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+/);
  return urlMatch ? urlMatch[0] : null;
};

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
    const storeImageFile = formData.get('storeImage') as File | null;
    const id = formData.get('id') as string | null;

    console.log('=== 收到推广内容请求 ===');
    console.log('标题:', title);
    console.log('ID:', id);
    console.log('图片文件:', imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : '无');
    console.log('视频文件:', videoFile ? `${videoFile.name} (${videoFile.size} bytes)` : '无');
    console.log('视频链接:', videoUrlInput || '无');

    if (!title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    let videoUrl: string | null = null;
    let storeImageUrl: string | null = null;
    let hasNewVideo = false;

    // 如果有上传图片,先上传到对象存储
    if (imageFile && imageFile.size > 0) {
      try {
        console.log('开始上传图片...', imageFile.name, imageFile.size, 'bytes');
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        
        // 处理文件名，移除特殊字符和中文
        const originalName = imageFile.name;
        const ext = originalName.split('.').pop() || 'jpg';
        const safeFileName = `image_${Date.now()}.${ext}`;
        const fileName = `promotions/${safeFileName}`;
        console.log('原始文件名:', originalName, '-> 安全文件名:', fileName);
        
        const imageKey = await storage.uploadFile({
          fileContent: buffer,
          fileName: fileName,
          contentType: imageFile.type,
        });

        imageUrl = await storage.generatePresignedUrl({
          key: imageKey,
          expireTime: 31536000, // 1年有效期
        });
        console.log('图片上传成功:', imageUrl?.substring(0, 80));
      } catch (uploadError) {
        console.error('图片上传失败:', uploadError);
        return NextResponse.json({ 
          error: `图片上传失败: ${uploadError instanceof Error ? uploadError.message : '未知错误'}` 
        }, { status: 500 });
      }
    }

    // 如果有上传门店图片,上传到对象存储
    if (storeImageFile && storeImageFile.size > 0) {
      try {
        console.log('开始上传门店图片...', storeImageFile.name, storeImageFile.size, 'bytes');
        const buffer = Buffer.from(await storeImageFile.arrayBuffer());
        
        const originalName = storeImageFile.name;
        const ext = originalName.split('.').pop() || 'jpg';
        const safeFileName = `store_${Date.now()}.${ext}`;
        const fileName = `promotions/${safeFileName}`;
        
        const storeImageKey = await storage.uploadFile({
          fileContent: buffer,
          fileName: fileName,
          contentType: storeImageFile.type,
        });

        storeImageUrl = await storage.generatePresignedUrl({
          key: storeImageKey,
          expireTime: 31536000,
        });
        console.log('门店图片上传成功:', storeImageUrl?.substring(0, 80));
      } catch (uploadError) {
        console.error('门店图片上传失败:', uploadError);
        return NextResponse.json({ 
          error: `门店图片上传失败: ${uploadError instanceof Error ? uploadError.message : '未知错误'}` 
        }, { status: 500 });
      }
    }

    // 如果有上传视频,上传到对象存储
    if (videoFile && videoFile.size > 0) {
      try {
        console.log('开始上传视频...', videoFile.name, videoFile.size, 'bytes');
        const buffer = Buffer.from(await videoFile.arrayBuffer());
        console.log('视频buffer创建完成, 大小:', buffer.length);
        
        // 处理文件名，移除特殊字符和中文，只保留字母数字和扩展名
        const originalName = videoFile.name;
        const ext = originalName.split('.').pop() || 'mp4';
        const safeFileName = `video_${Date.now()}.${ext}`;
        const fileName = `videos/${safeFileName}`;
        console.log('原始文件名:', originalName, '-> 安全文件名:', fileName);
        
        const videoKey = await storage.uploadFile({
          fileContent: buffer,
          fileName: fileName,
          contentType: videoFile.type || 'video/mp4',
        });
        console.log('上传完成, 返回key:', videoKey);

        videoUrl = await storage.generatePresignedUrl({
          key: videoKey,
          expireTime: 31536000, // 1年有效期
        });
        hasNewVideo = true;
        console.log('视频URL生成成功:', videoUrl?.substring(0, 80));
      } catch (uploadError) {
        console.error('视频上传失败:', uploadError);
        return NextResponse.json({ 
          error: `视频上传失败: ${uploadError instanceof Error ? uploadError.message : '未知错误'}` 
        }, { status: 500 });
      }
    } else if (videoUrlInput && videoUrlInput.trim()) {
      // 如果没有上传视频但有链接，提取URL并使用
      const extractedUrl = extractUrl(videoUrlInput.trim());
      if (extractedUrl) {
        videoUrl = extractedUrl;
        hasNewVideo = true;
        console.log('从分享文字中提取视频链接:', videoUrl);
      } else {
        console.log('无法从输入中提取有效URL:', videoUrlInput);
      }
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
      
      if (storeImageUrl) {
        updateData.store_image_url = storeImageUrl;
      }
      
      // 只有在有新视频时才更新video_url
      if (hasNewVideo) {
        updateData.video_url = videoUrl;
      }

      console.log('更新数据库, ID:', id);
      console.log('更新数据:', JSON.stringify(updateData, null, 2));

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

      console.log('更新成功:', JSON.stringify(data, null, 2));
      return NextResponse.json({ data, videoUploaded: hasNewVideo });
    } else {
      // 创建新内容
      console.log('创建新内容');
      const { data, error } = await client
        .from('promotion_contents')
        .insert({
          title,
          description: description || null,
          image_url: imageUrl,
          video_url: videoUrl,
          store_image_url: storeImageUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('创建失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log('创建成功:', JSON.stringify(data, null, 2));
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
