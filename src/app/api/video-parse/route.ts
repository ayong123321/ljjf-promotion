import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
});

// 解析并下载视频（支持部分平台）
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: '请提供视频链接' }, { status: 400 });
    }

    console.log('=== 开始解析视频链接 ===');
    console.log('原始链接:', url);

    // 提取URL（处理分享文字）
    let videoUrl = url;
    const urlMatch = url.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      videoUrl = urlMatch[0];
      // 移除末尾的标点符号
      videoUrl = videoUrl.replace(/[，。！？、；：""''）】》]+$/, '');
    }

    console.log('提取的URL:', videoUrl);

    // 检查是否是直接的mp4视频链接
    if (videoUrl.toLowerCase().includes('.mp4') || videoUrl.toLowerCase().includes('.mov')) {
      // 尝试下载视频
      try {
        console.log('检测到直接视频链接，开始下载...');
        const videoResponse = await fetch(videoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
        });
        
        if (videoResponse.ok) {
          const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
          console.log('视频下载完成，大小:', videoBuffer.length);
          
          if (videoBuffer.length > 1000) { // 确保下载了有效内容
            // 上传到对象存储
            const fileName = `videos/parsed_${Date.now()}.mp4`;
            const videoKey = await storage.uploadFile({
              fileContent: videoBuffer,
              fileName: fileName,
              contentType: 'video/mp4',
            });
            
            const playableUrl = await storage.generatePresignedUrl({
              key: videoKey,
              expireTime: 31536000,
            });
            
            console.log('视频上传成功');
            
            return NextResponse.json({
              success: true,
              playableUrl,
              message: '视频已成功解析并上传'
            });
          }
        }
      } catch (e) {
        console.error('下载视频失败:', e);
      }
    }

    // 抖音/快手等平台暂不支持直接解析
    if (videoUrl.includes('douyin.com') || videoUrl.includes('kuaishou.com') || videoUrl.includes('tiktok.com')) {
      return NextResponse.json({
        success: false,
        error: '抖音/快手视频暂不支持直接解析',
        instructions: [
          '请按以下步骤操作：',
          '1. 打开抖音App，找到要分享的视频',
          '2. 点击分享按钮，选择"保存本地"下载视频',
          '3. 在管理后台使用"上传视频文件"功能上传下载的视频'
        ]
      });
    }

    // 其他链接
    return NextResponse.json({
      success: false,
      error: '暂不支持该链接格式',
      instructions: [
        '建议：',
        '1. 下载视频到本地',
        '2. 使用"上传视频文件"功能上传'
      ]
    });

  } catch (error) {
    console.error('解析视频链接失败:', error);
    return NextResponse.json({ error: '解析视频链接失败' }, { status: 500 });
  }
}
