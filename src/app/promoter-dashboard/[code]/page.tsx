'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface VisitorRecord {
  id: number;
  promoter_code: string;
  hasWechat: boolean;
  wechatMasked: string | null;
  ip: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalVisitors: number;
  uniqueVisitors: number;
  wechatSubmissions: number;
  addedCount: number;
  dealedCount: number;
}

export default function PromoterDashboard() {
  const params = useParams();
  const code = params.code as string;
  
  const [loading, setLoading] = useState(true);
  const [promoter, setPromoter] = useState<{ name: string; code: string } | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    wechatSubmissions: 0,
    addedCount: 0,
    dealedCount: 0
  });
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'visitors'>('stats');

  useEffect(() => {
    fetchPromoterData();
  }, [code]);

  const fetchPromoterData = async () => {
    try {
      const res = await fetch(`/api/promoter/${code}`);
      const data = await res.json();
      
      if (data.data) {
        setPromoter(data.data.promoter);
        setStats({
          totalVisitors: data.data.stats.totalVisits,
          uniqueVisitors: data.data.stats.uniqueVisitors,
          wechatSubmissions: data.data.stats.wechatSubmissions,
          addedCount: data.data.stats.addedCount || 0,
          dealedCount: data.data.stats.dealedCount || 0
        });
        
        const visitorsRes = await fetch(`/api/promoter/${code}/visitors`);
        const visitorsData = await visitorsRes.json();
        if (visitorsData.success) {
          setVisitors(visitorsData.data || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间为友好的格式
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-violet-500/30 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-t-violet-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-violet-300 text-lg mt-6 font-light">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 relative overflow-x-hidden">
      {/* 装饰性背景光晕 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-600/30 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-cyan-600/20 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-amber-600/15 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 pb-10">
        {/* 顶部状态栏占位 */}
        <div className="h-2"></div>
        
        {/* 头部信息卡片 */}
        <div className="relative mb-6 mt-2">
          {/* 发光效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 rounded-3xl blur-xl opacity-40"></div>
          
          {/* 主卡片 */}
          <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            {/* 顶部渐变装饰条 */}
            <div className="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"></div>
            
            <div className="p-5">
              {/* 用户信息行 */}
              <div className="flex items-center gap-4 mb-5">
                {/* 头像 */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                
                {/* 名称 */}
                <div className="flex-1">
                  <p className="text-white/50 text-xs mb-0.5">推广者</p>
                  <h1 className="text-xl font-bold text-white tracking-wide">{promoter?.name}</h1>
                </div>
              </div>
              
              {/* 推广码 */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl px-4 py-3 border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white/40 text-xs">推广码</p>
                  <p className="text-white font-mono text-lg tracking-widest font-medium">{code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-6 bg-white/5 backdrop-blur-sm rounded-2xl p-1.5 border border-white/5">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'stats' 
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25' 
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span>数据统计</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative ${
              activeTab === 'visitors' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25' 
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span>访客记录</span>
              {visitors.filter(v => v.hasWechat).length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                  {visitors.filter(v => v.hasWechat).length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* 统计数据 */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* 核心数据 - 大卡片展示 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 总访问 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-bl-full"></div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-white mb-0.5">{stats.totalVisitors}</p>
                    <p className="text-white/50 text-sm">总访问次数</p>
                  </div>
                </div>
              </div>

              {/* 独立访客 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full"></div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-white mb-0.5">{stats.uniqueVisitors}</p>
                    <p className="text-white/50 text-sm">独立访客</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 留微信数 - 突出显示 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 overflow-hidden">
                {/* 背景装饰 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-500/10 to-transparent rounded-tr-full"></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/>
                        </svg>
                      </div>
                      <span className="text-white/70 text-sm font-medium">留微信数</span>
                    </div>
                    <p className="text-5xl font-bold bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                      {stats.wechatSubmissions}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/20 flex items-center justify-center">
                    <svg className="w-9 h-9 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 成交漏斗数据 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 已添加 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-violet-500/20 to-transparent rounded-bl-full"></div>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-2.5 shadow-lg shadow-violet-500/30">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-white mb-0.5">{stats.addedCount}</p>
                    <p className="text-white/50 text-sm">已添加微信</p>
                  </div>
                </div>
              </div>

              {/* 已成交 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-rose-500/20 to-transparent rounded-bl-full"></div>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-2.5 shadow-lg shadow-rose-500/30">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-white mb-0.5">{stats.dealedCount}</p>
                    <p className="text-white/50 text-sm">已成交</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 转化率进度条 */}
            {stats.wechatSubmissions > 0 && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                      </div>
                      <span className="text-white/70 text-sm font-medium">成交转化率</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                      {Math.round((stats.dealedCount / stats.wechatSubmissions) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 rounded-full transition-all duration-700 relative overflow-hidden"
                      style={{ width: `${Math.min(100, Math.round((stats.dealedCount / stats.wechatSubmissions) * 100))}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 访客记录 */}
        {activeTab === 'visitors' && (
          <div className="space-y-3">
            {visitors.filter(v => v.hasWechat).length === 0 ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <p className="text-white/50 text-lg font-medium mb-2">暂无留微信的访客</p>
                  <p className="text-white/30 text-sm">分享您的推广链接，开始收集访客信息</p>
                </div>
              </div>
            ) : (
              visitors.filter(v => v.hasWechat).map((v, index) => (
                <div 
                  key={v.id} 
                  className="relative group"
                >
                  <div className={`absolute inset-0 rounded-2xl blur-lg opacity-30 transition-opacity ${
                    v.status === 'dealed' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                      : v.status === 'added' 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-white/10 to-white/20'
                  } group-hover:opacity-50`}></div>
                  <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/30">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">访客 #{index + 1}</p>
                          <p className="text-white/40 text-sm">{formatTime(v.created_at)}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-sm font-medium shadow-lg ${
                        v.status === 'dealed' 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30' 
                          : v.status === 'added' 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30'
                            : 'bg-white/10 text-white/60 border border-white/10'
                      }`}>
                        {v.status === 'dealed' ? '已成交' : v.status === 'added' ? '已添加' : '待处理'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 底部品牌 */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
            <p className="text-white/30 text-xs">玲姐假发 · 专业假发定制</p>
          </div>
        </div>
      </div>

      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
