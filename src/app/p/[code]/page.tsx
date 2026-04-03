'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send, CheckCircle, MapPin, Phone, Copy, Play, Download, UserPlus, QrCode, ExternalLink, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

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
  const [verifyCode, setVerifyCode] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  // 成为推广者相关状态
  const [showPromoterForm, setShowPromoterForm] = useState(false);
  const [promoterName, setPromoterName] = useState('');
  const [promoterPhone, setPromoterPhone] = useState('');
  const [registering, setRegistering] = useState(false);
  const [promoterInfo, setPromoterInfo] = useState<{
    unique_code: string;
    name: string;
  } | null>(null);
  const [promoterQrCodeUrl, setPromoterQrCodeUrl] = useState<string | null>(null);

  // 当 verifyCode 变化时生成二维码（使用 useEffect 确保 DOM 已更新）
  useEffect(() => {
    if (verifyCode) {
      generateQRCode(verifyCode);
    }
  }, [verifyCode]);

  // 当推广者信息变化时生成推广二维码
  useEffect(() => {
    if (promoterInfo?.unique_code) {
      generatePromoterQRCode(promoterInfo.unique_code);
    }
  }, [promoterInfo]);

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
      }
      
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

    if (submitting) return;

    setSubmitting(true);
    try {
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
        setVisitorRecordId(data.data.id);
        
        if (data.data.verify_code) {
          setVerifyCode(data.data.verify_code);
        }
        
        // 自动填充手机号（如果输入的是手机号）
        if (/^\d{11}$/.test(wechatId.trim())) {
          setPromoterPhone(wechatId.trim());
        }
        
        toast.success('提交成功！我们会尽快联系您');
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

  // 注册成为推广者
  const handleRegisterPromoter = async () => {
    if (!promoterName.trim()) {
      toast.error('请输入您的姓名');
      return;
    }
    if (!promoterPhone.trim()) {
      toast.error('请输入您的手机号');
      return;
    }
    if (!/^\d{11}$/.test(promoterPhone.trim())) {
      toast.error('请输入正确的11位手机号');
      return;
    }

    setRegistering(true);
    try {
      const res = await fetch('/api/promoter/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: promoterName.trim(),
          phone: promoterPhone.trim(),
          wechat: wechatId.trim(),
          referrerCode: code
        }),
      });
      const data = await res.json();
      
      if (data.data) {
        setPromoterInfo(data.data);
        setShowPromoterForm(false);
        
        if (data.isNew) {
          toast.success('恭喜！您已成为推广者！');
        } else {
          toast.info('您已经是推广者了');
        }
      } else {
        toast.error(data.error || '注册失败，请重试');
      }
    } catch (error) {
      console.error('注册失败:', error);
      toast.error('注册失败，请重试');
    } finally {
      setRegistering(false);
    }
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success('电话号码已复制');
  };

  // 复制链接
  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('链接已复制');
  };

  // 生成核销二维码
  const generateQRCode = async (code: string) => {
    try {
      const verifyUrl = `${window.location.origin}/verify/${code}`;
      const dataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error('生成二维码失败:', error);
    }
  };

  // 生成推广二维码
  const generatePromoterQRCode = async (promoterCode: string) => {
    try {
      const promoterUrl = `${window.location.origin}/p/${promoterCode}`;
      const dataUrl = await QRCode.toDataURL(promoterUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setPromoterQrCodeUrl(dataUrl);
    } catch (error) {
      console.error('生成推广二维码失败:', error);
    }
  };

  // 下载二维码图片
  const downloadQRCode = () => {
    if (!qrCodeUrl || !verifyCode) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `核销码-${verifyCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('二维码已保存');
  };

  // 下载推广二维码
  const downloadPromoterQRCode = () => {
    if (!promoterQrCodeUrl || !promoterInfo) return;
    
    const link = document.createElement('a');
    link.href = promoterQrCodeUrl;
    link.download = `推广码-${promoterInfo.unique_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('推广二维码已保存');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
        <div className="text-lg text-pink-600">加载中...</div>
      </div>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* ========== 第一个板块：欢迎语 ========== */}
        <Card className="mb-6 overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 p-1">
            <div className="bg-white rounded-lg p-6">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 bg-clip-text text-transparent">
                  你好呀～欢迎来到玲姐假发
                </h1>
                
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-pink-300"></div>
                  <span className="text-pink-400">✨</span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-300"></div>
                </div>
                
                <p className="text-xl font-semibold text-rose-600">
                  我们是长清14年假发老店
                </p>
                
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
                
                <p className="text-lg text-gray-700 pt-2">
                  想问下你是想<span className="text-pink-600 font-semibold">自己戴</span>，还是给<span className="text-orange-600 font-semibold">家人看</span>呀？
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* ========== 图片展示 ========== */}
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

        {/* ========== 视频展示 ========== */}
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
                    </div>
                  );
                }
                
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

        {/* ========== 门店信息 ========== */}
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
                  <Button variant="outline" size="sm" onClick={() => copyPhone('13573755584')}>
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </Button>
                  <a href="tel:13573755584">
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">拨打</Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========== 联系表单 ========== */}
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
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-medium text-green-600">提交成功！</p>
                <p className="text-gray-600 mt-1 mb-4">我们会尽快联系您，到店记得领取礼品哦～</p>
                
                {/* 核销二维码 */}
                {verifyCode && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl border-2 border-pink-200">
                    <p className="text-sm text-gray-600 mb-3">到店出示以下二维码，可享受专属优惠</p>
                    
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-white rounded-lg shadow-md">
                        {qrCodeUrl ? (
                          <img src={qrCodeUrl} alt="核销二维码" className="w-[200px] h-[200px]" />
                        ) : (
                          <div className="w-[200px] h-[200px] flex items-center justify-center">
                            <div className="animate-spin text-pink-500">⏳</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      核销码：<span className="font-mono font-bold text-pink-600 text-lg">{verifyCode}</span>
                    </p>
                    
                    {qrCodeUrl && (
                      <Button onClick={downloadQRCode} variant="outline" className="w-full border-pink-300 text-pink-600 hover:bg-pink-50">
                        <Download className="h-4 w-4 mr-2" />
                        保存二维码到手机
                      </Button>
                    )}
                  </div>
                )}

                {/* 成为推广者区域 */}
                {!promoterInfo ? (
                  <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    {!showPromoterForm ? (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <UserPlus className="h-6 w-6 text-purple-500" />
                          <span className="font-bold text-purple-700">想赚钱吗？</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          成为推广者，分享二维码给朋友，他们到店消费您就有返现！
                        </p>
                        <Button 
                          onClick={() => setShowPromoterForm(true)}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          立即成为推广者
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <UserPlus className="h-6 w-6 text-purple-500" />
                          <span className="font-bold text-purple-700">注册成为推广者</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-gray-700 text-sm">您的姓名 *</Label>
                            <Input
                              value={promoterName}
                              onChange={(e) => setPromoterName(e.target.value)}
                              placeholder="请输入您的姓名"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 text-sm">手机号 *</Label>
                            <Input
                              value={promoterPhone}
                              onChange={(e) => setPromoterPhone(e.target.value)}
                              placeholder="请输入您的手机号"
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowPromoterForm(false)}
                              className="flex-1"
                            >
                              取消
                            </Button>
                            <Button 
                              onClick={handleRegisterPromoter}
                              disabled={registering}
                              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                            >
                              {registering ? '注册中...' : '确认注册'}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* 推广者专属信息 */
                  <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span className="font-bold text-purple-700">恭喜您成为推广者！</span>
                    </div>
                    
                    {/* 推广二维码 */}
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-white rounded-lg shadow-md">
                        {promoterQrCodeUrl ? (
                          <img src={promoterQrCodeUrl} alt="推广二维码" className="w-[180px] h-[180px]" />
                        ) : (
                          <div className="w-[180px] h-[180px] flex items-center justify-center">
                            <div className="animate-spin text-purple-500">⏳</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 推广码 */}
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-500">您的推广码</p>
                      <p className="font-mono font-bold text-purple-600 text-2xl">{promoterInfo.unique_code}</p>
                    </div>
                    
                    {/* 链接信息 */}
                    <div className="space-y-3 mb-4">
                      <div className="p-3 bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-pink-500" />
                            <span className="text-sm text-gray-600">落地页链接</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyLink(`${baseUrl}/p/${promoterInfo.unique_code}`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 break-all">
                          {baseUrl}/p/{promoterInfo.unique_code}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-purple-500" />
                            <span className="text-sm text-gray-600">推广员后台</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyLink(`${baseUrl}/promoter/${promoterInfo.unique_code}`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 break-all">
                          {baseUrl}/promoter/{promoterInfo.unique_code}
                        </p>
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="space-y-2">
                      <Button 
                        onClick={downloadPromoterQRCode}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        保存推广二维码
                      </Button>
                      <a href={`${baseUrl}/promoter/${promoterInfo.unique_code}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          查看我的推广后台
                        </Button>
                      </a>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      分享二维码给朋友，他们扫码留资到店消费，您就有返现奖励！
                    </p>
                  </div>
                )}
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
