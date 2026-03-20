import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 更新访客状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, wechatStatus, dealStatus } = body;

    if (!recordId) {
      return NextResponse.json({ error: '访客记录ID不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 构建更新对象
    const updateData: Record<string, string> = {};
    if (wechatStatus !== undefined) {
      updateData.wechat_status = wechatStatus;
    }
    if (dealStatus !== undefined) {
      updateData.deal_status = dealStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '没有要更新的字段' }, { status: 400 });
    }

    const { data, error } = await client
      .from('visitor_records')
      .update(updateData)
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新访客状态失败:', error);
    return NextResponse.json({ error: '更新访客状态失败' }, { status: 500 });
  }
}
