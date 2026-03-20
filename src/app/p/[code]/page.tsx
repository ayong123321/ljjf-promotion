'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send, CheckCircle, MapPin, Phone, Copy } from 'lucide-react';

export default function PromotionPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<{
    title: string;
    description: string | null;
    image_url: string | null;
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
        {/* 推广内容卡片 */}
        <Card className="mb-6 overflow-hidden shadow-lg">
          {content.image_url && (
            <div className="w-full flex justify-center bg-gray-100 p-2">
              <img
                src={content.image_url}
                alt={content.title}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{content.title}</CardTitle>
          </CardHeader>
          {content.description && (
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{content.description}</p>
            </CardContent>
          )}
        </Card>

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
              <a 
                href="https://uri.amap.com/search?keyword=永安玲姐假发" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <MapPin className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">门店地址</p>
                  <p className="text-blue-600 underline">永安玲姐假发</p>
                </div>
                <span className="text-xs text-gray-400">点击导航</span>
              </a>
              
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
      </div>
    </div>
  );
}
