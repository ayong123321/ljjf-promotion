import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase 环境变量未配置');
  return createClient(url, key);
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
      .select('id, name, code')
      .eq('code', code)
      .single();
    
    if (promoterError || !promoter) {
      return NextResponse.json({ success: false, error: '推广者不存在' });
    }
    
    // 获取统计数据
    const { data: visitors } = await client
      .from('visitor_records')
      .select('*')
      .eq('promoter_id', promoter.id);
    
    const stats = {
      totalVisits: visitors?.length || 0,
      uniqueVisitors: new Set(visitors?.map(v => v.ip_address)).size || 0,
      wechatSubmissions: visitors?.filter(v => v.wechat_id).length || 0,
      addedCount: visitors?.filter(v => v.deal_status === 'added').length || 0,
      dealedCount: visitors?.filter(v => v.deal_status === 'dealed').length || 0
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
      data: { promoter, stats, content }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    });
  }
}
