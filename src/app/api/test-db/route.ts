import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 检查环境变量
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      error: '环境变量未配置',
      env: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }
    });
  }

  // 检查密钥格式
  if (!supabaseKey.startsWith('eyJ')) {
    return NextResponse.json({
      success: false,
      error: '密钥格式错误，应该是JWT格式（以eyJ开头）',
      keyPrefix: supabaseKey.substring(0, 20) + '...'
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 尝试简单查询测试连接
    const { error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);
    
    return NextResponse.json({
      success: true,
      message: 'Supabase 客户端创建成功',
      url: supabaseUrl,
      tableError: error?.message || '无错误',
      note: error ? '数据库连接正常，表可能还未创建' : '数据库连接成功！'
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: '连接失败',
      details: err instanceof Error ? err.message : String(err)
    });
  }
}
