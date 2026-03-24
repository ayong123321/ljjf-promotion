import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.COZE_SUPABASE_URL;
  const key = process.env.COZE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase 环境变量未配置');
  return createClient(url, key);
}

// 记录访客访问（幂等操作：同一推广者+同一IP只创建一条记录）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promoterCode, wechatId } = body;

    console.log('收到访客请求:', { promoterCode, wechatId });

    if (!promoterCode) {
      return NextResponse.json({ error: '推广码不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查询推广者
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
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    console.log('访客信息:', { promoterId, ipAddress, wechatId });

    // 先检查该推广者下是否已有该IP的访客记录
    const { data: existingRecord, error: searchError } = await client
      .from('visitor_records')
      .select('*')
      .eq('promoter_id', promoterId)
      .eq('ip_address', ipAddress)
      .maybeSingle();

    if (searchError) {
      console.error('查询访客记录失败:', searchError);
      return NextResponse.json({ error: '查询访客记录失败' }, { status: 500 });
    }

    // 如果已有记录，更新并返回
    if (existingRecord) {
      console.log('找到已有访客记录:', existingRecord);
      
      // 如果提供了微信号且当前记录没有微信号，则更新
      if (wechatId && !(existingRecord as Record<string, unknown>).wechat_id) {
        const { data: updatedRecord, error: updateError } = await client
          .from('visitor_records')
          .update({ wechat_id: wechatId })
          .eq('id', (existingRecord as Record<string, unknown>).id)
          .select()
          .single();

        if (updateError) {
          console.error('更新访客记录失败:', updateError);
        } else {
          return NextResponse.json({ data: updatedRecord });
        }
      }
      
      return NextResponse.json({ data: existingRecord });
    }

    // 没有记录则创建新记录
    console.log('创建新访客记录');
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

// 更新访客微信号（通过推广码和IP查找记录）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, wechatId, promoterCode } = body;

    console.log('收到更新请求:', { recordId, wechatId, promoterCode });

    if (!wechatId) {
      return NextResponse.json({ error: '请输入微信号或手机号' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 如果有 recordId，直接更新
    if (recordId) {
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
    }

    // 如果没有 recordId 但有 promoterCode，通过推广者和IP查找
    if (promoterCode) {
      // 查询推广者
      const { data: promoter, error: promoterError } = await client
        .from('promoters')
        .select('id')
        .eq('unique_code', promoterCode)
        .maybeSingle();

      if (promoterError || !promoter) {
        return NextResponse.json({ error: '推广者不存在' }, { status: 404 });
      }

      const promoterId = (promoter as Record<string, unknown>).id;

      // 获取IP
      const forwarded = request.headers.get('x-forwarded-for');
      const ipAddress = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

      // 查找并更新
      const { data, error } = await client
        .from('visitor_records')
        .update({ wechat_id: wechatId })
        .eq('promoter_id', promoterId)
        .eq('ip_address', ipAddress)
        .select()
        .maybeSingle();

      if (error) {
        console.error('更新访客信息失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        // 没有找到记录，创建一条新记录
        const userAgent = request.headers.get('user-agent') || '';
        const { data: newRecord, error: insertError } = await client
          .from('visitor_records')
          .insert({
            promoter_id: promoterId,
            wechat_id: wechatId,
            ip_address: ipAddress,
            user_agent: userAgent
          })
          .select()
          .single();

        if (insertError) {
          console.error('创建访客记录失败:', insertError);
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ data: newRecord });
      }

      console.log('访客信息更新成功:', data);
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  } catch (error) {
    console.error('更新访客信息失败:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '更新访客信息失败' }, { status: 500 });
  }
}
