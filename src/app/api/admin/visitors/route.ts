import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/storage/database/supabase-client';

// 禁用缓存
export const dynamic = 'force-dynamic';

// 将数据库状态映射为前端状态
function mapStatus(dbStatus: string | null): string {
  if (!dbStatus || dbStatus === '未成交') return 'pending';
  if (dbStatus === '已添加') return 'added';
  if (dbStatus === '已成交') return 'dealed';
  return dbStatus; // 兼容其他值
}

// 将前端状态映射为数据库状态
function mapStatusToDb(status: string): string {
  if (status === 'pending') return '未成交';
  if (status === 'added') return '已添加';
  if (status === 'dealed') return '已成交';
  return status;
}

// 获取所有访客记录
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseServiceClient();
    const { searchParams } = new URL(request.url);
    const promoterCode = searchParams.get('promoter_code');
    
    // 先获取推广者列表建立映射
    const { data: promoters } = await client
      .from('promoters')
      .select('id, name, unique_code');
    
    const promoterMap = new Map(promoters?.map((p: { id: number; name: string; unique_code: string }) => [p.id, { name: p.name, code: p.unique_code }]) || []);
    
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
      status: mapStatus(v.deal_status),
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
    
    console.log('更新访客状态:', { id, status, remark });
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少访客ID' });
    }
    
    const client = getSupabaseServiceClient();
    
    // 使用正确的数据库状态值
    const updateData: Record<string, unknown> = {};
    if (status) updateData.deal_status = mapStatusToDb(status);
    
    console.log('更新数据:', updateData);
    
    const { error } = await client
      .from('visitor_records')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error('更新失败:', error);
      return NextResponse.json({ success: false, error: error.message });
    }
    
    console.log('更新成功');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新异常:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '更新失败' 
    });
  }
}
