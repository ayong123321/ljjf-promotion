import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseServiceClient();
    
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
