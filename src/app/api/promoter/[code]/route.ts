import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 禁用缓存
export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const url = process.env.COZE_SUPABASE_URL;
  const key = process.env.COZE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase 环境变量未配置');
  return createClient(url, key);
}

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
    const client = getSupabaseClient();
    
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
      code: (promoter as { id: number; name: string; unique_code: string }).unique_code
    };
    
    // 获取统计数据
    const { data: visitors } = await client
      .from('visitor_records')
      .select('*')
      .eq('promoter_id', promoterData.id);
    
    const stats = {
      totalVisits: visitors?.length || 0,
      uniqueVisitors: new Set(visitors?.map(v => v.ip_address)).size || 0,
      wechatSubmissions: visitors?.filter(v => v.wechat_id).length || 0,
      addedCount: visitors?.filter(v => mapStatus(v.deal_status) === 'added').length || 0,
      dealedCount: visitors?.filter(v => mapStatus(v.deal_status) === 'dealed').length || 0
    };
    
    // 获取所有内容（图片和视频）
    const { data: contents } = await client
      .from('promotion_contents')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 分类内容
    const images = contents?.filter(c => c.type === 'image').map(c => ({
      title: c.title,
      description: c.description,
      url: c.url
    })) || [];
    
    const videos = contents?.filter(c => c.type === 'video').map(c => ({
      title: c.title,
      description: c.description,
      url: c.url
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
