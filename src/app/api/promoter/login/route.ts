import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/storage/database/supabase-client';

// 推广者登录验证（通过手机号+微信号）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, wechat } = body;

    console.log('[登录] 收到请求:', { phone, wechat });

    if (!phone || !wechat) {
      return NextResponse.json({ error: '请输入手机号和微信昵称' }, { status: 400 });
    }

    const client = getSupabaseServiceClient();

    // 查询推广者
    const { data: promoter, error } = await client
      .from('promoters')
      .select('id, name, unique_code, phone, wechat')
      .eq('phone', phone.trim())
      .eq('wechat', wechat.trim())
      .maybeSingle();

    if (error) {
      console.error('[登录] 查询失败:', error);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    if (!promoter) {
      return NextResponse.json({ error: '手机号或微信昵称错误，或您还未注册' }, { status: 401 });
    }

    console.log('[登录] 登录成功:', promoter);
    return NextResponse.json({ data: promoter });
  } catch (error) {
    console.error('[登录] 异常:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '登录失败' }, { status: 500 });
  }
}
