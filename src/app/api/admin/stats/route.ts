import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase 环境变量未配置');
  return createClient(url, key);
}

export async function GET() {
  try {
    const client = getSupabaseClient();
    
    // 获取所有访客记录
    const { data: visitors, error } = await client
      .from('visitor_records')
      .select('*');
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }
    
    // 计算统计数据
    const totalVisitors = visitors?.length || 0;
    const uniqueVisitors = new Set(visitors?.map(v => v.ip)).size;
    const wechatSubmissions = visitors?.filter(v => v.wechat).length || 0;
    
    return NextResponse.json({
      success: true,
      data: {
        totalVisitors,
        uniqueVisitors,
        wechatSubmissions
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    });
  }
}
