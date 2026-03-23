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
    
    if (!code) {
      return NextResponse.json({ error: '推广码不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查询推广者信息
    const { data: promoter, error: promoterError } = await client
      .from('promoters')
      .select('*')
      .eq('code', code)
      .single();

    if (promoterError || !promoter) {
      return NextResponse.json({ error: '推广者不存在' }, { status: 404 });
    }

    // 获取访客记录
    const { data: visitorRecords } = await client
      .from('visitor_records')
      .select('*')
      .eq('promoter_code', code)
      .order('created_at', { ascending: false })
      .limit(100);

    const uniqueVisitors = new Set(visitorRecords?.map(v => v.ip)).size;
    const totalVisits = visitorRecords?.length || 0;
    const wechatSubmissions = visitorRecords?.filter(v => v.wechat).length || 0;

    // 获取推广内容
    const { data: contents } = await client
      .from('promotion_contents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    const content = contents?.[0] || null;

    // 格式化内容
    const formattedContent = content ? {
      title: content.title,
      description: content.description,
      image_url: content.type === 'image' ? content.url : null,
      video_url: content.type === 'video' ? content.url : null,
      store_image_url: null
    } : null;

    return NextResponse.json({
      data: {
        promoter,
        stats: {
          uniqueVisitors,
          totalVisits,
          wechatSubmissions,
        },
        visitorRecords: visitorRecords || [],
        content: formattedContent,
      }
    });
  } catch (error) {
    console.error('获取推广者信息失败:', error);
    return NextResponse.json({ error: '获取推广者信息失败' }, { status: 500 });
  }
}
