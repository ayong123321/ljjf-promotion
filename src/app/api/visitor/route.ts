import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.COZE_SUPABASE_URL;
  const key = process.env.COZE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase 环境变量未配置');
  return createClient(url, key);
}

// 记录访客访问
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promoterCode, wechatId } = body;

    console.log('收到访客请求:', { promoterCode, wechatId });

    if (!promoterCode) {
      return NextResponse.json({ error: '推广码不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查询推广者 - 使用 maybeSingle() 而不是 single() 避免错误
    const { data: promoter, error: promoterError } = await client
      .from('promoters')
      .select('id, name, unique_code')
      .eq('unique_code', promoterCode)
      .maybeSingle();

    if (promoterError) {
      console.error('查询推广者失败:', promoterError);
      return NextResponse.json({ error: '查询推广者失败' }, { status: 500 });
    }

    if (!promoter) {
      console.error('推广者不存在:', promoterCode);
      return NextResponse.json({ error: '推广者不存在' }, { status: 404 });
    }
    
    const promoterId = (promoter as { id: number }).id;

    // 获取访客信息
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    console.log('准备插入访客记录:', { promoterId, wechatId, ipAddress });

    // 插入访客记录
    const { data, error } = await client
      .from('visitor_records')
      .insert({
        promoter_id: promoterId,
        wechat_id: wechatId || null,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();

    if (error) {
      console.error('插入访客记录失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('访客记录创建成功:', data);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('记录访客失败:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '记录访客失败' }, { status: 500 });
  }
}

// 更新访客微信号
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, wechatId } = body;

    console.log('收到更新请求:', { recordId, wechatId });

    if (!recordId) {
      return NextResponse.json({ error: '缺少访客记录ID' }, { status: 400 });
    }

    if (!wechatId) {
      return NextResponse.json({ error: '请输入微信号或手机号' }, { status: 400 });
    }

    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('visitor_records')
      .update({ wechat_id: wechatId })
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      console.error('更新访客信息失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('访客信息更新成功:', data);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('更新访客信息失败:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '更新访客信息失败' }, { status: 500 });
  }
}
