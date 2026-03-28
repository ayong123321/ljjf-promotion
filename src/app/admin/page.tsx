'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { uploadToSupabaseStorage } from '@/lib/supabase-browser';

interface Promoter {
  id: string;
  name: string;
  phone: string;
  code: string;
  created_at: string;
}

interface Content {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  url: string;
  created_at: string;
}

interface VisitorRecord {
  id: number;
  promoter_code: string;
  promoters?: { name: string; code: string };
  wechat: string;
  ip: string;
  status: string;
  remark: string;
  created_at: string;
}

interface PromoterStats {
  code: string;
  name: string;
  totalVisits: number;
  wechatSubmissions: number;
  addedCount: number;
  dealedCount: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'promoters' | 'contents' | 'visitors' | 'visitorList'>('promoters');
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [promoterStats, setPromoterStats] = useState<PromoterStats[]>([]);
  const [visitorRecords, setVisitorRecords] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPromoter, setNewPromoter] = useState({ name: '', phone: '' });
  const [showAddPromoter, setShowAddPromoter] = useState(false);
  const [newContent, setNewContent] = useState({ 
    type: 'image' as 'image' | 'video', 
    title: '', 
    description: '', 
    url: '',
    uploadType: 'file' as 'file' | 'link'
  });
  const [showAddContent, setShowAddContent] = useState(false);
  const [qrcodePromoter, setQrcodePromoter] = useState<Promoter | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 筛选条件
  const [filterPromoter, setFilterPromoter] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // 实时更新
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    if (activeTab === 'promoters') fetchPromoters();
    else if (activeTab === 'contents') fetchContents();
    else if (activeTab === 'visitors') fetchPromoterStats();
    else if (activeTab === 'visitorList') fetchVisitorRecords();
  }, [activeTab]);

  // 实时更新：每5秒轮询一次
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      if (activeTab === 'promoters') fetchPromoters(true);
      else if (activeTab === 'contents') fetchContents(true);
      else if (activeTab === 'visitors') fetchPromoterStats(true);
      else if (activeTab === 'visitorList') fetchVisitorRecords(true);
      setLastUpdate(new Date().toLocaleTimeString());
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, filterPromoter, filterStatus]);

  const fetchPromoters = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/promoters', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setPromoters(data.data || []);
    } catch (e) { console.error(e); }
    if (!silent) setLoading(false);
    else setIsUpdating(false);
  };

  const fetchContents = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/contents', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setContents(data.data || []);
    } catch (e) { console.error(e); }
    if (!silent) setLoading(false);
    else setIsUpdating(false);
  };

  const fetchPromoterStats = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/promoter-stats', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setPromoterStats(data.data || []);
    } catch (e) { console.error(e); }
    if (!silent) setLoading(false);
    else setIsUpdating(false);
  };

  const fetchVisitorRecords = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      let url = '/api/admin/visitors';
      const params = new URLSearchParams();
      if (filterPromoter) params.append('promoter_code', filterPromoter);
      if (filterStatus) params.append('status', filterStatus);
      if (params.toString()) url += '?' + params.toString();
      
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setVisitorRecords(data.data || []);
    } catch (e) { console.error(e); }
    if (!silent) setLoading(false);
    else setIsUpdating(false);
  };

  // 筛选变化时重新获取
  useEffect(() => {
    if (activeTab === 'visitorList') {
      fetchVisitorRecords();
    }
  }, [filterPromoter, filterStatus]);

  const addPromoter = async () => {
    if (!newPromoter.name.trim()) { alert('请输入姓名'); return; }
    try {
      const res = await fetch('/api/admin/promoters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPromoter)
      });
      const data = await res.json();
      if (data.success) {
        setNewPromoter({ name: '', phone: '' });
        setShowAddPromoter(false);
        fetchPromoters();
        alert('添加成功！推广码：' + data.data.code);
      } else alert('失败：' + data.error);
    } catch (e) { alert('添加失败'); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（图片 10MB，视频 50MB）
    const maxSize = newContent.type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`文件太大，${newContent.type === 'image' ? '图片' : '视频'}最大支持 ${newContent.type === 'image' ? '10MB' : '50MB'}`);
      return;
    }

    setUploading(true);
    try {
      // 直接上传到 Supabase Storage（绕过 Vercel 函数限制）
      const result = await uploadToSupabaseStorage(file, newContent.type);
      
      if (result.success && result.url) {
        setNewContent({ ...newContent, url: result.url });
        alert('上传成功！');
      } else {
        alert('上传失败：' + (result.error || '未知错误'));
      }
    } catch (e) {
      console.error('上传异常:', e);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addContent = async () => {
    if (!newContent.title.trim()) { alert('请输入标题'); return; }
    if (!newContent.url.trim()) { alert('请上传文件或输入链接'); return; }
    
    try {
      const res = await fetch('/api/admin/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newContent.type,
          title: newContent.title,
          description: newContent.description,
          url: newContent.url
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewContent({ type: 'image', title: '', description: '', url: '', uploadType: 'file' });
        setShowAddContent(false);
        fetchContents();
        alert('添加成功！');
      } else alert('失败：' + data.error);
    } catch (e) { alert('添加失败'); }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert('链接已复制！');
        return;
      }
      
      const input = document.createElement('input');
      input.value = text;
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      document.body.appendChild(input);
      input.select();
      input.setSelectionRange(0, 99999);
      const success = document.execCommand('copy');
      document.body.removeChild(input);
      
      if (success) {
        alert('链接已复制！');
      } else {
        prompt('请手动复制链接：', text);
      }
    } catch (e) {
      prompt('请手动复制链接：', text);
    }
  };

  const updateVisitorStatus = async (id: number, status: string, remark?: string) => {
    try {
      const res = await fetch('/api/admin/visitors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, remark })
      });
      const data = await res.json();
      if (data.success) {
        fetchVisitorRecords();
      } else {
        alert('更新失败：' + data.error);
      }
    } catch (e) {
      alert('更新失败');
    }
  };

  const getPromotionUrl = (code: string) => {
    // 使用正式域名
    const domain = process.env.NEXT_PUBLIC_COZE_PROJECT_DOMAIN_DEFAULT || 
                   'https://439a0333-2b4f-48ab-a2a5-c6e2506a2e5f.dev.coze.site';
    return `${domain}/p/${code}`;
  };

  // 下载二维码图片
  const downloadQRCode = async (code: string) => {
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
    } catch (error) {
      console.error('下载二维码失败:', error);
      alert('下载二维码失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h1 className="text-2xl md:text-3xl font-bold">管理后台</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isUpdating ? (
              <div className="flex items-center gap-2 text-blue-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>正在更新...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>实时更新中 · 每5秒刷新</span>
              </div>
            )}
            <span className="text-gray-400 ml-2">最后更新: {lastUpdate || '--:--:--'}</span>
          </div>
        </div>
        
        {/* 标签导航 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button 
            onClick={() => setActiveTab('promoters')} 
            className={`px-4 py-2 rounded text-sm md:text-base ${activeTab === 'promoters' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            推广者管理 ({promoters.length})
          </button>
          <button 
            onClick={() => setActiveTab('contents')} 
            className={`px-4 py-2 rounded text-sm md:text-base ${activeTab === 'contents' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            内容管理 ({contents.length})
          </button>
          <button 
            onClick={() => setActiveTab('visitors')} 
            className={`px-4 py-2 rounded text-sm md:text-base ${activeTab === 'visitors' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            数据统计
          </button>
          <button 
            onClick={() => setActiveTab('visitorList')} 
            className={`px-4 py-2 rounded text-sm md:text-base ${activeTab === 'visitorList' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            访客管理
          </button>
        </div>

        {/* 二维码弹窗 */}
        {qrcodePromoter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrcodePromoter(null)}>
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="bg-white p-4 flex justify-center">
                <img 
                  src={`/api/promoter/${qrcodePromoter.code}/qrcode`}
                  alt="推广二维码" 
                  className="w-48 h-48 md:w-64 md:h-64"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => downloadQRCode(qrcodePromoter.code)}
                  className="flex-1 bg-green-500 text-white py-3 rounded font-medium"
                >
                  下载二维码
                </button>
                <button 
                  onClick={() => setQrcodePromoter(null)}
                  className="flex-1 bg-gray-300 py-3 rounded font-medium"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 推广者管理 */}
        {activeTab === 'promoters' && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold">推广者列表</h2>
              <button 
                onClick={() => setShowAddPromoter(!showAddPromoter)} 
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm md:text-base"
              >
                {showAddPromoter ? '取消' : '+ 添加推广者'}
              </button>
            </div>
            
            {showAddPromoter && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">姓名 *</label>
                    <input 
                      type="text" 
                      value={newPromoter.name} 
                      onChange={(e) => setNewPromoter({...newPromoter, name: e.target.value})} 
                      className="w-full border rounded px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">电话</label>
                    <input 
                      type="text" 
                      value={newPromoter.phone} 
                      onChange={(e) => setNewPromoter({...newPromoter, phone: e.target.value})} 
                      className="w-full border rounded px-3 py-2" 
                    />
                  </div>
                </div>
                <button 
                  onClick={addPromoter} 
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                >
                  保存
                </button>
              </div>
            )}
            
            {loading ? (
              <p className="text-gray-500">加载中...</p>
            ) : promoters.length === 0 ? (
              <p className="text-gray-500">暂无推广者</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">姓名</th>
                      <th className="px-4 py-2 text-left">电话</th>
                      <th className="px-4 py-2 text-left">推广码</th>
                      <th className="px-4 py-2 text-left">创建时间</th>
                      <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoters.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3">{p.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <code className="bg-gray-100 px-2 py-1 rounded">{p.code}</code>
                        </td>
                        <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            <button 
                              onClick={() => setQrcodePromoter(p)} 
                              className="text-blue-500 hover:underline"
                            >
                              二维码
                            </button>
                            <button 
                              onClick={() => copyToClipboard(getPromotionUrl(p.code))} 
                              className="text-green-500 hover:underline"
                            >
                              复制链接
                            </button>
                            <button 
                              onClick={() => window.open(`/promoter-dashboard/${p.code}`, '_blank')}
                              className="text-purple-500 hover:underline"
                            >
                              推广者后台
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('确定删除？')) {
                                  fetch(`/api/admin/promoters?id=${p.id}`, { method: 'DELETE' })
                                    .then(res => res.json())
                                    .then(data => {
                                      if (data.success) {
                                        setPromoters(promoters.filter(item => item.id !== p.id));
                                        alert('删除成功');
                                      } else {
                                        alert('删除失败：' + data.error);
                                      }
                                    });
                                }
                              }} 
                              className="text-red-500 hover:underline"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 内容管理 */}
        {activeTab === 'contents' && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold">内容列表</h2>
              <button 
                onClick={() => {
                  setShowAddContent(!showAddContent);
                  setNewContent({ type: 'image', title: '', description: '', url: '', uploadType: 'file' });
                }} 
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm md:text-base"
              >
                {showAddContent ? '取消' : '+ 添加内容'}
              </button>
            </div>
            
            {showAddContent && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">内容类型</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        checked={newContent.type === 'image'}
                        onChange={() => setNewContent({ ...newContent, type: 'image', uploadType: 'file', url: '' })}
                        className="mr-2"
                      />
                      📸 图片
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        checked={newContent.type === 'video'}
                        onChange={() => setNewContent({ ...newContent, type: 'video', uploadType: 'file', url: '' })}
                        className="mr-2"
                      />
                      🎬 视频
                    </label>
                  </div>
                </div>

                {newContent.type === 'video' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">上传方式</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="uploadType"
                          checked={newContent.uploadType === 'file'}
                          onChange={() => setNewContent({ ...newContent, uploadType: 'file', url: '' })}
                          className="mr-2"
                        />
                        本地上传
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="uploadType"
                          checked={newContent.uploadType === 'link'}
                          onChange={() => setNewContent({ ...newContent, uploadType: 'link', url: '' })}
                          className="mr-2"
                        />
                        抖音链接
                      </label>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">标题 *</label>
                    <input 
                      type="text" 
                      value={newContent.title} 
                      onChange={(e) => setNewContent({...newContent, title: e.target.value})} 
                      className="w-full border rounded px-3 py-2" 
                      placeholder="请输入标题"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">描述</label>
                    <input 
                      type="text" 
                      value={newContent.description} 
                      onChange={(e) => setNewContent({...newContent, description: e.target.value})} 
                      className="w-full border rounded px-3 py-2" 
                      placeholder="请输入描述（可选）"
                    />
                  </div>
                  
                  {(newContent.type === 'image' || newContent.uploadType === 'file') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {newContent.type === 'image' ? '上传图片 *' : '上传视频 *'}
                      </label>
                      <div className="flex gap-2 items-center flex-wrap">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={newContent.type === 'image' ? 'image/*' : 'video/*'}
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label 
                          htmlFor="file-upload"
                          className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded inline-block"
                        >
                          {uploading ? '上传中...' : '选择文件'}
                        </label>
                        {newContent.url && (
                          <span className="text-green-600 text-sm">✓ 已上传</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {newContent.type === 'image' 
                          ? '支持 JPG、PNG、GIF、WebP，最大 10MB' 
                          : '支持 MP4、MOV、AVI、WebM，最大 50MB'}
                      </p>
                    </div>
                  )}
                  
                  {newContent.type === 'video' && newContent.uploadType === 'link' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">抖音分享链接 *</label>
                      <textarea 
                        value={newContent.url} 
                        onChange={(e) => setNewContent({...newContent, url: e.target.value})} 
                        className="w-full border rounded px-3 py-2 h-24" 
                        placeholder="打开抖音视频 → 点击分享 → 复制链接 → 粘贴到这里&#10;&#10;示例：3.33 复制打开抖音，看看【xxx的作品】... https://v.douyin.com/xxx/"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        从抖音 App 分享视频，复制链接后粘贴到上方输入框
                      </p>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={addContent} 
                  disabled={uploading || !newContent.url}
                  className="mt-4 bg-green-500 text-white px-6 py-2 rounded disabled:bg-gray-300"
                >
                  保存
                </button>
              </div>
            )}
            
            {loading ? (
              <p className="text-gray-500">加载中...</p>
            ) : contents.length === 0 ? (
              <p className="text-gray-500">暂无内容，点击"添加内容"上传图片或视频</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contents.map((c) => (
                  <div key={c.id} className="border rounded-lg overflow-hidden">
                    {c.type === 'image' ? (
                      <img src={c.url} alt={c.title} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-4xl mb-2">🎬</div>
                          <p className="text-sm">视频内容</p>
                        </div>
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-medium truncate">{c.title}</h3>
                      {c.description && (
                        <p className="text-sm text-gray-500 truncate">{c.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {c.type === 'image' ? '📸 图片' : '🎬 视频'} · {new Date(c.created_at).toLocaleDateString()}
                      </p>
                      <button 
                        onClick={() => {
                          if (confirm('确定删除？')) {
                            fetch(`/api/admin/contents?id=${c.id}`, { method: 'DELETE' })
                              .then(res => res.json())
                              .then(data => {
                                if (data.success) {
                                  setContents(contents.filter(item => item.id !== c.id));
                                  alert('删除成功');
                                } else {
                                  alert('删除失败：' + data.error);
                                }
                              });
                          }
                        }} 
                        className="mt-3 w-full px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 数据统计 - 按推广者分组 */}
        {activeTab === 'visitors' && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h2 className="text-lg md:text-xl font-semibold mb-6">推广者数据统计</h2>
            {loading ? (
              <p className="text-gray-500">加载中...</p>
            ) : promoterStats.length === 0 ? (
              <p className="text-gray-500">暂无数据</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">推广者</th>
                      <th className="px-4 py-3 text-left">推广码</th>
                      <th className="px-4 py-3 text-center">访问次数</th>
                      <th className="px-4 py-3 text-center">留微信数</th>
                      <th className="px-4 py-3 text-center">已添加</th>
                      <th className="px-4 py-3 text-center">已成交</th>
                      <th className="px-4 py-3 text-center">转化率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoterStats.map((p) => (
                      <tr key={p.code} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{p.code}</code>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                            {p.totalVisits}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                            {p.wechatSubmissions}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                            {p.addedCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                            {p.dealedCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-gray-600">
                            {p.wechatSubmissions > 0 ? Math.round((p.dealedCount / p.wechatSubmissions) * 100) : 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-bold" colSpan={2}>总计</td>
                      <td className="px-4 py-3 text-center font-bold">
                        {promoterStats.reduce((sum, p) => sum + p.totalVisits, 0)}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {promoterStats.reduce((sum, p) => sum + p.wechatSubmissions, 0)}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {promoterStats.reduce((sum, p) => sum + p.addedCount, 0)}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {promoterStats.reduce((sum, p) => sum + p.dealedCount, 0)}
                      </td>
                      <td className="px-4 py-3 text-center">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 访客管理 */}
        {activeTab === 'visitorList' && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-semibold">访客管理</h2>
                <p className="text-sm text-gray-500 mt-1">
                  共 {visitorRecords.filter(v => v.wechat).length} 人留微信
                  {visitorRecords.filter(v => v.wechat && v.status === 'added').length > 0 && 
                    ` | 已添加 ${visitorRecords.filter(v => v.wechat && v.status === 'added').length} 人`}
                  {visitorRecords.filter(v => v.wechat && v.status === 'dealed').length > 0 && 
                    ` | 已成交 ${visitorRecords.filter(v => v.wechat && v.status === 'dealed').length} 人`}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select 
                  value={filterPromoter} 
                  onChange={(e) => setFilterPromoter(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="">全部推广者</option>
                  {promoters.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="">全部状态</option>
                  <option value="pending">待处理</option>
                  <option value="added">已添加</option>
                  <option value="dealed">已成交</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <p className="text-gray-500">加载中...</p>
            ) : visitorRecords.filter(v => v.wechat).length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-2">暂无留微信的访客</p>
                <p className="text-sm text-gray-400">访客在推广页面提交微信后会显示在这里</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">推广者</th>
                      <th className="px-4 py-3 text-left">微信/电话</th>
                      <th className="px-4 py-3 text-left">状态</th>
                      <th className="px-4 py-3 text-left">时间</th>
                      <th className="px-4 py-3 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorRecords.filter(v => v.wechat).map((v) => (
                      <tr key={v.id} className="border-t">
                        <td className="px-4 py-3">{v.promoters?.name || v.promoter_code}</td>
                        <td className="px-4 py-3 font-medium">{v.wechat || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            v.status === 'dealed' ? 'bg-green-100 text-green-700' :
                            v.status === 'added' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {v.status === 'dealed' ? '已成交' : 
                             v.status === 'added' ? '已添加' : '待处理'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(v.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {v.wechat ? (
                            <div className="flex gap-1 flex-wrap">
                              <button 
                                onClick={() => updateVisitorStatus(v.id, 'added')}
                                className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                                  v.status === 'added' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                已添加微信
                              </button>
                              <button 
                                onClick={() => updateVisitorStatus(v.id, 'dealed')}
                                className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                                  v.status === 'dealed' 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                已成交
                              </button>
                              {(v.status === 'added' || v.status === 'dealed') && (
                                <button 
                                  onClick={() => updateVisitorStatus(v.id, 'pending')}
                                  className="text-xs px-3 py-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium"
                                >
                                  重置
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">无微信</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <Link href="/" className="text-blue-500 hover:underline">← 返回首页</Link>
        </div>
      </div>
    </div>
  );
}
