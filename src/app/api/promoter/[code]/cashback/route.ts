import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/storage/database/supabase-client';

// 获取推广者的返现统计
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    console.log('[GET] 查询推广者返现统计:', code);

    const client = getSupabaseServiceClient();

    // 查询推广者
    const { data: promoter, error: promoterError } = await client
      .from('promoters')
      .select('id')
      .eq('unique_code', code)
      .maybeSingle();

    if (promoterError || !promoter) {
      return NextResponse.json({ error: '推广者不存在' }, { status: 404 });
    }

    const promoterId = (promoter as Record<string, unknown>).id;

    // 查询已核销的访客记录
    const { data: verifiedRecords, error: verifiedError } = await client
      .from('visitor_records')
      .select('cashback_amount, cashback_status')
      .eq('promoter_id', promoterId)
      .eq('is_verified', true);

    if (verifiedError) {
      console.error('[GET] 查询核销记录失败:', verifiedError);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    // 计算统计数据
    const verifiedCount = verifiedRecords?.length || 0;
    let pendingCashback = 0;
    let totalCashback = 0;

    verifiedRecords?.forEach((record: Record<string, unknown>) => {
      const amount = (record.cashback_amount as number) || 0;
      const status = record.cashback_status as string;
      
      if (status === 'pending') {
        pendingCashback += amount;
      } else if (status === 'paid') {
        totalCashback += amount;
      }
    });

    console.log('[GET] 返现统计:', { verifiedCount, pendingCashback, totalCashback });

    return NextResponse.json({
      data: {
        verifiedCount,
        pendingCashback,
        totalCashback
      }
    });
  } catch (error) {
    console.error('[GET] 异常:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '查询失败' }, { status: 500 });
  }
}
