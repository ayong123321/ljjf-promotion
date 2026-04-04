'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, QrCode, ExternalLink, Download, Copy, Share2, UserPlus } from 'lucide-react';
import QRCode from 'qrcode';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [wechat, setWechat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [promoterInfo, setPromoterInfo] = useState<{
    unique_code: string;
    name: string;
  } | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (promoterInfo?.unique_code && baseUrl) {
      generateQRCode(promoterInfo.unique_code);
    }
  }, [promoterInfo, baseUrl]);

  // 生成推广二维码
  const generateQRCode = async (promoterCode: string) => {
    try {
      const promoterUrl = `${baseUrl}/p/${promoterCode}`;
      const dataUrl = await QRCode.toDataURL(promoterUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error('生成二维码失败:', error);
    }
  };

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wechat.trim()) {
      toast.error('请输入您的微信昵称');
      return;
    }
    if (!phone.trim()) {
      toast.error('请输入您的手机号');
      return;
    }
    if (!/^\d{11}$/.test(phone.trim())) {
      toast.error('请输入正确的11位手机号');
      return;
    }

    setSubmitting(true);
    try {
      console.log('[登录] 开始登录:', { phone: phone.trim(), wechat: wechat.trim() });

      const res = await fetch('/api/promoter/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          wechat: wechat.trim(),
        }),
      });

      console.log('[登录] 响应状态:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[登录] HTTP错误:', res.status, errorText);
        toast.error(`登录失败: ${res.status} - ${errorText}`);
        return;
      }

      const data = await res.json();
      console.log('[登录] 响应数据:', data);

      if (data.data) {
        setPromoterInfo(data.data);
        toast.success('登录成功！');
      } else {
        toast.error(data.error || '登录失败，请重试');
      }
    } catch (error) {
      console.error('[登录] 异常:', error);
      toast.error('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 复制链接
  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('链接已复制');
  };

  // 下载二维码
  const downloadQRCode = () => {
    if (!qrCodeUrl || !promoterInfo) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `推广码-${promoterInfo.unique_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('二维码已保存');
  };

  // 已登录成功，显示推广者信息
  if (promoterInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          
          {/* 成功提示 */}
          <Card className="shadow-xl border-2 border-green-200 mb-6">
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold text-green-600 mb-2">登录成功！</h1>
              <p className="text-gray-600">欢迎回来，推广者</p>
            </CardContent>
          </Card>

          {/* 推广二维码 */}
          <Card className="shadow-xl border-2 border-purple-200 mb-6">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                  <QrCode className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-700">您的专属推广二维码</span>
                </div>
              </div>
              
              {/* 二维码图片 */}
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white rounded-xl shadow-lg border-2 border-purple-100">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="推广二维码" className="w-[220px] h-[220px]" />
                  ) : (
                    <div className="w-[220px] h-[220px] flex items-center justify-center">
                      <div className="animate-spin text-purple-500 text-2xl">⏳</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 推广码 */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">您的推广码</p>
                <p className="font-mono font-bold text-purple-600 text-3xl">{promoterInfo.unique_code}</p>
              </div>
              
              {/* 功能入口 - 按照图片样式 */}
              <div className="flex items-center justify-center gap-6 py-4 border-t border-gray-100">
                <button 
                  onClick={downloadQRCode}
                  className="flex flex-col items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <QrCode className="h-6 w-6" />
                  <span className="text-sm font-medium">二维码</span>
                </button>
                
                <button 
                  onClick={() => copyLink(`${baseUrl}/p/${promoterInfo.unique_code}`)}
                  className="flex flex-col items-center gap-1 text-green-500 hover:text-green-600 transition-colors"
                >
                  <Copy className="h-6 w-6" />
                  <span className="text-sm font-medium">复制链接</span>
                </button>
                
                <a 
                  href={`${baseUrl}/promoter/${promoterInfo.unique_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 text-green-500 hover:text-green-600 transition-colors"
                >
                  <ExternalLink className="h-6 w-6" />
                  <span className="text-sm font-medium">推广者后台</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* 推广链接详情 */}
          <Card className="shadow-lg border-2 border-pink-200 mb-6">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-gray-800 text-center">您的推广链接</h3>
              
              {/* 落地页链接 */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-pink-500" />
                    <span className="text-sm font-medium text-gray-700">落地页</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyLink(`${baseUrl}/p/${promoterInfo.unique_code}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 break-all">
                  {baseUrl}/p/{promoterInfo.unique_code}
                </p>
                <p className="text-xs text-gray-400 mt-1">分享给朋友的专属页面</p>
              </div>
              
              {/* 推广后台链接 */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">推广后台</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyLink(`${baseUrl}/promoter/${promoterInfo.unique_code}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 break-all">
                  {baseUrl}/promoter/{promoterInfo.unique_code}
                </p>
                <p className="text-xs text-gray-400 mt-1">查看您的推广数据和返现</p>
              </div>
              
              {/* 进入后台按钮 */}
              <a href={`${baseUrl}/promoter/${promoterInfo.unique_code}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full" size="lg">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  进入我的推广后台
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* 使用说明 */}
          <Card className="shadow-lg border border-gray-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">如何推广赚钱？</h3>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <p className="text-sm text-gray-700">保存上面的二维码图片到手机</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-pink-500 text-white text-sm flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <p className="text-sm text-gray-700">发朋友圈或发给朋友，让他们扫码</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <p className="text-sm text-gray-700">朋友到店核销后，您就有返现奖励</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center flex-shrink-0">4</div>
                  <div>
                    <p className="text-sm text-gray-700">随时进入推广后台查看进度</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 登录表单
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-4">
            <LogIn className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            推广者登录
          </h1>
          <p className="text-gray-600 mt-2">登录后查看您的专属推广信息</p>
        </div>

        {/* 登录表单 */}
        <Card className="shadow-xl border-2 border-purple-200">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="wechat" className="text-gray-700 font-medium">微信昵称</Label>
                <Input
                  id="wechat"
                  type="text"
                  placeholder="请输入您的微信昵称"
                  value={wechat}
                  onChange={(e) => setWechat(e.target.value)}
                  className="mt-2 border-purple-200 focus:border-purple-400"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-gray-700 font-medium">手机号</Label>
                <Input
                  id="phone"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="请输入您的手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 border-purple-200 focus:border-purple-400"
                  maxLength={11}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
                size="lg"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    登录中...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    立即登录
                  </>
                )}
              </Button>
            </form>
            
            {/* 注册入口 */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-3">还没有账号？</p>
              <Button 
                variant="outline"
                onClick={() => router.push('/join')}
                className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                size="lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                立即注册
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
