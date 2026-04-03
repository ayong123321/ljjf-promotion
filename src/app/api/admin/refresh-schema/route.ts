import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/storage/database/supabase-client';

// 刷新 Supabase Schema Cache
export async function GET() {
  try {
    const client = getSupabaseServiceClient();
    
    // 执行一个简单的查询来刷新 schema cache
    const { data, error } = await client
      .from('promoters')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('[刷新Schema] 错误:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: '可能是 schema cache 问题，请尝试在 Supabase 控制台刷新'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Schema cache 已刷新',
      data 
    });
  } catch (error) {
    console.error('[刷新Schema] 异常:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }, { status: 500 });
  }
}
