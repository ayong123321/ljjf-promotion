import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/storage/database/supabase-client';

// 生成唯一推广码
function generatePromoterCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 访客自助注册成为推广者
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, wechat, referrerCode, cashbackRuleType = 'type_300' } = body;

    console.log('[推广者注册] 收到请求:', { name, phone, wechat, referrerCode, cashbackRuleType });

    if (!name || !phone) {
      console.error('[推广者注册] 缺少必填字段:', { name, phone });
      return NextResponse.json({ error: '请填写姓名和手机号' }, { status: 400 });
    }

    const client = getSupabaseServiceClient();

    console.log('[推广者注册] 检查手机号是否已注册:', phone);
    // 检查手机号是否已注册
    const { data: existingPromoter, error: checkError } = await client
      .from('promoters')
      .select('id, unique_code, name, cashback_rule_type')
      .eq('phone', phone)
      .maybeSingle();

    if (checkError) {
      console.error('[推广者注册] 检查失败:', checkError);
      return NextResponse.json({ error: '检查手机号失败' }, { status: 500 });
    }

    if (existingPromoter) {
      // 已注册，返回已有信息
      console.log('[推广者注册] 手机号已注册:', existingPromoter);
      return NextResponse.json({
        data: existingPromoter,
        message: '您已经是推广者了',
        isNew: false
      });
    }

    // 生成唯一推广码（确保不重复）
    console.log('[推广者注册] 生成推广码...');
    let uniqueCode = generatePromoterCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: codeCheck } = await client
        .from('promoters')
        .select('id')
        .eq('unique_code', uniqueCode)
        .maybeSingle();

      if (!codeCheck) break;
      uniqueCode = generatePromoterCode();
      attempts++;
    }
    console.log('[推广者注册] 推广码生成成功:', uniqueCode);

    // 创建新推广者
    console.log('[推广者注册] 创建新推广者:', { name, phone, cashbackRuleType });
    const { data: newPromoter, error: insertError } = await client
      .from('promoters')
      .insert({
        name,
        phone,
        wechat: wechat || phone,
        unique_code: uniqueCode,
        is_active: true,
        cashback_rule_type: cashbackRuleType
      })
      .select()
      .single();

    if (insertError) {
      console.error('[推广者注册] 创建失败:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log('[推广者注册] 创建成功:', newPromoter);

    return NextResponse.json({
      data: newPromoter,
      message: '注册成功',
      isNew: true
    });
  } catch (error) {
    console.error('[推广者注册] 异常:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '注册失败'
    }, { status: 500 });
  }
}
