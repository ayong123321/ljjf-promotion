import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取统计数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promoterId = searchParams.get('promoterId');

    const client = getSupabaseClient();

    if (promoterId) {
      // 获取特定推广者的统计数据
      const { data: visitorRecords, error: visitorError } = await client
        .from('visitor_records')
        .select('*')
        .eq('promoter_id', parseInt(promoterId))
        .order('created_at', { ascending: false });

      if (visitorError) {
        return NextResponse.json({ error: visitorError.message }, { status: 500 });
      }

      // 统计访客数量
      const uniqueVisitors = new Set(visitorRecords?.map(v => v.ip_address)).size;
      const totalVisits = visitorRecords?.length || 0;
      const wechatSubmissions = visitorRecords?.filter(v => v.wechat_id).length || 0;

      return NextResponse.json({
        data: {
          visitorRecords,
          stats: {
            uniqueVisitors,
            totalVisits,
            wechatSubmissions,
          }
        }
      });
    } else {
      // 获取所有推广者的统计数据
      const { data: promoters, error: promotersError } = await client
        .from('promoters')
        .select('*')
        .order('created_at', { ascending: false });

      if (promotersError) {
        return NextResponse.json({ error: promotersError.message }, { status: 500 });
      }

      // 获取每个推广者的统计数据
      const promotersWithStats = await Promise.all(
        (promoters || []).map(async (promoter) => {
          const { data: visitorRecords } = await client
            .from('visitor_records')
            .select('*')
            .eq('promoter_id', promoter.id);

          const uniqueVisitors = new Set(visitorRecords?.map(v => v.ip_address)).size;
          const totalVisits = visitorRecords?.length || 0;
          const wechatSubmissions = visitorRecords?.filter(v => v.wechat_id).length || 0;

          return {
            ...promoter,
            stats: {
              uniqueVisitors,
              totalVisits,
              wechatSubmissions,
            }
          };
        })
      );

      return NextResponse.json({ data: promotersWithStats });
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}
