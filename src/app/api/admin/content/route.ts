import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, getSupabaseServiceClient } from '@/storage/database/supabase-client';

// 从文本中提取URL（处理抖音分享文字）
const extractUrl = (text: string): string | null => {
  if (!text) return null;
  
  const trimmed = text.trim();
  
  // 如果已经是干净的URL（只包含URL，没有其他文字）
  if (/^https?:\/\/[^\s]+$/.test(trimmed)) {
    return trimmed;
  }
  
  // 尝试匹配各种抖音链接格式
  // 1. 短链接 v.douyin.com/xxx
  const shortMatch = trimmed.match(/https?:\/\/v\.douyin\.com\/[a-zA-Z0-9_-]+\/?/);
  if (shortMatch) {
    return shortMatch[0];
  }
  
  // 2. www.douyin.com 链接
  const wwwMatch = trimmed.match(/https?:\/\/www\.douyin\.com\/[^\s]*/);
  if (wwwMatch) {
    let url = wwwMatch[0];
    // 清理尾部特殊字符
    url = url.replace(/[^\w\/\-_.~?=&%]$/, '');
    return url;
  }
  
  // 3. 其他 douyin.com 链接
  const douyinMatch = trimmed.match(/https?:\/\/[^\s]*?douyin\.com\/[^\s]*/);
  if (douyinMatch) {
    let url = douyinMatch[0];
    url = url.replace(/[^\w\/\-_.~?=&%]$/, '');
    return url;
  }
  
  // 4. 通用 http/https URL
  const urlMatch = trimmed.match(/https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+/);
  return urlMatch ? urlMatch[0] : null;
};

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

    const client = getSupabaseServiceClient();
    const bucketName = 'promotions';
    let imageUrl: string | null = null;
    let videoUrl: string | null = null;
    let storeImageUrl: string | null = null;
    let hasNewVideo = false;

    // 如果有上传图片,先上传到 Supabase Storage
    if (imageFile && imageFile.size > 0) {
      try {
        console.log('开始上传图片...', imageFile.name, imageFile.size, 'bytes');
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        
        // 处理文件名
        const originalName = imageFile.name;
        const ext = originalName.split('.').pop() || 'jpg';
        const safeFileName = `images/image_${Date.now()}.${ext}`;
        console.log('原始文件名:', originalName, '-> 安全文件名:', safeFileName);
        
        const { data, error } = await client.storage
          .from(bucketName)
          .upload(safeFileName, buffer, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (error) {
          throw error;
        }

        // 生成公开访问 URL
        const { data: urlData } = client.storage
          .from(bucketName)
          .getPublicUrl(data.path);
        
        imageUrl = urlData.publicUrl;
        console.log('图片上传成功:', imageUrl?.substring(0, 80));
      } catch (uploadError) {
        console.error('图片上传失败:', uploadError);
        return NextResponse.json({ 
          error: `图片上传失败: ${uploadError instanceof Error ? uploadError.message : '未知错误'}` 
        }, { status: 500 });
      }
    }

    // 如果有上传门店图片,上传到 Supabase Storage
    if (storeImageFile && storeImageFile.size > 0) {
      try {
        console.log('开始上传门店图片...', storeImageFile.name, storeImageFile.size, 'bytes');
        const buffer = Buffer.from(await storeImageFile.arrayBuffer());
        
        const originalName = storeImageFile.name;
        const ext = originalName.split('.').pop() || 'jpg';
        const safeFileName = `stores/store_${Date.now()}.${ext}`;
        
        const { data, error } = await client.storage
          .from(bucketName)
          .upload(safeFileName, buffer, {
            contentType: storeImageFile.type,
            upsert: false,
          });

        if (error) {
          throw error;
        }

        const { data: urlData } = client.storage
          .from(bucketName)
          .getPublicUrl(data.path);
        
        storeImageUrl = urlData.publicUrl;
        console.log('门店图片上传成功:', storeImageUrl?.substring(0, 80));
      } catch (uploadError) {
        console.error('门店图片上传失败:', uploadError);
        return NextResponse.json({ 
          error: `门店图片上传失败: ${uploadError instanceof Error ? uploadError.message : '未知错误'}` 
        }, { status: 500 });
      }
    }

    // 如果有上传视频,上传到 Supabase Storage
    if (videoFile && videoFile.size > 0) {
      try {
        console.log('开始上传视频...', videoFile.name, videoFile.size, 'bytes');
        const buffer = Buffer.from(await videoFile.arrayBuffer());
        console.log('视频buffer创建完成, 大小:', buffer.length);
        
        // 处理文件名
        const originalName = videoFile.name;
        const ext = originalName.split('.').pop() || 'mp4';
        const safeFileName = `videos/video_${Date.now()}.${ext}`;
        console.log('原始文件名:', originalName, '-> 安全文件名:', safeFileName);
        
        const { data, error } = await client.storage
          .from(bucketName)
          .upload(safeFileName, buffer, {
            contentType: videoFile.type || 'video/mp4',
            upsert: false,
          });

        if (error) {
          throw error;
        }

        const { data: urlData } = client.storage
          .from(bucketName)
          .getPublicUrl(data.path);
        
        videoUrl = urlData.publicUrl;
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
