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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Users, Image as ImageIcon, BarChart2, Plus, Eye, Copy, Check, QrCode, AlertCircle, UserCheck, MessageCircle, Link as LinkIcon, X } from 'lucide-react';

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
  video_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface VisitorRecord {
  id: number;
  promoter_id: number;
  wechat_id: string | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
  promoter_name?: string;
  wechat_status?: string;
  deal_status?: string;
}

export default function AdminPage() {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [visitorRecords, setVisitorRecords] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 创建推广者表单
  const [promoterForm, setPromoterForm] = useState({
    name: '',
    phone: '',
    wechat: '',
  });

  // 新创建的推广者信息（用于弹窗展示）
  const [newPromoter, setNewPromoter] = useState<{
    name: string;
    uniqueCode: string;
    promoterLink: string;
    promotionLink: string;
  } | null>(null);

  // 创建内容表单
  const [contentForm, setContentForm] = useState({
    id: '',
    title: '',
    description: '',
    videoUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  // 用于强制刷新文件输入框
  const [fileInputKey, setFileInputKey] = useState(0);

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
        
        // 获取所有访客记录
        const allVisitors: VisitorRecord[] = [];
        for (const promoter of statsData.data) {
          const visitorRes = await fetch(`/api/admin/stats?promoterId=${promoter.id}`);
          const visitorData = await visitorRes.json();
          if (visitorData.data?.visitorRecords) {
            visitorData.data.visitorRecords.forEach((v: VisitorRecord) => {
              allVisitors.push({ ...v, promoter_name: promoter.name });
            });
          }
        }
        // 按时间倒序排序
        allVisitors.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setVisitorRecords(allVisitors);
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
        // 显示新推广者信息弹窗
        const uniqueCode = data.data.unique_code;
        const baseUrl = window.location.origin;
        setNewPromoter({
          name: data.data.name,
          uniqueCode: uniqueCode,
          promoterLink: `${baseUrl}/promoter/${uniqueCode}`,
          promotionLink: `${baseUrl}/p/${uniqueCode}`,
        });
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
      // 只有在没有视频文件时才添加 videoUrl
      if (!videoFile && contentForm.videoUrl) {
        formData.append('videoUrl', contentForm.videoUrl);
      }
      if (contentForm.id) {
        formData.append('id', contentForm.id);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (videoFile) {
        formData.append('video', videoFile);
      }

      console.log('提交表单:', {
        id: contentForm.id,
        title: contentForm.title,
        hasImage: !!imageFile,
        hasVideo: !!videoFile,
        videoFileName: videoFile?.name,
        videoFileSize: videoFile?.size,
        videoUrl: contentForm.videoUrl
      });

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('API响应:', data);
      
      if (data.data) {
        // 检查是否上传了视频
        const videoUploaded = data.videoUploaded === true;
        let successMsg = '推广内容保存成功';
        if (videoUploaded) {
          successMsg += '（视频已上传）';
        }
        toast.success(successMsg, { duration: 3000 });
        setContentForm({ id: '', title: '', description: '', videoUrl: '' });
        setImageFile(null);
        setVideoFile(null);
        setFileInputKey(prev => prev + 1);
        fetchData();
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
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

  // 筛选有微信号的访客
  const visitorsWithWechat = visitorRecords.filter(v => v.wechat_id);

  // 更新访客状态
  const updateVisitorStatus = async (recordId: number, field: 'wechatStatus' | 'dealStatus', value: string) => {
    try {
      const res = await fetch('/api/admin/visitor-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          wechatStatus: field === 'wechatStatus' ? value : undefined,
          dealStatus: field === 'dealStatus' ? value : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('状态已更新');
        // 更新本地状态
        setVisitorRecords(prev => prev.map(v => {
          if (v.id === recordId) {
            return {
              ...v,
              wechat_status: field === 'wechatStatus' ? value : v.wechat_status,
              deal_status: field === 'dealStatus' ? value : v.deal_status,
            };
          }
          return v;
        }));
      } else {
        toast.error(data.error || '更新失败');
      }
    } catch (error) {
      toast.error('更新失败');
    }
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
      {/* 新推广者创建成功弹窗 */}
      <Dialog open={!!newPromoter} onOpenChange={() => setNewPromoter(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">推广者创建成功！</DialogTitle>
            <DialogDescription>
              请将以下信息发送给推广者 <strong>{newPromoter?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* 推广者后台链接 */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">推广者后台（重要）</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newPromoter?.promoterLink || ''}
                  readOnly
                  className="flex-1 bg-white"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(newPromoter?.promoterLink || '');
                    toast.success('后台链接已复制');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2">推广者通过此链接查看自己的推广数据和访客信息</p>
            </div>

            {/* 推广链接 */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">推广链接</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newPromoter?.promotionLink || ''}
                  readOnly
                  className="flex-1 bg-white"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(newPromoter?.promotionLink || '');
                    toast.success('推广链接已复制');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-green-600 mt-2">此链接用于推广，访客点击后会被记录</p>
            </div>

            {/* 提示 */}
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700">
                <strong>提示：</strong>微信中直接发链接可能被拦截，建议下载二维码图片发给推广者
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={() => setNewPromoter(null)}>
            关闭
          </Button>
        </DialogContent>
      </Dialog>

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

      <Tabs defaultValue="visitors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="visitors" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            访客记录
            {visitorsWithWechat.length > 0 && (
              <Badge variant="destructive" className="ml-1">{visitorsWithWechat.length}</Badge>
            )}
          </TabsTrigger>
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

        {/* 访客记录 */}
        <TabsContent value="visitors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                访客记录
                {visitorsWithWechat.length > 0 && (
                  <Badge variant="destructive">有 {visitorsWithWechat.length} 人留下微信号</Badge>
                )}
              </CardTitle>
              <CardDescription>所有访客的访问记录，留有微信号的可以主动联系</CardDescription>
            </CardHeader>
            <CardContent>
              {visitorRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>推广者</TableHead>
                      <TableHead>微信号</TableHead>
                      <TableHead>微信状态</TableHead>
                      <TableHead>成交状态</TableHead>
                      <TableHead>IP地址</TableHead>
                      <TableHead>访问时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitorRecords.map((record) => (
                      <TableRow key={record.id} className={record.wechat_id ? 'bg-green-50' : ''}>
                        <TableCell className="font-medium">{record.promoter_name}</TableCell>
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
                          {record.wechat_id ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={record.wechat_status === '已添加' ? 'default' : 'outline'}
                                className={record.wechat_status === '已添加' ? 'bg-green-600 hover:bg-green-700' : ''}
                                onClick={() => updateVisitorStatus(record.id, 'wechatStatus', '已添加')}
                              >
                                已添加
                              </Button>
                              <Button
                                size="sm"
                                variant={record.wechat_status === '未添加' ? 'secondary' : 'outline'}
                                onClick={() => updateVisitorStatus(record.id, 'wechatStatus', '未添加')}
                              >
                                未添加
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.wechat_id ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={record.deal_status === '已成交' ? 'default' : 'outline'}
                                className={record.deal_status === '已成交' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                onClick={() => updateVisitorStatus(record.id, 'dealStatus', '已成交')}
                              >
                                已成交
                              </Button>
                              <Button
                                size="sm"
                                variant={record.deal_status === '未成交' ? 'secondary' : 'outline'}
                                onClick={() => updateVisitorStatus(record.id, 'dealStatus', '未成交')}
                              >
                                未成交
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{record.ip_address}</TableCell>
                        <TableCell>{new Date(record.created_at).toLocaleString('zh-CN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">暂无访客记录</div>
              )}
            </CardContent>
          </Card>

          {/* 留下微信号的访客 */}
          {visitorsWithWechat.length > 0 && (
            <Card className="mt-6 border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  待联系访客（已留微信号）
                </CardTitle>
                <CardDescription className="text-green-600">以下访客已留下微信号，请尽快联系并标记状态</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {visitorsWithWechat.map((record) => (
                    <div key={record.id} className="p-4 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">微信号: <span className="text-green-600">{record.wechat_id}</span></div>
                          <div className="text-sm text-gray-500">
                            通过「{record.promoter_name}」推广 · {new Date(record.created_at).toLocaleString('zh-CN')}
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(record.wechat_id!);
                            toast.success('微信号已复制，快去微信添加吧！');
                          }}
                        >
                          复制微信号
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">微信状态:</span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={record.wechat_status === '已添加' ? 'default' : 'outline'}
                              className={record.wechat_status === '已添加' ? 'bg-green-600 hover:bg-green-700' : ''}
                              onClick={() => updateVisitorStatus(record.id, 'wechatStatus', '已添加')}
                            >
                              已添加
                            </Button>
                            <Button
                              size="sm"
                              variant={record.wechat_status === '未添加' ? 'secondary' : 'outline'}
                              onClick={() => updateVisitorStatus(record.id, 'wechatStatus', '未添加')}
                            >
                              未添加
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">成交状态:</span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={record.deal_status === '已成交' ? 'default' : 'outline'}
                              className={record.deal_status === '已成交' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                              onClick={() => updateVisitorStatus(record.id, 'dealStatus', '已成交')}
                            >
                              已成交
                            </Button>
                            <Button
                              size="sm"
                              variant={record.deal_status === '未成交' ? 'secondary' : 'outline'}
                              onClick={() => updateVisitorStatus(record.id, 'dealStatus', '未成交')}
                            >
                              未成交
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

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
                    <div key={promoter.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium text-lg">{promoter.name}</div>
                          <div className="text-sm text-gray-500">
                            推广码: <Badge variant="outline">{promoter.unique_code}</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQRCode(promoter.unique_code)}
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          二维码
                        </Button>
                      </div>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">后台:</span>
                          <code className="flex-1 text-blue-600 text-xs">{typeof window !== 'undefined' ? `${window.location.origin}/promoter/${promoter.unique_code}` : ''}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => copyPromoterLink(promoter.unique_code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <LinkIcon className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">推广:</span>
                          <code className="flex-1 text-green-600 text-xs">{typeof window !== 'undefined' ? `${window.location.origin}/p/${promoter.unique_code}` : ''}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(promoter.unique_code)}
                          >
                            {copiedCode === promoter.unique_code ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
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
                  <div className="border-t pt-4 mt-4">
                    <Label className="text-base font-semibold">导航视频（可选）</Label>
                    <p className="text-xs text-gray-500 mb-3">上传视频文件或粘贴视频链接，二选一即可</p>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="video" className="text-sm">上传视频文件</Label>
                        <Input
                          key={`video-${fileInputKey}`}
                          id="video"
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            console.log('选择视频文件:', file?.name, file?.size, 'bytes');
                            setVideoFile(file || null);
                            if (file) {
                              setContentForm({ ...contentForm, videoUrl: '' });
                            }
                          }}
                        />
                        {videoFile && (
                          <p className="text-xs text-green-600 mt-1">已选择: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                        )}
                      </div>
                      
                      <div className="text-center text-gray-400 text-sm">或者</div>
                      
                      <div>
                        <Label htmlFor="videoUrl" className="text-sm">粘贴视频链接</Label>
                        <Input
                          id="videoUrl"
                          type="text"
                          placeholder="粘贴抖音、快手等分享链接"
                          value={contentForm.videoUrl}
                          onChange={(e) => {
                            setContentForm({ ...contentForm, videoUrl: e.target.value });
                            if (e.target.value) {
                              setVideoFile(null);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {contentForm.id ? '更新内容' : '创建内容'}
                    </Button>
                    {contentForm.id && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setContentForm({ id: '', title: '', description: '', videoUrl: '' });
                          setImageFile(null);
                          setVideoFile(null);
                          setFileInputKey(prev => prev + 1);
                        }}
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
                  {contents.map((content, index) => (
                    <div key={content.id} className={`p-3 border rounded-lg ${index === 0 ? 'border-green-500 bg-green-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{content.title}</span>
                            {index === 0 && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">当前使用中</span>
                            )}
                          </div>
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
                          {content.video_url && (
                            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              已添加导航视频
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
                                videoUrl: content.video_url || '',
                              });
                              // 清空之前选择的文件
                              setImageFile(null);
                              setVideoFile(null);
                              // 强制刷新文件输入框
                              setFileInputKey(prev => prev + 1);
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
                      <TableCell className="text-center">
                        {(promoter.stats?.wechatSubmissions || 0) > 0 ? (
                          <Badge variant="default" className="bg-green-600">{promoter.stats?.wechatSubmissions}</Badge>
                        ) : (
                          promoter.stats?.wechatSubmissions || 0
                        )}
                      </TableCell>
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
