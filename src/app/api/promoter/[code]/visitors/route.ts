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
    
    // 先获取推广者ID
    const { data: promoter } = await client
      .from('promoters')
      .select('id')
      .eq('code', code)
      .single();
    
    if (!promoter) {
      return NextResponse.json({ success: false, error: '推广者不存在' });
    }
    
    const { data, error } = await client
      .from('visitor_records')
      .select('*')
      .eq('promoter_id', promoter.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }
    
    // 格式化数据
    const result = (data || []).map(v => ({
      id: v.id,
      promoter_code: code,
      wechat: v.wechat_id,
      ip: v.ip_address,
      status: v.deal_status || 'pending',
      created_at: v.created_at
    }));
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    });
  }
}
