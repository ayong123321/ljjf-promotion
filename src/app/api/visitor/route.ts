import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 获取 Supabase 客户端（写入操作需要 SERVICE_KEY）
function getSupabaseClient() {
  const url = process.env.COZE_SUPABASE_URL;
  const key = process.env.COZE_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase 环境变量未配置');
  return createClient(url, key);
}

// 获取客户端IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

// 记录访客访问（幂等操作：每个推广者+IP只保留一条记录）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promoterCode, wechatId } = body;

    console.log('[POST] 收到访客请求:', { promoterCode, wechatId });

    if (!promoterCode) {
      return NextResponse.json({ error: '推广码不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';

    // 查询推广者
    const { data: promoter, error: promoterError } = await client
      .from('promoters')
      .select('id, name, unique_code')
      .eq('unique_code', promoterCode)
      .maybeSingle();

    if (promoterError || !promoter) {
      console.error('[POST] 推广者不存在:', promoterCode, promoterError);
      return NextResponse.json({ error: '推广者不存在' }, { status: 404 });
    }
    
    const promoterId = (promoter as Record<string, unknown>).id;

    // 查询该IP的最新记录（使用limit避免maybeSingle的问题）
    const { data: existingRecords, error: queryError } = await client
      .from('visitor_records')
      .select('*')
      .eq('promoter_id', promoterId)
      .eq('ip_address', ipAddress)
      .order('created_at', { ascending: false })
      .limit(1);

    if (queryError) {
      console.error('[POST] 查询失败:', queryError);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    // 有记录则返回最新的那条
    if (existingRecords && existingRecords.length > 0) {
      console.log('[POST] 返回已有记录:', existingRecords[0]);
      return NextResponse.json({ data: existingRecords[0] });
    }

    // 无记录则创建
    console.log('[POST] 创建新记录:', { promoterId, ipAddress, wechatId });
    const { data: newRecords, error: insertError } = await client
      .from('visitor_records')
      .insert({
        promoter_id: promoterId,
        wechat_id: wechatId || null,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select();

    if (insertError) {
      console.error('[POST] 创建失败:', insertError);
      // 可能是并发创建，再次查询
      const { data: retryRecords } = await client
        .from('visitor_records')
        .select('*')
        .eq('promoter_id', promoterId)
        .eq('ip_address', ipAddress)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (retryRecords && retryRecords.length > 0) {
        return NextResponse.json({ data: retryRecords[0] });
      }
      
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const newRecord = newRecords?.[0];
    console.log('[POST] 创建成功:', newRecord);
    return NextResponse.json({ data: newRecord });
  } catch (error) {
    console.error('[POST] 异常:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '记录访客失败' }, { status: 500 });
  }
}

// 更新或提交微信号（幂等操作）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, wechatId, promoterCode } = body;

    console.log('[PUT] 收到更新请求:', { recordId, wechatId, promoterCode });

    if (!wechatId) {
      return NextResponse.json({ error: '请输入微信号或手机号' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';

    // 优先使用 recordId 更新
    if (recordId) {
      console.log('[PUT] 使用 recordId 更新:', recordId);
      const { data, error } = await client
        .from('visitor_records')
        .update({ wechat_id: wechatId })
        .eq('id', recordId)
        .select();

      if (error) {
        console.error('[PUT] 更新失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // 返回第一条记录
      const updatedRecord = data?.[0];
      if (updatedRecord) {
        console.log('[PUT] 更新成功:', updatedRecord);
        return NextResponse.json({ data: updatedRecord });
      }
      
      // recordId 对应的记录不存在，继续尝试用 promoterCode 处理
      console.log('[PUT] recordId 对应的记录不存在，尝试用 promoterCode 处理');
    }

    // 使用 promoterCode + IP 查找或创建
    if (promoterCode) {
      // 查询推广者
      const { data: promoter, error: promoterError } = await client
        .from('promoters')
        .select('id')
        .eq('unique_code', promoterCode)
        .maybeSingle();

      if (promoterError || !promoter) {
        console.error('[PUT] 推广者不存在:', promoterCode);
        return NextResponse.json({ error: '推广者不存在' }, { status: 404 });
      }

      const promoterId = (promoter as Record<string, unknown>).id;
      console.log('[PUT] 查找记录:', { promoterId, ipAddress });

      // 查找该IP的最新记录
      const { data: existingRecords, error: queryError } = await client
        .from('visitor_records')
        .select('*')
        .eq('promoter_id', promoterId)
        .eq('ip_address', ipAddress)
        .order('created_at', { ascending: false })
        .limit(1);

      if (queryError) {
        console.error('[PUT] 查询出错:', queryError);
        return NextResponse.json({ error: queryError.message }, { status: 500 });
      }

      // 找到记录，更新
      if (existingRecords && existingRecords.length > 0) {
        const existingId = existingRecords[0].id;
        const { data: updatedRecords, error: updateError } = await client
          .from('visitor_records')
          .update({ wechat_id: wechatId })
          .eq('id', existingId)
          .select();

        if (updateError) {
          console.error('[PUT] 更新失败:', updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        const updated = updatedRecords?.[0];
        if (updated) {
          console.log('[PUT] 更新成功:', updated);
          return NextResponse.json({ data: updated });
        }
        
        // 更新返回空，直接创建新记录
        console.log('[PUT] 更新返回空，创建新记录');
      }

      // 没有找到记录，创建新记录
      console.log('[PUT] 没找到记录，创建新记录');
      const { data: newRecords, error: insertError } = await client
        .from('visitor_records')
        .insert({
          promoter_id: promoterId,
          wechat_id: wechatId,
          ip_address: ipAddress,
          user_agent: userAgent
        })
        .select();

      if (insertError) {
        console.error('[PUT] 创建失败:', insertError);
        // 可能是并发创建，再次查询并更新
        const { data: retryRecords } = await client
          .from('visitor_records')
          .select('*')
          .eq('promoter_id', promoterId)
          .eq('ip_address', ipAddress)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (retryRecords && retryRecords.length > 0) {
          const { data: retryUpdateRecords } = await client
            .from('visitor_records')
            .update({ wechat_id: wechatId })
            .eq('id', retryRecords[0].id)
            .select();
          
          if (retryUpdateRecords && retryUpdateRecords.length > 0) {
            return NextResponse.json({ data: retryUpdateRecords[0] });
          }
        }
        
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      const newRecord = newRecords?.[0];
      console.log('[PUT] 创建成功:', newRecord);
      return NextResponse.json({ data: newRecord });
    }

    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  } catch (error) {
    console.error('[PUT] 异常:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '更新失败' }, { status: 500 });
  }
}
