import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/storage/database/supabase-client';

// 定义两种返现规则
// 300版本：100元 → 200元 → 300元（每3人一轮）
// 100版本：100元 → 200元 → 100元（每3人一轮）
const CASHBACK_RULES = {
  type_300: [100, 200, 300],
  type_100: [100, 200, 100]
};

// 计算返现金额
function calculateCashback(totalVerifiedCount: number, ruleType: string = 'type_300'): number {
  if (totalVerifiedCount < 1) return 0;
  // 每3人一个轮回，循环计算
  const ruleIndex = (totalVerifiedCount - 1) % 3;
  const rules = CASHBACK_RULES[ruleType as keyof typeof CASHBACK_RULES] || CASHBACK_RULES.type_300;
  return rules[ruleIndex];
}

// GET: 根据核销码查询访客信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    console.log('[GET] 查询核销码:', code);

    if (!code) {
      return NextResponse.json({ error: '核销码不能为空' }, { status: 400 });
    }

    const client = getSupabaseServiceClient();

    // 查询访客记录
    const { data: visitor, error: visitorError } = await client
      .from('visitor_records')
      .select(`
        *,
        promoters (
          id,
          name,
          unique_code,
          cashback_rule_type
        )
      `)
      .eq('verify_code', code)
      .maybeSingle();

    if (visitorError) {
      console.error('[GET] 查询失败:', visitorError);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    if (!visitor) {
      return NextResponse.json({ error: '核销码不存在' }, { status: 404 });
    }

    console.log('[GET] 查询成功:', visitor);
    return NextResponse.json({ data: visitor });
  } catch (error) {
    console.error('[GET] 异常:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '查询失败' }, { status: 500 });
  }
}

// POST: 核销访客记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    console.log('[POST] 核销请求:', { code });

    if (!code) {
      return NextResponse.json({ error: '核销码不能为空' }, { status: 400 });
    }

    const client = getSupabaseServiceClient();

    // 查询访客记录
    const { data: visitor, error: visitorError } = await client
      .from('visitor_records')
      .select(`
        *,
        promoters (
          id,
          name,
          unique_code,
          cashback_rule_type
        )
      `)
      .eq('verify_code', code)
      .maybeSingle();

    if (visitorError) {
      console.error('[POST] 查询失败:', visitorError);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    if (!visitor) {
      return NextResponse.json({ error: '核销码不存在' }, { status: 404 });
    }

    const visitorData = visitor as Record<string, unknown>;
    
    // 检查是否已核销
    if (visitorData.is_verified) {
      return NextResponse.json({ 
        error: '该核销码已被核销',
        data: visitor 
      }, { status: 400 });
    }

    const promoterId = visitorData.promoter_id;
    const promoterData = visitorData.promoters as Record<string, unknown> || {};
    // 获取推广者的返现规则类型，默认为 type_300
    const ruleType = (promoterData.cashback_rule_type as string) || 'type_300';

    // 查询该推广者已核销的总人数（包括当前这个）
    const { data: verifiedRecords, error: countError } = await client
      .from('visitor_records')
      .select('id')
      .eq('promoter_id', promoterId)
      .eq('is_verified', true);

    if (countError) {
      console.error('[POST] 查询核销数量失败:', countError);
      return NextResponse.json({ error: '查询核销数量失败' }, { status: 500 });
    }

    // 当前是第几个核销的用户（已有核销数 + 1）
    const totalVerifiedCount = (verifiedRecords?.length || 0) + 1;

    // 根据推广者的规则类型计算返现金额
    const cashbackAmount = calculateCashback(totalVerifiedCount, ruleType);

    console.log('[POST] 核销统计:', {
      totalVerifiedCount,
      cashbackAmount,
      promoterId,
      ruleType
    });

    // 更新访客记录为已核销
    const now = new Date().toISOString();
    const { data: updatedVisitor, error: updateError } = await client
      .from('visitor_records')
      .update({
        is_verified: true,
        verified_at: now,
        cashback_amount: cashbackAmount,
        cashback_status: 'pending' // 待返现
      })
      .eq('id', visitorData.id)
      .select(`
        *,
        promoters (
          id,
          name,
          unique_code
        )
      `);

    if (updateError) {
      console.error('[POST] 核销失败:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const result = updatedVisitor?.[0];
    console.log('[POST] 核销成功:', result);

    return NextResponse.json({ 
      data: result,
      cashbackInfo: {
        totalVerifiedCount,
        cashbackAmount,
        rule: `第${totalVerifiedCount}人核销，返现¥${cashbackAmount}`
      }
    });
  } catch (error) {
    console.error('[POST] 异常:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '核销失败' }, { status: 500 });
  }
}
