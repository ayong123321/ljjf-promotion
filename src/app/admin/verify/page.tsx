'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Scan, User, Phone, Clock, DollarSign, Loader2 } from 'lucide-react';

// 播放滴声
const playBeep = () => {
  try {
    // 创建音频上下文
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // 创建振荡器
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 设置音调频率（800Hz 比较清脆）
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    // 设置音量
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // 播放
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('播放音频失败:', error);
  }
};

export default function AdminVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [visitorInfo, setVisitorInfo] = useState<Record<string, unknown> | null>(null);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    promoterName?: string;
    cashbackInfo?: string;
  } | null>(null);
  const [showPromoterName, setShowPromoterName] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 检查是否已认证
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_auth');
    if (isAuth === 'true') {
      setAuthenticated(true);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 验证密码
  const handleLogin = () => {
    if (password === 'ljjf2024') {
      sessionStorage.setItem('admin_auth', 'true');
      setAuthenticated(true);
      toast.success('登录成功');
    } else {
      toast.error('密码错误');
    }
  };

  // 查询核销码
  const handleSearch = async () => {
    if (!code.trim()) {
      toast.error('请输入核销码');
      return;
    }

    setLoading(true);
    setVisitorInfo(null);
    setVerifyResult(null);
    setShowPromoterName(false);

    try {
      const res = await fetch(`/api/admin/verify?code=${code.trim().toUpperCase()}`);
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        setVisitorInfo(data.data);
        
        // 如果已核销，显示提示
        if (data.data.is_verified) {
          setVerifyResult({
            success: false,
            message: '该核销码已被核销',
            promoterName: (data.data.promoters as Record<string, unknown>)?.name as string
          });
        }
      }
    } catch (error) {
      console.error('查询失败:', error);
      toast.error('查询失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 确认核销
  const handleVerify = async () => {
    if (!visitorInfo) return;

    setVerifying(true);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();

      if (data.error && !data.data) {
        setVerifyResult({
          success: false,
          message: data.error
        });
        toast.error(data.error);
      } else {
        // 播放滴声
        playBeep();
        
        // 显示核销成功
        setVerifyResult({
          success: true,
          message: '核销成功！',
          cashbackInfo: data.cashbackInfo?.rule
        });
        
        toast.success('核销成功！');
        
        // 5秒后显示推广者名字
        timerRef.current = setTimeout(() => {
          const promoter = visitorInfo.promoters as Record<string, unknown>;
          setShowPromoterName(true);
          setVerifyResult(prev => prev ? {
            ...prev,
            promoterName: promoter?.name as string
          } : null);
        }, 5000);
      }
    } catch (error) {
      console.error('核销失败:', error);
      toast.error('核销失败，请重试');
    } finally {
      setVerifying(false);
    }
  };

  // 重置
  const handleReset = () => {
    setCode('');
    setVisitorInfo(null);
    setVerifyResult(null);
    setShowPromoterName(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // 未认证时显示登录界面
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-pink-600">管理员登录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="请输入管理员密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button 
              onClick={handleLogin}
              className="w-full bg-pink-500 hover:bg-pink-600"
            >
              登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-center text-pink-600 mb-6 flex items-center justify-center gap-2">
          <Scan className="h-6 w-6" />
          门店核销
        </h1>

        {/* 输入框 */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="请输入或扫描核销码"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-lg font-mono"
              />
              <Button 
                onClick={handleSearch}
                disabled={loading || !code.trim()}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '查询'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 访客信息 */}
        {visitorInfo && !verifyResult?.success && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4 text-pink-500" />
                  <span>微信/手机：</span>
                  <span className="font-medium">{String(visitorInfo.wechat_id || '未填写')}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-orange-500" />
                  <span>推广者：</span>
                  <span className="font-medium">
                    {String((visitorInfo.promoters as Record<string, unknown>)?.name || '未知')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>留资时间：</span>
                  <span className="font-medium">
                    {visitorInfo.created_at 
                      ? new Date(visitorInfo.created_at as string).toLocaleString('zh-CN')
                      : '-'}
                  </span>
                </div>
              </div>

              {/* 核销按钮 */}
              {!visitorInfo.is_verified && (
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        核销中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        确认核销
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                  >
                    取消
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 核销结果 */}
        {verifyResult && (
          <Card className={`mb-4 border-2 ${verifyResult.success ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                {verifyResult.success ? (
                  <>
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4 animate-bounce" />
                    <p className="text-2xl font-bold text-green-600 mb-2">{verifyResult.message}</p>
                    
                    {verifyResult.cashbackInfo && (
                      <div className="mt-4 p-3 bg-white rounded-lg inline-block">
                        <DollarSign className="h-5 w-5 text-pink-500 inline mr-1" />
                        <span className="text-pink-600 font-medium">{verifyResult.cashbackInfo}</span>
                      </div>
                    )}
                    
                    {showPromoterName && verifyResult.promoterName && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-pink-100 to-orange-100 rounded-lg">
                        <p className="text-lg text-gray-700">
                          推广者：<span className="font-bold text-pink-600">{verifyResult.promoterName}</span>
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-xl font-medium text-red-600">{verifyResult.message}</p>
                    
                    {verifyResult.promoterName && (
                      <p className="mt-2 text-gray-600">
                        推广者：{verifyResult.promoterName}
                      </p>
                    )}
                  </>
                )}
              </div>
              
              <div className="mt-6">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  继续核销
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 返回管理后台 */}
        <Button
          variant="ghost"
          className="w-full text-gray-500"
          onClick={() => router.push('/admin')}
        >
          返回管理后台
        </Button>
      </div>
    </div>
  );
}
