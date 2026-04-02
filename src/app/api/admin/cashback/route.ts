import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/storage/database/supabase-client';

// GET: 获取返现列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending 或 paid

    console.log('[GET] 查询返现列表:', { status });

    const client = getSupabaseServiceClient();

    let query = client
      .from('visitor_records')
      .select(`
        id,
        wechat_id,
        verify_code,
        is_verified,
        verified_at,
        cashback_amount,
        cashback_status,
        cashback_paid_at,
        created_at,
        promoters (
          id,
          name,
          unique_code
        )
      `)
      .eq('is_verified', true)
      .not('cashback_amount', 'is', null)
      .order('verified_at', { ascending: false });

    if (status === 'pending') {
      query = query.eq('cashback_status', 'pending');
    } else if (status === 'paid') {
      query = query.eq('cashback_status', 'paid');
    }

    const { data, error } = await query;

    if (error) {
      console.error('[GET] 查询失败:', error);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    console.log('[GET] 查询成功，共', data?.length || 0, '条记录');
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[GET] 异常:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '查询失败' }, { status: 500 });
  }
}

// POST: 更新返现状态（标记为已返现）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId } = body;

    console.log('[POST] 标记返现:', { recordId });

    if (!recordId) {
      return NextResponse.json({ error: '记录ID不能为空' }, { status: 400 });
    }

    const client = getSupabaseServiceClient();

    // 更新返现状态
    const now = new Date().toISOString();
    const { data, error } = await client
      .from('visitor_records')
      .update({
        cashback_status: 'paid',
        cashback_paid_at: now
      })
      .eq('id', recordId)
      .select(`
        id,
        wechat_id,
        verify_code,
        cashback_amount,
        cashback_status,
        cashback_paid_at,
        promoters (
          id,
          name,
          unique_code
        )
      `);

    if (error) {
      console.error('[POST] 更新失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    console.log('[POST] 标记返现成功:', data[0]);
    return NextResponse.json({ data: data[0] });
  } catch (error) {
    console.error('[POST] 异常:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '更新失败' }, { status: 500 });
  }
}

// DELETE: 取消返现（将已返现改回待返现）
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('recordId');

    console.log('[DELETE] 取消返现:', { recordId });

    if (!recordId) {
      return NextResponse.json({ error: '记录ID不能为空' }, { status: 400 });
    }

    const client = getSupabaseServiceClient();

    // 更新返现状态为待返现
    const { data, error } = await client
      .from('visitor_records')
      .update({
        cashback_status: 'pending',
        cashback_paid_at: null
      })
      .eq('id', recordId)
      .select(`
        id,
        wechat_id,
        verify_code,
        cashback_amount,
        cashback_status,
        promoters (
          id,
          name,
          unique_code
        )
      `);

    if (error) {
      console.error('[DELETE] 更新失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    console.log('[DELETE] 取消返现成功:', data[0]);
    return NextResponse.json({ data: data[0] });
  } catch (error) {
    console.error('[DELETE] 异常:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '更新失败' }, { status: 500 });
  }
}
