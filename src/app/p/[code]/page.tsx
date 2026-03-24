'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send, CheckCircle, MapPin, Phone, Copy, Play } from 'lucide-react';

// 检测是否在微信环境
const isWechat = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
};

// 从抖音分享文本中提取链接
const extractDouyinUrl = (text: string): string => {
  if (!text) return '';
  
  // 尝试匹配 https://v.douyin.com/xxx 格式的链接
  const douyinMatch = text.match(/https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/);
  if (douyinMatch) {
    return douyinMatch[0];
  }
  
  // 尝试匹配其他抖音链接格式
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    return urlMatch[0];
  }
  
  // 如果没有找到链接，返回原文
  return text.trim();
};

// 判断是否是抖音链接
const isDouyinUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('douyin.com') || url.includes('v.douyin.com');
};

export default function PromotionPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<{
    title: string;
    description: string | null;
    images: Array<{ title: string; description: string; url: string }>;
    videos: Array<{ title: string; description: string; url: string }>;
  } | null>(null);
  const [visitorRecordId, setVisitorRecordId] = useState<number | null>(null);
  const [wechatId, setWechatId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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
      } else {
        console.error('创建访客记录失败:', data.error);
        // 不阻止页面加载，允许用户继续操作
      }
      
      // 无论是否创建访客记录，都加载内容
      const promoterRes = await fetch(`/api/promoter/${code}`);
      const promoterData = await promoterRes.json();
      if (promoterData.data) {
        setContent(promoterData.data.content);
      } else {
        console.error('加载内容失败:', promoterData.error);
      }
    } catch (error) {
      console.error('页面加载失败:', error);
      toast.error('页面加载遇到问题，但您仍可提交联系方式');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWechat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wechatId.trim()) {
      toast.error('请输入微信号或手机号');
      return;
    }

    if (submitting) return; // 防止重复提交

    setSubmitting(true);
    try {
      // 统一使用 PUT 请求，API 会根据情况更新或创建记录
      const res = await fetch('/api/visitor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: visitorRecordId,
          promoterCode: code,
          wechatId: wechatId.trim(),
        }),
      });
      const data = await res.json();
      
      if (data.data) {
        setSubmitted(true);
        toast.success('提交成功！我们会尽快联系您');
        setVisitorRecordId(data.data.id);
      } else {
        toast.error(data.error || '提交失败，请重试');
      }
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success('电话号码已复制');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
        <div className="text-lg text-pink-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* ========== 第一个板块：欢迎语 ========== */}
        <Card className="mb-6 overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 p-1">
            <div className="bg-white rounded-lg p-6">
              <div className="text-center space-y-4">
                {/* 主标题 */}
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 bg-clip-text text-transparent">
                  你好呀～欢迎来到玲姐假发
                </h1>
                
                {/* 分隔线 */}
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-pink-300"></div>
                  <span className="text-pink-400">✨</span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-300"></div>
                </div>
                
                {/* 副标题 */}
                <p className="text-xl font-semibold text-rose-600">
                  我们是长清14年假发老店
                </p>
                
                {/* 服务项目 */}
                <div className="flex flex-wrap justify-center gap-2 py-2">
                  <span className="px-4 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                    专业遮白发
                  </span>
                  <span className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                    增发
                  </span>
                  <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    时尚发型
                  </span>
                </div>
                
                {/* 询问语 */}
                <p className="text-lg text-gray-700 pt-2">
                  想问下你是想<span className="text-pink-600 font-semibold">自己戴</span>，还是给<span className="text-orange-600 font-semibold">家人看</span>呀？
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* ========== 第二个板块：图片展示 ========== */}
        {content?.images && content.images.length > 0 && (
          <Card className="mb-6 overflow-hidden shadow-lg border-2 border-pink-200">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-3 px-4">
              <h2 className="text-white text-xl font-bold text-center flex items-center justify-center gap-2">
                <span>📸</span>
                <span>精选图片</span>
              </h2>
            </div>
            <CardContent className="p-0">
              {content.images.map((img, index) => (
                <div key={index} className="border-b last:border-b-0">
                  <div className="w-full flex justify-center bg-gray-50 p-3">
                    <img
                      src={img.url}
                      alt={img.title || `图片 ${index + 1}`}
                      className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
                    />
                  </div>
                  {img.title && (
                    <div className="p-3 bg-white text-center">
                      <p className="font-medium text-gray-700">{img.title}</p>
                      {img.description && (
                        <p className="text-sm text-gray-500 mt-1">{img.description}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ========== 第三个板块：视频展示 ========== */}
        {content?.videos && content.videos.length > 0 && (
          <Card className="mb-6 overflow-hidden shadow-lg border-2 border-green-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 py-3 px-4">
              <h2 className="text-white text-xl font-bold text-center flex items-center justify-center gap-2">
                <span>🎬</span>
                <span>假发店地址导航视频</span>
              </h2>
            </div>
            <CardContent className="p-0">
              {content.videos.map((video, index) => {
                const isDouyin = isDouyinUrl(video.url);
                
                // 本地上传的视频 - 直接播放
                if (!isDouyin) {
                  return (
                    <div key={index} className="p-4 bg-gradient-to-b from-green-50 to-white border-b last:border-b-0">
                      <div className="w-full rounded-lg overflow-hidden bg-black">
                        <video 
                          src={video.url} 
                          controls 
                          className="w-full max-h-[60vh] object-contain"
                          playsInline
                          webkit-playsinline="true"
                        >
                          您的浏览器不支持视频播放
                        </video>
                      </div>
                      {video.title && (
                        <p className="text-gray-700 font-medium mt-3 text-center">{video.title}</p>
                      )}
                      {video.description && (
                        <p className="text-gray-500 text-sm mt-1 text-center">{video.description}</p>
                      )}
                    </div>
                  );
                }
                
                // 抖音链接 - 显示跳转按钮
                const videoUrl = extractDouyinUrl(video.url);
                return (
                  <div key={index} className="p-4 bg-gradient-to-b from-green-50 to-white border-b last:border-b-0">
                    <button 
                      onClick={() => {
                        if (isWechat()) {
                          setShowGuide(true);
                        } else if (videoUrl) {
                          window.open(videoUrl, '_blank');
                        }
                      }}
                      className="w-full flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-green-50/50 rounded-lg transition-colors"
                    >
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                        <div className={`relative ${index === 0 ? 'w-24 h-24' : 'w-16 h-16'} bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-xl`}>
                          <Play className={`${index === 0 ? 'h-12 w-12' : 'h-8 w-8'} text-white ml-1`} />
                        </div>
                      </div>
                      
                      {index === 0 && (
                        <p className="text-gray-600 mb-3 text-center font-medium">点击观看抖音视频</p>
                      )}
                      
                      <span className={`inline-flex items-center gap-2 ${index === 0 ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base'} bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full font-bold shadow-lg hover:from-pink-600 hover:to-red-600 transition-all transform hover:scale-105`}>
                        点击知道门店地址
                      </span>
                      
                      {video.title && index > 0 && (
                        <p className="text-gray-700 font-medium mt-3">{video.title}</p>
                      )}
                      {video.description && index > 0 && (
                        <p className="text-gray-500 text-sm mt-1">{video.description}</p>
                      )}
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* 微信引导弹窗 */}
        {showGuide && (
          <div 
            className="fixed inset-0 z-50 flex items-start justify-end"
            onClick={() => setShowGuide(false)}
          >
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative mt-4 mr-4 max-w-xs animate-pulse">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 shadow-2xl">
                <div className="text-white text-center">
                  <div className="absolute -top-2 right-8 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-orange-500"></div>
                  <p className="text-xl font-bold mb-3">👆 点击右上角</p>
                  <div className="bg-white/20 rounded-xl p-4 mb-3">
                    <p className="text-lg font-medium">点击「...」</p>
                    <p className="text-base mt-2">选择「在浏览器打开」</p>
                  </div>
                  <p className="text-sm opacity-90">即可跳转到抖音观看视频</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== 第四个板块：门店信息 ========== */}
        <Card className="mb-6 shadow-lg bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-lg font-medium text-gray-800">
                有假发需求的朋友，欢迎来到我们线下门店
              </p>
            </div>
            
            <div className="space-y-4">
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
                  <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold shadow-lg">
                    点击导航
                  </span>
                </a>
              </div>
              
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

        {/* ========== 第五个板块：联系表单 ========== */}
        <Card className="shadow-lg border-2 border-pink-200">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-3 px-4">
            <h2 className="text-white text-xl font-bold text-center flex items-center justify-center gap-2">
              {submitted ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  提交成功
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  留下联系方式
                  <span className="text-yellow-200 text-sm">（到店可领取礼品一份）</span>
                </>
              )}
            </h2>
          </div>
          <CardContent className="p-6">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-green-600">提交成功！</p>
                <p className="text-gray-600 mt-2">我们会尽快联系您，到店记得领取礼品哦～</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitWechat} className="space-y-4">
                <div>
                  <Label htmlFor="wechat" className="text-gray-700 font-medium">微信号或手机号</Label>
                  <Input
                    id="wechat"
                    type="text"
                    placeholder="请输入您的微信号或手机号"
                    value={wechatId}
                    onChange={(e) => setWechatId(e.target.value)}
                    className="mt-2 border-pink-200 focus:border-pink-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting || loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed" 
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      提交
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  您的信息仅用于产品咨询，我们会严格保密
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
