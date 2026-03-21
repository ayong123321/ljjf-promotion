'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send, CheckCircle, MapPin, Phone, Copy, Play, X } from 'lucide-react';

// 检测是否在微信环境
const isWechat = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
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
        {content.video_url && (
          <Card className="mb-6 overflow-hidden shadow-lg border-2 border-green-400">
            <CardContent className="p-0">
              <div className="p-4 bg-gradient-to-b from-green-50 to-white">
                {/* 点击按钮 */}
                <button 
                  onClick={() => {
                    if (isWechat()) {
                      setShowGuide(true);
                    } else {
                      window.location.href = content.video_url!.trim();
                    }
                  }}
                  className="w-full flex flex-col items-center justify-center py-8 cursor-pointer"
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <Play className="h-12 w-12 text-white ml-1" />
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-center font-medium">点击观看抖音视频</p>
                  <span className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full font-bold text-lg shadow-lg hover:from-pink-600 hover:to-red-600 transition-all transform hover:scale-105">
                    点击知道门店地址
                  </span>
                </button>
              </div>
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
        )}

        {/* 微信引导弹窗 */}
        {showGuide && (
          <div 
            className="fixed inset-0 z-50 flex items-start justify-end"
            onClick={() => setShowGuide(false)}
          >
            {/* 半透明背景 */}
            <div className="absolute inset-0 bg-black/60"></div>
            
            {/* 引导内容 */}
            <div className="relative mt-4 mr-4 max-w-xs animate-pulse">
              {/* 橙色弹窗 */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 shadow-2xl">
                <div className="text-white text-center">
                  {/* 箭头指向右上角 */}
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

        {/* 门店信息 */}
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
                  <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105">
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

        {/* 宣传图片 */}
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
