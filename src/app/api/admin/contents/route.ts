import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase 环境变量未配置');
  }
  
  return createClient(url, key);
}

// GET - 获取内容列表
export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('promotion_contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
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

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('promotion_contents')
      .insert({
        type,
        title: title.trim(),
        description: description?.trim() || null,
        url: url.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
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

    const client = getSupabaseClient();
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
