import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/storage/database/supabase-client';

// 禁用缓存
export const dynamic = 'force-dynamic';

// 将数据库状态映射为前端状态
function mapStatus(dbStatus: string | null): string {
  if (!dbStatus || dbStatus === '未成交') return 'pending';
  if (dbStatus === '已添加') return 'added';
  if (dbStatus === '已成交') return 'dealed';
  return dbStatus;
}

export async function GET() {
  try {
    const client = getSupabaseServiceClient();
    
    // 获取所有推广者
    const { data: promoters, error: promotersError } = await client
      .from('promoters')
      .select('id, name, unique_code');
    
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
    const stats = promoters?.map((p: { id: number; name: string; unique_code: string }) => {
      const promoterVisitors = visitors?.filter((v: { promoter_id: number }) => v.promoter_id === p.id) || [];
      return {
        code: p.unique_code,
        name: p.name,
        totalVisits: promoterVisitors.length,
        wechatSubmissions: promoterVisitors.filter((v: { wechat_id: string | null }) => v.wechat_id).length,
        addedCount: promoterVisitors.filter((v: { deal_status: string | null }) => mapStatus(v.deal_status) === 'added').length,
        dealedCount: promoterVisitors.filter((v: { deal_status: string | null }) => mapStatus(v.deal_status) === 'dealed').length
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
