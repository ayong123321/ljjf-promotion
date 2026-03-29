import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 获取管理后台用的 Supabase 客户端（使用 SERVICE_KEY 绕过 RLS）
function getAdminClient() {
  const url = process.env.COZE_SUPABASE_URL;
  const key = process.env.COZE_SUPABASE_SERVICE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase 环境变量未配置');
  }
  
  return createClient(url, key);
}

// GET - 获取内容列表
export async function GET() {
  try {
    const client = getAdminClient();
    const { data, error } = await client
      .from('promotion_contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    // 映射字段：将 image_url/video_url 映射为 type 和 url
    const mappedData = (data || []).map(item => {
      let type: 'image' | 'video' = 'image';
      let url = '';
      
      if (item.video_url) {
        type = 'video';
        url = item.video_url;
      } else if (item.image_url) {
        type = 'image';
        url = item.image_url;
      } else if (item.store_image_url) {
        type = 'image';
        url = item.store_image_url;
      }
      
      return {
        ...item,
        type,
        url
      };
    });

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    });
  }
}

// POST - 添加内容
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, url } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: '标题不能为空' });
    }

    if (!url || !url.trim()) {
      return NextResponse.json({ success: false, error: '链接地址不能为空' });
    }

    if (!['image', 'video'].includes(type)) {
      return NextResponse.json({ success: false, error: '类型必须是 image 或 video' });
    }

    const client = getAdminClient();
    
    // 根据类型存储到不同字段
    const insertData: Record<string, unknown> = {
      title: title.trim(),
      description: description?.trim() || null,
      is_active: true
    };
    
    if (type === 'image') {
      insertData.image_url = url.trim();
    } else {
      insertData.video_url = url.trim();
    }
    
    const { data, error } = await client
      .from('promotion_contents')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    // 返回映射后的数据
    return NextResponse.json({ 
      success: true, 
      data: {
        ...data,
        type,
        url
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '添加失败' 
    });
  }
}

// DELETE - 删除内容
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' });
    }

    const client = getAdminClient();
    const { error } = await client
      .from('promotion_contents')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '删除失败' 
    });
  }
}
