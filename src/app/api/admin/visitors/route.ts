import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase 环境变量未配置');
  return createClient(url, key);
}

// 获取所有访客记录
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const promoterCode = searchParams.get('promoter_code');
    
    // 先获取推广者列表建立映射
    const { data: promoters } = await client
      .from('promoters')
      .select('id, name, code');
    
    const promoterMap = new Map(promoters?.map(p => [p.id, { name: p.name, code: p.code }]) || []);
    
    // 获取访客记录
    const { data, error } = await client
      .from('visitor_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }
    
    // 过滤并格式化数据
    let result = (data || []).map(v => ({
      id: v.id,
      promoter_id: v.promoter_id,
      promoter_code: promoterMap.get(v.promoter_id)?.code || '',
      promoters: promoterMap.get(v.promoter_id) || null,
      wechat: v.wechat_id,
      ip: v.ip_address,
      status: v.deal_status || 'pending',
      created_at: v.created_at
    }));
    
    if (promoterCode) {
      result = result.filter(v => v.promoter_code === promoterCode);
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    });
  }
}

// 更新访客状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, remark } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少访客ID' });
    }
    
    const client = getSupabaseClient();
    
    // 使用 deal_status 字段
    const updateData: Record<string, unknown> = {};
    if (status) updateData.deal_status = status;
    
    const { error } = await client
      .from('visitor_records')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '更新失败' 
    });
  }
}
