import { NextResponse } from 'next/server';

// 返回 Supabase 公开配置（用于前端直接上传）
export async function GET() {
  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Supabase 配置缺失' }, { status: 500 });
  }

  return NextResponse.json({
    url,
    anonKey,
  });
}
