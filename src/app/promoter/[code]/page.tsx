'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Users, Eye, Copy, Check, Link as LinkIcon, UserCheck, Download, QrCode, AlertCircle, MessageCircle } from 'lucide-react';

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
  const code = params.code as string;
  
  const [data, setData] = useState<PromoterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    fetchPromoterData();
  }, [code]);

  const fetchPromoterData = async () => {
    try {
      const res = await fetch(`/api/promoter/${code}`);
      const result = await res.json();
      if (result.data) {
        setData(result.data);
        const promotionUrl = `${window.location.origin}/p/${code}`;
        setQrCodeUrl(`/api/qrcode?url=${encodeURIComponent(promotionUrl)}`);
      } else {
        toast.error(result.error || '获取数据失败');
      }
    } catch (error) {
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const copyPromotionLink = () => {
    const url = `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('推广链接已复制！');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `推广二维码_${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('二维码已下载，可以发朋友圈了！');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
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

  const promotionUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${code}`;
  
  // 筛选有微信号的访客
  const visitorsWithWechat = data.visitorRecords.filter(v => v.wechat_id);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">推广者后台</h1>
        <p className="text-gray-600 mt-2">欢迎, {data.promoter.name}!</p>
      </div>

      {/* 微信使用提示 */}
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

      {/* 留下微信号的访客 - 重点展示 */}
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
                <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                  <div>
                    <div className="text-lg font-medium">
                      微信号: <span className="text-green-600 font-bold">{record.wechat_id}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      访问时间: {new Date(record.created_at).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(record.wechat_id!);
                      toast.success('微信号已复制，快去微信添加吧！');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    复制微信号
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 推广二维码卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            推广二维码（推荐使用）
          </CardTitle>
          <CardDescription>
            下载二维码图片发朋友圈，用户扫码即可访问
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {qrCodeUrl && (
              <div className="border rounded-lg p-4 bg-white">
                <img 
                  src={qrCodeUrl} 
                  alt="推广二维码" 
                  className="w-48 h-48"
                />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <p className="text-gray-600">
                扫描此二维码可以直接访问您的推广页面。
                下载后发朋友圈效果更好！
              </p>
              <Button onClick={downloadQRCode} size="lg" className="w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                下载二维码图片
              </Button>
              <p className="text-sm text-gray-500">
                提示：下载后在朋友圈发布时，可以配上吸引人的文案
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 推广链接卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            推广链接
          </CardTitle>
          <CardDescription>
            复制链接在其他平台（如QQ、微博）使用
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={promotionUrl}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyPromotionLink}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  复制链接
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计数据 */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">独立访客</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">不同IP访问数量</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总访问量</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalVisits}</div>
            <p className="text-xs text-muted-foreground">总点击次数</p>
          </CardContent>
        </Card>
        
        <Card className={data.stats.wechatSubmissions > 0 ? 'border-2 border-green-500 bg-green-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">微信号提交</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.stats.wechatSubmissions}</div>
            <p className="text-xs text-muted-foreground">留下联系方式的访客</p>
          </CardContent>
        </Card>
      </div>

      {/* 推广内容预览 */}
      {data.content && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>推广内容预览</CardTitle>
            <CardDescription>访客看到的推广页面内容</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{data.content.title}</h3>
              {data.content.description && (
                <p className="text-gray-600">{data.content.description}</p>
              )}
              {data.content.image_url && (
                <img
                  src={data.content.image_url}
                  alt={data.content.title}
                  className="w-full max-w-md rounded-lg"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 访客记录 */}
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
                  <TableHead>访客IP</TableHead>
                  <TableHead>微信号</TableHead>
                  <TableHead>访问时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.visitorRecords.slice(0, 20).map((record) => (
                  <TableRow key={record.id} className={record.wechat_id ? 'bg-green-50' : ''}>
                    <TableCell className="font-mono text-sm">
                      {record.ip_address}
                    </TableCell>
                    <TableCell>
                      {record.wechat_id ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-600">{record.wechat_id}</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(record.wechat_id!);
                              toast.success('微信号已复制');
                            }}
                          >
                            复制
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400">未留下</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(record.created_at).toLocaleString('zh-CN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无访客记录，快去推广吧！
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
