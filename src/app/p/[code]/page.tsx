'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send, CheckCircle, MapPin, Phone, Copy, Play, ExternalLink } from 'lucide-react';

// 判断是否是可播放的视频URL（mp4等直接可播放的格式）
const isPlayableVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  // 检查是否是视频文件URL（包含视频扩展名或对象存储路径）
  const videoPatterns = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '/videos/'];
  return videoPatterns.some(pattern => lowerUrl.includes(pattern));
};

// 判断是否是抖音链接
const isDouyinUrl = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('douyin.com') || lowerUrl.includes('v.douyin.com');
};

// 从文本中提取URL（更精确的匹配，避免匹配到后面的乱码）
const extractUrl = (text: string): string | null => {
  if (!text) return null;
  
  // 先尝试匹配抖音短链接（最常见的情况）
  const douyinMatch = text.match(/https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/);
  if (douyinMatch) {
    return douyinMatch[0];
  }
  
  // 再尝试匹配其他抖音链接
  const douyinMatch2 = text.match(/https?:\/\/[^\s]*?douyin\.com\/[^\s]*/);
  if (douyinMatch2) {
    // 清理尾部可能的非URL字符
    let url = douyinMatch2[0];
    // 移除末尾的非字母数字字符（除了斜杠）
    url = url.replace(/[^\w\/]$/, '');
    return url;
  }
  
  // 最后匹配通用的 http/https URL
  const urlMatch = text.match(/https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+/);
  return urlMatch ? urlMatch[0] : null;
};

export default function PromotionPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<{
    title: string;
    description: string | null;
    image_url: string | null;
    video_url: string | null;
    store_image_url: string | null;
  } | null>(null);
  const [visitorRecordId, setVisitorRecordId] = useState<number | null>(null);
  const [wechatId, setWechatId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    recordVisit();
  }, [code]);

  const recordVisit = async () => {
    try {
      const res = await fetch('/api/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoterCode: code }),
      });
      const data = await res.json();
      
      if (data.data) {
        setVisitorRecordId(data.data.id);
        // 获取推广内容
        const promoterRes = await fetch(`/api/promoter/${code}`);
        const promoterData = await promoterRes.json();
        if (promoterData.data) {
          setContent(promoterData.data.content);
        }
      } else {
        toast.error('页面加载失败');
      }
    } catch (error) {
      toast.error('页面加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWechat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wechatId.trim()) {
      toast.error('请输入微信号');
      return;
    }

    try {
      const res = await fetch('/api/visitor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: visitorRecordId,
          wechatId: wechatId.trim(),
        }),
      });
      const data = await res.json();
      
      if (data.data) {
        setSubmitted(true);
        toast.success('提交成功！我们会尽快联系您');
      } else {
        toast.error(data.error || '提交失败');
      }
    } catch (error) {
      toast.error('提交失败');
    }
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success('电话号码已复制');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">内容不存在</h2>
          <p className="text-gray-600">请确认链接是否正确</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 标题和描述卡片 */}
        <Card className="mb-6 overflow-hidden shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-500">{content.title}</CardTitle>
          </CardHeader>
          {content.description && (
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{content.description}</p>
            </CardContent>
          )}
        </Card>

        {/* 门店图片 */}
        {content.store_image_url && (
          <Card className="mb-6 overflow-hidden shadow-lg border-2 border-purple-300">
            <CardContent className="p-0">
              <div className="w-full flex justify-center bg-gray-100 p-2">
                <img
                  src={content.store_image_url}
                  alt="门店图片"
                  className="max-w-full max-h-[50vh] object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 导航视频 */}
        {content.video_url && (() => {
          // 从文本中提取URL（处理分享文字）
          const videoUrl = extractUrl(content.video_url) || content.video_url;
          const isPlayable = isPlayableVideoUrl(videoUrl);
          const isDouyin = isDouyinUrl(videoUrl);
          
          return (
            <Card className="mb-6 overflow-hidden shadow-lg border-2 border-green-400">
              <CardContent className="p-0">
                {/* 视频区域 */}
                <div className="p-4 bg-gradient-to-b from-green-50 to-white">
                  {isPlayable ? (
                    // 可播放视频 - 直接播放
                    <video 
                      src={videoUrl} 
                      controls 
                      controlsList="nodownload"
                      className="w-full rounded-lg shadow-md"
                      poster={content.image_url || undefined}
                      playsInline
                      preload="metadata"
                    >
                      <source src={videoUrl} type="video/mp4" />
                      您的浏览器不支持视频播放
                    </video>
                  ) : isDouyin ? (
                    // 抖音链接 - 显示可点击的播放按钮
                    <a 
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center py-8 cursor-pointer"
                    >
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                          <Play className="h-12 w-12 text-white ml-1" />
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 text-center">点击观看抖音视频</p>
                      <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full font-bold shadow-lg hover:from-pink-600 hover:to-red-600 transition-all transform hover:scale-105">
                        点击知道门店地址
                      </span>
                    </a>
                  ) : (
                    // 其他链接 - 显示可点击的播放按钮
                    <a 
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center py-8 cursor-pointer"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg mb-4 hover:scale-110 transition-transform">
                        <Play className="h-10 w-10 text-white" />
                      </div>
                      <p className="text-gray-600 mb-4 text-center">点击下方按钮观看视频</p>
                      <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105">
                        点击知道门店地址
                      </span>
                    </a>
                  )}
                </div>
                {/* 动态标题 - 在视频下方 */}
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 py-4 px-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse opacity-50"></div>
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -left-4 top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                  <h3 className="relative text-white text-2xl font-bold text-center flex items-center justify-center gap-3">
                    <span className="inline-block animate-bounce text-3xl">🎬</span>
                    <span className="relative">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-white animate-[text-shine_3s_ease-in-out_infinite] bg-[length:200%_100%]">
                        假发店地址导航视频
                      </span>
                      <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent animate-pulse"></span>
                    </span>
                    <span className="inline-block animate-bounce text-3xl" style={{ animationDelay: '0.15s' }}>🎬</span>
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* 门店信息 */}
        <Card className="mb-6 shadow-lg bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-lg font-medium text-gray-800">
                有假发需求的朋友，欢迎来到我们线下门店
              </p>
            </div>
            
            <div className="space-y-4">
              {/* 门店地址 */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <MapPin className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">门店地址</p>
                  <p className="text-blue-600 underline">永安玲姐假发</p>
                </div>
                <a 
                  href="https://uri.amap.com/search?keyword=永安玲姐假发" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center justify-center"
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105">
                    点击导航
                  </span>
                </a>
              </div>
              
              {/* 热线电话 */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-800">热线咨询</p>
                    <p className="text-orange-600 font-medium text-lg">13573755584</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyPhone('13573755584')}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </Button>
                  <a href="tel:13573755584">
                    <Button 
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      拨打
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 联系表单 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {submitted ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  提交成功
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  留下联系方式<span className="text-red-500">（到店可领取礼品一份）</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-green-600">提交成功！</p>
                <p className="text-gray-600 mt-2">我们会尽快联系您，到店记得领取礼品哦～</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitWechat} className="space-y-4">
                <div>
                  <Label htmlFor="wechat">微信号或手机号</Label>
                  <Input
                    id="wechat"
                    type="text"
                    placeholder="请输入您的微信号或手机号"
                    value={wechatId}
                    onChange={(e) => setWechatId(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Send className="h-4 w-4 mr-2" />
                  提交
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  您的信息仅用于产品咨询，我们会严格保密
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* 宣传图片 - 放在最下边 */}
        {content.image_url && (
          <Card className="mt-6 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="w-full flex justify-center bg-gray-100 p-2">
                <img
                  src={content.image_url}
                  alt={content.title}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
