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
    
    // 先获取推广者ID
    const { data: promoter } = await client
      .from('promoters')
      .select('id')
      .eq('unique_code', code)
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
    
    // 格式化数据 - 隐藏微信信息，只显示状态
    const result = (data || []).map(v => ({
      id: v.id,
      promoter_code: code,
      // 只显示微信的前2位和后2位，中间用***代替
      hasWechat: !!v.wechat_id,
      wechatMasked: v.wechat_id ? `${v.wechat_id.substring(0, 2)}***${v.wechat_id.substring(v.wechat_id.length - 2)}` : null,
      ip: v.ip_address,
      status: mapStatus(v.deal_status),
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
