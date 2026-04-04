import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const client = getSupabaseServiceClient();
    
    // 获取推广者信息
    const { data: promoter, error: promoterError } = await client
      .from('promoters')
      .select('id, name, unique_code')
      .eq('unique_code', code)
      .maybeSingle();
    
    if (promoterError) {
      return NextResponse.json({ success: false, error: promoterError.message });
    }
    
    if (!promoter) {
      return NextResponse.json({ success: false, error: '推广者不存在' });
    }
    
    // 格式化推广者数据
    const promoterData = {
      id: (promoter as { id: number; name: string; unique_code: string }).id,
      name: (promoter as { id: number; name: string; unique_code: string }).name,
      code: (promoter as { id: number; name: string; unique_code: string }).unique_code,
      cashbackRuleType: 'type_300' // 默认使用300版本
    };
    
    // 获取访客记录
    const { data: visitors } = await client
      .from('visitor_records')
      .select('*')
      .eq('promoter_id', promoterData.id);
    
    // 获取统计数据
    // 独立访客：按IP去重
    // 总访问次数：所有记录数（包含同一IP的多次访问）
    // 留微信数：有wechat_id的记录数（按最新记录统计，避免重复）
    const uniqueIps = new Set(visitors?.map((v: { ip_address: string }) => v.ip_address));
    
    // 统计有微信的记录（每个IP只算一次，取最新的那条）
    const ipWechatMap = new Map<string, boolean>();
    visitors?.forEach((v: { ip_address: string; wechat_id: string | null }) => {
      if (v.wechat_id) {
        ipWechatMap.set(v.ip_address, true);
      }
    });
    
    const stats = {
      totalVisits: visitors?.length || 0,
      uniqueVisitors: uniqueIps.size || 0,
      wechatSubmissions: ipWechatMap.size || 0,
      addedCount: visitors?.filter((v: { deal_status: string | null }) => mapStatus(v.deal_status) === 'added').length || 0,
      dealedCount: visitors?.filter((v: { deal_status: string | null }) => mapStatus(v.deal_status) === 'dealed').length || 0
    };
    
    // 获取所有内容（图片和视频）
    const { data: contents } = await client
      .from('promotion_contents')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 分类内容 - 根据 image_url 和 video_url 判断类型
    const images = contents?.filter(c => c.image_url || c.store_image_url).map(c => ({
      title: c.title,
      description: c.description,
      url: c.image_url || c.store_image_url
    })) || [];
    
    const videos = contents?.filter(c => c.video_url).map(c => ({
      title: c.title,
      description: c.description,
      url: c.video_url
    })) || [];
    
    const content = {
      title: '玲姐假发',
      description: '专业假发定制',
      images,
      videos
    };
    
    return NextResponse.json({
      success: true,
      data: { promoter: promoterData, stats, content }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    });
  }
}
