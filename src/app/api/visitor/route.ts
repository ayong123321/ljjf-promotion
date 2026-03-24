import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase 环境变量未配置');
  return createClient(url, key);
}

// 记录访客访问
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promoterCode, wechatId } = body;

    if (!promoterCode) {
      return NextResponse.json({ error: '推广码不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查询推广者
    const { data: promoter, error: promoterError } = await client
      .from('promoters')
      .select('*')
      .eq('code', promoterCode)
      .single();

    if (promoterError || !promoter) {
      return NextResponse.json({ error: '推广者不存在' }, { status: 404 });
    }

    // 获取访客信息
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // 插入访客记录（使用正确的字段名）
    const { data, error } = await client
      .from('visitor_records')
      .insert({
        promoter_id: promoter.id,
        wechat_id: wechatId || null,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('记录访客失败:', error);
    return NextResponse.json({ error: '记录访客失败' }, { status: 500 });
  }
}

// 更新访客微信号
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, wechatId } = body;

    if (!recordId || !wechatId) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('visitor_records')
      .update({ wechat_id: wechatId })
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('更新访客信息失败:', error);
    return NextResponse.json({ error: '更新访客信息失败' }, { status: 500 });
  }
}
