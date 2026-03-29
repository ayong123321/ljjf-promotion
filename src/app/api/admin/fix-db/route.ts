import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 生成唯一推广码
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
  try {
    const url = process.env.COZE_SUPABASE_URL;
    const key = process.env.COZE_SUPABASE_SERVICE_KEY;
    
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase 环境变量未配置' });
    }
    
    const client = createClient(url, key);
    
    // 检查 promoters 表结构
    const { data: promoters, error: promoterError } = await client
      .from('promoters')
      .select('*')
      .limit(1);
    
    if (promoterError) {
      return NextResponse.json({ 
        error: '查询promoters表失败', 
        details: promoterError.message 
      });
    }
    
    // 检查是否有 unique_code 列
    const samplePromoter = promoters?.[0];
    const hasUniqueCode = samplePromoter && 'unique_code' in samplePromoter;
    
    // 获取所有推广者
    const { data: allPromoters, error: allError } = await client
      .from('promoters')
      .select('*');
    
    if (allError) {
      return NextResponse.json({ error: allError.message });
    }
    
    // 检查哪些推广者没有推广码
    const promotersWithoutCode = (allPromoters || []).filter(p => !p.unique_code);
    
    return NextResponse.json({
      success: true,
      tableStructure: {
        hasUniqueCodeColumn: hasUniqueCode,
        sampleColumns: samplePromoter ? Object.keys(samplePromoter) : []
      },
      promoters: {
        total: allPromoters?.length || 0,
        withoutCode: promotersWithoutCode.length,
        list: allPromoters
      },
      needsFix: promotersWithoutCode.length > 0
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '未知错误' 
    });
  }
}

export async function POST() {
  try {
    const url = process.env.COZE_SUPABASE_URL;
    const key = process.env.COZE_SUPABASE_SERVICE_KEY;
    
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase 环境变量未配置' });
    }
    
    const client = createClient(url, key);
    
    // 获取所有推广者
    const { data: allPromoters, error: allError } = await client
      .from('promoters')
      .select('*');
    
    if (allError) {
      return NextResponse.json({ error: allError.message });
    }
    
    const fixedPromoters = [];
    
    // 为每个没有推广码的推广者生成推广码
    for (const promoter of (allPromoters || [])) {
      if (!promoter.unique_code) {
        let code = generateCode();
        let attempts = 0;
        
        // 确保推广码唯一
        while (attempts < 10) {
          const { data: existing } = await client
            .from('promoters')
            .select('unique_code')
            .eq('unique_code', code)
            .single();
          
          if (!existing) break;
          code = generateCode();
          attempts++;
        }
        
        // 更新推广者
        const { error: updateError } = await client
          .from('promoters')
          .update({ unique_code: code })
          .eq('id', promoter.id);
        
        if (updateError) {
          // 如果是因为列不存在，提示用户去Supabase添加列
          if (updateError.message.includes('column') || updateError.message.includes('does not exist')) {
            return NextResponse.json({
              success: false,
              error: '数据库表缺少 unique_code 列',
              solution: '请在 Supabase 控制台的 SQL Editor 中执行以下SQL：',
              sql: `ALTER TABLE promoters ADD COLUMN unique_code VARCHAR(10) UNIQUE;`
            });
          }
          console.error('更新失败:', updateError);
        } else {
          fixedPromoters.push({ id: promoter.id, name: promoter.name, code });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `已为 ${fixedPromoters.length} 个推广者生成推广码`,
      fixedPromoters
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '未知错误' 
    });
  }
}
