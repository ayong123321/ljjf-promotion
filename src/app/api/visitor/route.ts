import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

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
      .eq('unique_code', promoterCode)
      .eq('is_active', true)
      .single();

    if (promoterError || !promoter) {
      return NextResponse.json({ error: '推广者不存在或已禁用' }, { status: 404 });
    }

    // 获取访客信息
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';

    // 插入访客记录
    const { data, error } = await client
      .from('visitor_records')
      .insert({
        promoter_id: promoter.id,
        wechat_id: wechatId || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
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
