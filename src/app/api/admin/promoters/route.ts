import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.COZE_SUPABASE_URL;
  const key = process.env.COZE_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase 环境变量未配置');
  }
  
  return createClient(url, key);
}

// 生成唯一推广码
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - 获取推广者列表
export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('promoters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    // 映射字段名，将 unique_code 映射为 code
    const mappedData = (data || []).map(p => ({
      ...p,
      code: p.unique_code
    }));

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    });
  }
}

// POST - 添加推广者
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: '姓名不能为空' });
    }

    const client = getSupabaseClient();
    
    // 生成唯一推广码
    let code = generateCode();
    let attempts = 0;
    
    // 确保推广码唯一
    while (attempts < 10) {
      const { data: existing } = await client
        .from('promoters')
        .select('unique_code')
        .eq('unique_code', code)
        .single();
      
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const { data, error } = await client
      .from('promoters')
      .insert({
        name: name.trim(),
        phone: phone?.trim() || null,
        unique_code: code,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    // 映射字段名
    const mappedData = {
      ...data,
      code: data?.unique_code || code
    };

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '添加失败' 
    });
  }
}

// DELETE - 删除推广者
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' });
    }

    const client = getSupabaseClient();
    const { error } = await client
      .from('promoters')
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
