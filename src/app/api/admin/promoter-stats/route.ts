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
    
    // 获取所有推广者
    const { data: promoters, error: promotersError } = await client
      .from('promoters')
      .select('id, name, code');
    
    if (promotersError) {
      return NextResponse.json({ success: false, error: promotersError.message });
    }
    
    // 获取所有访客记录
    const { data: visitors, error: visitorsError } = await client
      .from('visitor_records')
      .select('promoter_id, wechat_id, deal_status');
    
    if (visitorsError) {
      return NextResponse.json({ success: false, error: visitorsError.message });
    }
    
    // 按推广者统计数据
    const stats = promoters?.map(p => {
      const promoterVisitors = visitors?.filter(v => v.promoter_id === p.id) || [];
      return {
        code: p.code,
        name: p.name,
        totalVisits: promoterVisitors.length,
        wechatSubmissions: promoterVisitors.filter(v => v.wechat_id).length,
        addedCount: promoterVisitors.filter(v => v.deal_status === 'added').length,
        dealedCount: promoterVisitors.filter(v => v.deal_status === 'dealed').length
      };
    }) || [];
    
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    });
  }
}
