'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Users, Eye, Copy, Check, Link as LinkIcon, UserCheck, Download, QrCode, AlertCircle, MessageCircle } from 'lucide-react';

// 动态导入 toast 以避免服务端问题
const SonnerToaster = dynamic(() => import('@/components/ui/sonner').then(mod => mod.Toaster), { ssr: false });

interface PromoterData {
  promoter: {
    id: number;
    name: string;
    phone: string | null;
    wechat: string | null;
    unique_code: string;
    is_active: boolean;
  };
  stats: {
    uniqueVisitors: number;
    totalVisits: number;
    wechatSubmissions: number;
  };
  visitorRecords: Array<{
    id: number;
    wechat_id: string | null;
    ip_address: string;
    user_agent: string;
    created_at: string;
    wechat_status?: string;
    deal_status?: string;
  }>;
  content: {
    id: number;
    title: string;
    description: string | null;
    image_url: string | null;
  } | null;
}

export default function PromoterPage() {
  const params = useParams();
  const code = Array.isArray(params.code) ? params.code[0] : params.code;
  
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<PromoterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [promotionUrl, setPromotionUrl] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (code && mounted) {
      fetchData();
    }
  }, [code, mounted]);

  const fetchData = useCallback(async () => {
    if (!code) return;
    
    setLoading(true);
    try {
      setPromotionUrl(`${window.location.origin}/p/${code}`);
      setQrCodeUrl(`/api/promoter/${code}/qrcode`);
      
      const res = await fetch(`/api/promoter/${code}`);
      const result = await res.json();
      if (result.data) {
        setData(result.data);
      } else {
        toast.error(result.error || '获取数据失败');
      }
    } catch (error) {
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [code]);

  const copyPromotionLink = useCallback(() => {
    const url = promotionUrl || `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('推广链接已复制！');
    setTimeout(() => setCopied(false), 2000);
  }, [promotionUrl, code]);

  const downloadQRCode = useCallback(async () => {
    if (!code) return;
    try {
      const response = await fetch(`/api/promoter/${code}/qrcode`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `推广二维码_${code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('二维码已下载！');
    } catch (error) {
      toast.error('下载二维码失败');
    }
  }, [code]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg mb-2">加载中...</div>
          <div className="text-sm text-gray-500">请稍候</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">推广者不存在</h2>
          <p className="text-gray-600">请检查推广链接是否正确</p>
        </div>
      </div>
    );
  }

  const visitorsWithWechat = data.visitorRecords.filter(v => v.wechat_id);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <SonnerToaster />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">推广者后台</h1>
        <p className="text-gray-600 mt-2">欢迎, {data.promoter.name}!</p>
      </div>

      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">微信使用说明</AlertTitle>
        <AlertDescription className="text-orange-700">
          <p className="mb-2">由于微信安全限制，直接发链接可能被拦截。推荐使用以下方式推广：</p>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>下载二维码图片</strong>，发朋友圈时配上二维码图片</li>
            <li>在图片上添加文字说明，引导用户扫码</li>
            <li>用户扫码后会自动跳转到推广页面</li>
          </ol>
        </AlertDescription>
      </Alert>

      {visitorsWithWechat.length > 0 && (
        <Card className="mb-6 border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <MessageCircle className="h-5 w-5" />
              有访客留下微信号了！
              <Badge variant="destructive">{visitorsWithWechat.length}</Badge>
            </CardTitle>
            <CardDescription className="text-green-600">以下访客已留下微信号，快去联系他们吧！</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visitorsWithWechat.map((record) => (
                <div key={record.id} className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-lg font-medium">
                        微信号: <span className="text-green-600 font-bold">{record.wechat_id}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        访问时间: {record.created_at}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(record.wechat_id!);
                        toast.success('微信号已复制！');
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      复制微信号
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">微信状态:</span>
                      <Badge variant={record.wechat_status === '已添加' ? 'default' : 'secondary'}>
                        {record.wechat_status || '未添加'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">成交状态:</span>
                      <Badge variant={record.deal_status === '已成交' ? 'default' : 'secondary'}>
                        {record.deal_status || '未成交'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            推广二维码
          </CardTitle>
          <CardDescription>下载二维码图片发朋友圈</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {qrCodeUrl && (
              <div className="border rounded-lg p-4 bg-white">
                <img src={qrCodeUrl} alt="推广二维码" className="w-48 h-48" />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <p className="text-gray-600">扫描此二维码可以直接访问您的推广页面</p>
              <Button onClick={downloadQRCode} size="lg" className="w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                下载二维码图片
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            推广链接
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={promotionUrl} readOnly className="flex-1" />
            <Button onClick={copyPromotionLink}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? '已复制' : '复制链接'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">独立访客</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.uniqueVisitors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总访问量</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalVisits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">微信号提交</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.stats.wechatSubmissions}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            访客记录
            {visitorsWithWechat.length > 0 && (
              <Badge variant="destructive">{visitorsWithWechat.length}人留微信号</Badge>
            )}
          </CardTitle>
          <CardDescription>最近访问的访客信息</CardDescription>
        </CardHeader>
        <CardContent>
          {data.visitorRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>微信号</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.visitorRecords.slice(0, 20).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.wechat_id ? (
                        <Badge className="bg-green-600">{record.wechat_id}</Badge>
                      ) : (
                        <span className="text-gray-400">未留下</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.wechat_id ? (
                        <Badge variant={record.wechat_status === '已添加' ? 'default' : 'secondary'}>
                          {record.wechat_status || '未添加'}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{record.created_at}</TableCell>
                    <TableCell>
                      {record.wechat_id && (
                        <Button size="sm" variant="outline" onClick={() => {
                          navigator.clipboard.writeText(record.wechat_id!);
                          toast.success('已复制');
                        }}>
                          复制
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">暂无访客记录</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
