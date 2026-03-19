import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    if (!code) {
      return NextResponse.json({ error: '推广码不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查询推广者信息
    const { data: promoter, error: promoterError } = await client
      .from('promoters')
      .select('*')
      .eq('unique_code', code)
      .eq('is_active', true)
      .single();

    if (promoterError || !promoter) {
      return NextResponse.json({ error: '推广者不存在或已禁用' }, { status: 404 });
    }

    // 获取推广者的统计数据
    const { data: visitorRecords } = await client
      .from('visitor_records')
      .select('*')
      .eq('promoter_id', promoter.id)
      .order('created_at', { ascending: false })
      .limit(100);

    const uniqueVisitors = new Set(visitorRecords?.map(v => v.ip_address)).size;
    const totalVisits = visitorRecords?.length || 0;
    const wechatSubmissions = visitorRecords?.filter(v => v.wechat_id).length || 0;

    // 获取激活的推广内容
    const { data: content } = await client
      .from('promotion_contents')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    return NextResponse.json({
      data: {
        promoter,
        stats: {
          uniqueVisitors,
          totalVisits,
          wechatSubmissions,
        },
        visitorRecords: visitorRecords || [],
        content,
      }
    });
  } catch (error) {
    console.error('获取推广者信息失败:', error);
    return NextResponse.json({ error: '获取推广者信息失败' }, { status: 500 });
  }
}
