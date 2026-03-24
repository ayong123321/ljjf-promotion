'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

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

interface VisitorStats {
  totalVisitors: number;
  uniqueVisitors: number;
  wechatSubmissions: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'promoters' | 'contents' | 'visitors'>('promoters');
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({ totalVisitors: 0, uniqueVisitors: 0, wechatSubmissions: 0 });
  const [loading, setLoading] = useState(false);
  const [newPromoter, setNewPromoter] = useState({ name: '', phone: '' });
  const [showAddPromoter, setShowAddPromoter] = useState(false);
  const [newContent, setNewContent] = useState({ 
    type: 'image' as 'image' | 'video', 
    title: '', 
    description: '', 
    url: '',
    uploadType: 'file' as 'file' | 'link' // 上传方式
  });
  const [showAddContent, setShowAddContent] = useState(false);
  const [qrcodePromoter, setQrcodePromoter] = useState<Promoter | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'promoters') fetchPromoters();
    else if (activeTab === 'contents') fetchContents();
    else if (activeTab === 'visitors') fetchVisitorStats();
  }, [activeTab]);

  const fetchPromoters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promoters');
      const data = await res.json();
      if (data.success) setPromoters(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/contents');
      const data = await res.json();
      if (data.success) setContents(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchVisitorStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setVisitorStats(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

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

  // 文件上传处理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', newContent.type);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setNewContent({ ...newContent, url: data.data.url });
        alert('上传成功！');
      } else {
        alert('上传失败：' + data.error);
      }
    } catch (e) {
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      // 清空文件选择
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

  // 复制到剪贴板（兼容手机）
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

  const getPromotionUrl = (code: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/p/${code}`;
    }
    return `/p/${code}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">管理后台</h1>
        
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
        </div>

        {/* 二维码弹窗 */}
        {qrcodePromoter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrcodePromoter(null)}>
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 text-center">{qrcodePromoter.name} 的推广二维码</h3>
              <div className="bg-white p-4 flex justify-center">
                <img 
                  src={`/api/qrcode?url=${encodeURIComponent(getPromotionUrl(qrcodePromoter.code))}`} 
                  alt="推广二维码" 
                  className="w-48 h-48 md:w-64 md:h-64"
                />
              </div>
              <p className="text-center text-gray-600 mt-2">推广码: {qrcodePromoter.code}</p>
              <p className="text-center text-sm text-gray-500 mt-1">扫码访问推广页面</p>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => copyToClipboard(getPromotionUrl(qrcodePromoter.code))}
                  className="flex-1 bg-blue-500 text-white py-3 rounded font-medium"
                >
                  复制链接
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
                {/* 类型选择 */}
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

                {/* 上传方式选择 - 仅视频显示 */}
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
                  
                  {/* 文件上传 */}
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
                          : '支持 MP4、MOV、AVI、WebM，最大 100MB'}
                      </p>
                    </div>
                  )}
                  
                  {/* 链接输入 - 仅视频 */}
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

        {/* 数据统计 */}
        {activeTab === 'visitors' && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h2 className="text-lg md:text-xl font-semibold mb-6">数据统计</h2>
            {loading ? (
              <p className="text-gray-500">加载中...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">{visitorStats.totalVisitors}</p>
                  <p className="text-gray-600 mt-2">总访问次数</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <p className="text-3xl md:text-4xl font-bold text-green-600">{visitorStats.uniqueVisitors}</p>
                  <p className="text-gray-600 mt-2">独立访客数</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg text-center">
                  <p className="text-3xl md:text-4xl font-bold text-orange-600">{visitorStats.wechatSubmissions}</p>
                  <p className="text-gray-600 mt-2">留资人数</p>
                </div>
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
