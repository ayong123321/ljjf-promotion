'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 推广者类型
interface Promoter {
  id: string;
  name: string;
  phone: string;
  code: string;
  created_at: string;
}

// 内容类型
interface Content {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  url: string;
  created_at: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'promoters' | 'contents' | 'visitors'>('promoters');
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 添加推广者表单
  const [newPromoter, setNewPromoter] = useState({ name: '', phone: '' });
  const [showAddPromoter, setShowAddPromoter] = useState(false);
  
  // 添加内容表单
  const [newContent, setNewContent] = useState({ 
    type: 'image' as 'image' | 'video', 
    title: '', 
    description: '', 
    url: '' 
  });
  const [showAddContent, setShowAddContent] = useState(false);

  // 加载数据
  useEffect(() => {
    if (activeTab === 'promoters') {
      fetchPromoters();
    } else if (activeTab === 'contents') {
      fetchContents();
    }
  }, [activeTab]);

  // 获取推广者列表
  const fetchPromoters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promoters');
      const data = await res.json();
      if (data.success) {
        setPromoters(data.data || []);
      }
    } catch (error) {
      console.error('获取推广者失败:', error);
    }
    setLoading(false);
  };

  // 获取内容列表
  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/contents');
      const data = await res.json();
      if (data.success) {
        setContents(data.data || []);
      }
    } catch (error) {
      console.error('获取内容失败:', error);
    }
    setLoading(false);
  };

  // 添加推广者
  const addPromoter = async () => {
    if (!newPromoter.name.trim()) {
      alert('请输入姓名');
      return;
    }
    
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
      } else {
        alert('添加失败：' + data.error);
      }
    } catch (error) {
      alert('添加失败');
    }
  };

  // 添加内容
  const addContent = async () => {
    if (!newContent.title.trim() || !newContent.url.trim()) {
      alert('请填写标题和链接');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent)
      });
      const data = await res.json();
      
      if (data.success) {
        setNewContent({ type: 'image', title: '', description: '', url: '' });
        setShowAddContent(false);
        fetchContents();
        alert('添加成功！');
      } else {
        alert('添加失败：' + data.error);
      }
    } catch (error) {
      alert('添加失败');
    }
  };

  // 删除推广者
  const deletePromoter = async (id: string) => {
    if (!confirm('确定要删除这个推广者吗？')) return;
    
    try {
      const res = await fetch(`/api/admin/promoters?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchPromoters();
      } else {
        alert('删除失败：' + data.error);
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  // 删除内容
  const deleteContent = async (id: string) => {
    if (!confirm('确定要删除这个内容吗？')) return;
    
    try {
      const res = await fetch(`/api/admin/contents?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchContents();
      } else {
        alert('删除失败：' + data.error);
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">管理后台</h1>
        
        {/* 标签切换 */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('promoters')}
            className={`px-4 py-2 rounded ${activeTab === 'promoters' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            推广者管理 ({promoters.length})
          </button>
          <button 
            onClick={() => setActiveTab('contents')}
            className={`px-4 py-2 rounded ${activeTab === 'contents' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            内容管理 ({contents.length})
          </button>
          <button 
            onClick={() => setActiveTab('visitors')}
            className={`px-4 py-2 rounded ${activeTab === 'visitors' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            访客记录
          </button>
        </div>

        {/* 推广者管理 */}
        {activeTab === 'promoters' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">推广者列表</h2>
              <button 
                onClick={() => setShowAddPromoter(!showAddPromoter)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {showAddPromoter ? '取消' : '+ 添加推广者'}
              </button>
            </div>

            {/* 添加表单 */}
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
                      placeholder="请输入姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">电话</label>
                    <input 
                      type="text" 
                      value={newPromoter.phone}
                      onChange={(e) => setNewPromoter({...newPromoter, phone: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="请输入电话"
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

            {/* 列表 */}
            {loading ? (
              <p className="text-gray-500">加载中...</p>
            ) : promoters.length === 0 ? (
              <p className="text-gray-500">暂无推广者，点击上方按钮添加</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
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
                        <td className="px-4 py-2">{p.name}</td>
                        <td className="px-4 py-2">{p.phone || '-'}</td>
                        <td className="px-4 py-2">
                          <code className="bg-gray-100 px-2 py-1 rounded">{p.code}</code>
                        </td>
                        <td className="px-4 py-2">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <button 
                            onClick={() => deletePromoter(p.id)}
                            className="text-red-500 hover:underline"
                          >
                            删除
                          </button>
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
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">内容列表</h2>
              <button 
                onClick={() => setShowAddContent(!showAddContent)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {showAddContent ? '取消' : '+ 添加内容'}
              </button>
            </div>

            {/* 添加表单 */}
            {showAddContent && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">类型</label>
                    <select 
                      value={newContent.type}
                      onChange={(e) => setNewContent({...newContent, type: e.target.value as 'image' | 'video'})}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="image">图片</option>
                      <option value="video">视频</option>
                    </select>
                  </div>
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
                      placeholder="请输入描述"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">链接地址 *</label>
                    <input 
                      type="text" 
                      value={newContent.url}
                      onChange={(e) => setNewContent({...newContent, url: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="请输入图片或视频链接地址"
                    />
                  </div>
                </div>
                <button 
                  onClick={addContent}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                >
                  保存
                </button>
              </div>
            )}

            {/* 列表 */}
            {loading ? (
              <p className="text-gray-500">加载中...</p>
            ) : contents.length === 0 ? (
              <p className="text-gray-500">暂无内容，点击上方按钮添加</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contents.map((c) => (
                  <div key={c.id} className="border rounded p-4">
                    {c.type === 'image' ? (
                      <img src={c.url} alt={c.title} className="w-full h-32 object-cover rounded mb-2" />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                    <h3 className="font-medium">{c.title}</h3>
                    <p className="text-sm text-gray-500">{c.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {c.type === 'image' ? '图片' : '视频'} · {new Date(c.created_at).toLocaleDateString()}
                    </p>
                    <button 
                      onClick={() => deleteContent(c.id)}
                      className="mt-2 text-red-500 text-sm hover:underline"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 访客记录 */}
        {activeTab === 'visitors' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">访客记录</h2>
            <p className="text-gray-500">访客记录将在推广页面被访问时自动生成</p>
          </div>
        )}

        {/* 返回首页 */}
        <div className="mt-6">
          <Link href="/" className="text-blue-500 hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
