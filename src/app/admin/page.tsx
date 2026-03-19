'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Users, Image as ImageIcon, BarChart2, Plus, Eye, Copy, Check, Download, QrCode, AlertCircle } from 'lucide-react';

interface Promoter {
  id: number;
  name: string;
  phone: string | null;
  wechat: string | null;
  unique_code: string;
  is_active: boolean;
  created_at: string;
  stats?: {
    uniqueVisitors: number;
    totalVisits: number;
    wechatSubmissions: number;
  };
}

interface Content {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 创建推广者表单
  const [promoterForm, setPromoterForm] = useState({
    name: '',
    phone: '',
    wechat: '',
  });

  // 创建内容表单
  const [contentForm, setContentForm] = useState({
    id: '',
    title: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 获取推广者数据（带统计）
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.data) {
        setPromoters(statsData.data);
      }

      // 获取推广内容
      const contentRes = await fetch('/api/admin/content');
      const contentData = await contentRes.json();
      if (contentData.data) {
        setContents(contentData.data);
      }
    } catch (error) {
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromoter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/promoters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoterForm),
      });
      const data = await res.json();
      if (data.data) {
        toast.success('推广者创建成功');
        setPromoterForm({ name: '', phone: '', wechat: '' });
        fetchData();
      } else {
        toast.error(data.error || '创建失败');
      }
    } catch (error) {
      toast.error('创建失败');
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', contentForm.title);
      formData.append('description', contentForm.description);
      if (contentForm.id) {
        formData.append('id', contentForm.id);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.data) {
        toast.success('推广内容保存成功');
        setContentForm({ id: '', title: '', description: '' });
        setImageFile(null);
        fetchData();
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleDeleteContent = async (id: number) => {
    if (!confirm('确定要删除这个推广内容吗？')) return;
    
    try {
      const res = await fetch(`/api/admin/content?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('删除成功');
        fetchData();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast.success('推广链接已复制');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyPromoterLink = (code: string) => {
    const url = `${window.location.origin}/promoter/${code}`;
    navigator.clipboard.writeText(url);
    toast.success('推广者后台链接已复制');
  };

  const downloadQRCode = (code: string) => {
    const url = `/api/qrcode?url=${encodeURIComponent(`${window.location.origin}/p/${code}`)}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `推广二维码_${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('二维码已下载');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">假发店推广管理系统</h1>
        <p className="text-gray-600 mt-2">管理推广者、推广内容和查看统计数据</p>
      </div>

      {/* 微信使用提示 */}
      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">微信推广说明</AlertTitle>
        <AlertDescription className="text-orange-700">
          由于微信安全限制，直接发链接可能被拦截。<strong>请下载二维码图片发给推广者</strong>，让他们用图片发朋友圈，效果更好！
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="promoters" className="space-y-6">
        <TabsList>
          <TabsTrigger value="promoters" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            推广者管理
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            推广内容
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            数据统计
          </TabsTrigger>
        </TabsList>

        {/* 推广者管理 */}
        <TabsContent value="promoters">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>创建推广者</CardTitle>
                <CardDescription>添加新的推广人员并生成专属推广链接</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePromoter} className="space-y-4">
                  <div>
                    <Label htmlFor="name">姓名 *</Label>
                    <Input
                      id="name"
                      value={promoterForm.name}
                      onChange={(e) => setPromoterForm({ ...promoterForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">手机号</Label>
                    <Input
                      id="phone"
                      value={promoterForm.phone}
                      onChange={(e) => setPromoterForm({ ...promoterForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="wechat">微信号</Label>
                    <Input
                      id="wechat"
                      value={promoterForm.wechat}
                      onChange={(e) => setPromoterForm({ ...promoterForm, wechat: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    创建推广者
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>推广者列表</CardTitle>
                <CardDescription>所有推广者及其专属推广码，点击下载二维码</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {promoters.map((promoter) => (
                    <div key={promoter.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{promoter.name}</div>
                        <div className="text-sm text-gray-500">
                          推广码: {promoter.unique_code}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQRCode(promoter.unique_code)}
                          title="下载二维码"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(promoter.unique_code)}
                          title="复制推广链接"
                        >
                          {copiedCode === promoter.unique_code ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyPromoterLink(promoter.unique_code)}
                          title="推广者后台链接"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 推广内容 */}
        <TabsContent value="content">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{contentForm.id ? '编辑推广内容' : '创建推广内容'}</CardTitle>
                <CardDescription>设置推广页面展示的内容和图片</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateContent} className="space-y-4">
                  <div>
                    <Label htmlFor="title">标题 *</Label>
                    <Input
                      id="title"
                      value={contentForm.title}
                      onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">描述</Label>
                    <Textarea
                      id="description"
                      value={contentForm.description}
                      onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">宣传图片</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {contentForm.id ? '更新内容' : '创建内容'}
                    </Button>
                    {contentForm.id && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setContentForm({ id: '', title: '', description: '' })}
                      >
                        取消
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>已创建的内容</CardTitle>
                <CardDescription>所有推广内容列表</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contents.map((content) => (
                    <div key={content.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{content.title}</div>
                          {content.description && (
                            <div className="text-sm text-gray-500 mt-1">{content.description}</div>
                          )}
                          {content.image_url && (
                            <div className="mt-2">
                              <img
                                src={content.image_url}
                                alt={content.title}
                                className="w-32 h-32 object-cover rounded"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setContentForm({
                                id: content.id.toString(),
                                title: content.title,
                                description: content.description || '',
                              });
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteContent(content.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 数据统计 */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>推广数据统计</CardTitle>
              <CardDescription>查看所有推广者的数据表现</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>推广者</TableHead>
                    <TableHead>推广码</TableHead>
                    <TableHead className="text-center">独立访客</TableHead>
                    <TableHead className="text-center">总访问量</TableHead>
                    <TableHead className="text-center">微信号提交</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoters.map((promoter) => (
                    <TableRow key={promoter.id}>
                      <TableCell className="font-medium">{promoter.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{promoter.unique_code}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{promoter.stats?.uniqueVisitors || 0}</TableCell>
                      <TableCell className="text-center">{promoter.stats?.totalVisits || 0}</TableCell>
                      <TableCell className="text-center">{promoter.stats?.wechatSubmissions || 0}</TableCell>
                      <TableCell>
                        {new Date(promoter.created_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
