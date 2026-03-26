import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    // 在服务端获取正式域名
    const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 
                   process.env.NEXT_PUBLIC_COZE_PROJECT_DOMAIN_DEFAULT ||
                   'https://439a0333-2b4f-48ab-a2a5-c6e2506a2e5f.dev.coze.site';
    
    const promotionUrl = `${domain}/p/${code}`;
    
    console.log('生成二维码URL:', promotionUrl);
    
    // 生成二维码图片
    const qrCodeDataUrl = await QRCode.toDataURL(promotionUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // 将 Data URL 转换为 Buffer
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 使用时间戳参数防止缓存
    const timestamp = Date.now();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        // 禁用缓存，确保每次都生成新的二维码
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Timestamp': timestamp.toString(),
      },
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
    return NextResponse.json({ error: '生成二维码失败' }, { status: 500 });
  }
}
