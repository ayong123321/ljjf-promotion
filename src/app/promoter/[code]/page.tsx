'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Users, Eye, Copy, Check, Link as LinkIcon, UserCheck } from 'lucide-react';

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

  useEffect(() => {
    fetchPromoterData();
  }, [code]);

  const fetchPromoterData = async () => {
    try {
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
  };

  const copyPromotionLink = () => {
    const url = `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('推广链接已复制，快去发朋友圈吧！');
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">推广者后台</h1>
        <p className="text-gray-600 mt-2">欢迎, {data.promoter.name}!</p>
      </div>

      {/* 推广链接卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            我的推广链接
          </CardTitle>
          <CardDescription>
            复制此链接发到朋友圈，访客点击后会自动记录
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
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">微信号提交</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.wechatSubmissions}</div>
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
          <CardTitle>访客记录</CardTitle>
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
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">
                      {record.ip_address}
                    </TableCell>
                    <TableCell>
                      {record.wechat_id ? (
                        <Badge variant="secondary">{record.wechat_id}</Badge>
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
