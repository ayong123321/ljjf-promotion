'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, LogIn } from 'lucide-react';

export default function Join100Page() {
  const router = useRouter();
  const [wechatId, setWechatId] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 注册成为推广者（100版本）
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wechatId.trim()) {
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
      const res = await fetch('/api/promoter/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wechatId.trim(),
          phone: phone.trim(),
          wechat: wechatId.trim(),
          cashbackRuleType: 'type_100' // 指定为100版本
        }),
      });
      const data = await res.json();

      if (data.data) {
        if (data.isNew) {
          toast.success('注册成功！请登录查看您的推广信息');
        } else {
          toast.info('您已经是推广者了，请直接登录');
        }
        router.push('/login');
      } else {
        toast.error(data.error || '注册失败，请重试');
      }
    } catch (error) {
      console.error('注册失败:', error);
      toast.error('注册失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">

        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg mb-4">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            成为推广者（固定返现版）
          </h1>
          <p className="text-gray-600 mt-2">每次核销固定返现100元</p>
        </div>

        {/* 注册表单 */}
        <Card className="shadow-xl border-2 border-blue-200">
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <Label htmlFor="wechat" className="text-gray-700 font-medium">微信昵称</Label>
                <Input
                  id="wechat"
                  type="text"
                  placeholder="请输入您的微信昵称"
                  value={wechatId}
                  onChange={(e) => setWechatId(e.target.value)}
                  className="mt-2 border-blue-200 focus:border-blue-400"
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
                  className="mt-2 border-blue-200 focus:border-blue-400"
                  maxLength={11}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-lg py-6"
                size="lg"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    注册中...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    立即注册
                  </>
                )}
              </Button>
            </form>

            {/* 登录入口 */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-3">已经有账号？</p>
              <Button
                variant="outline"
                onClick={() => router.push('/login')}
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                size="lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                立即登录
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              注册后可获得专属推广二维码，分享给朋友赚钱
            </p>
          </CardContent>
        </Card>

        {/* 返现规则说明 */}
        <Card className="mt-6 shadow-lg border border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-center">返现规则</h3>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="text-center mb-3">
                <span className="text-3xl font-bold text-blue-600">100元</span>
                <span className="text-gray-600 ml-2">/次</span>
              </div>
              <p className="text-sm text-gray-600 text-center">
                每次核销固定返现100元，不限制核销次数
              </p>
            </div>

            <h3 className="font-semibold text-gray-800 mb-3 text-center">推广者福利</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">💰</div>
                <p className="text-sm font-medium text-gray-700">固定返现</p>
                <p className="text-xs text-gray-500">每次100元</p>
              </div>
              <div>
                <div className="text-2xl mb-1">📊</div>
                <p className="text-sm font-medium text-gray-700">实时数据</p>
                <p className="text-xs text-gray-500">随时查看进度</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🎁</div>
                <p className="text-sm font-medium text-gray-700">专属礼品</p>
                <p className="text-xs text-gray-500">推广有奖励</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
