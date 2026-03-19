import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取所有推广者
export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('promoters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: '获取推广者列表失败' }, { status: 500 });
  }
}

// 创建新推广者
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, wechat } = body;

    if (!name) {
      return NextResponse.json({ error: '姓名不能为空' }, { status: 400 });
    }

    // 生成唯一标识码
    const uniqueCode = generateUniqueCode();

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('promoters')
      .insert({
        name,
        phone: phone || null,
        wechat: wechat || null,
        unique_code: uniqueCode,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: '创建推广者失败' }, { status: 500 });
  }
}

// 生成唯一标识码
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
