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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6">
        {/* 头部卡片 */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50"></div>
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm mb-1">推广者</p>
                <h1 className="text-2xl font-bold text-white">{promoter?.name}</h1>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
              <svg className="w-5 h-5 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span className="text-white font-mono text-lg tracking-wider">{code}</span>
            </div>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 ${
              activeTab === 'stats' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              数据统计
            </div>
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 relative ${
              activeTab === 'visitors' 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              访客记录
              {visitors.filter(v => v.hasWechat).length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {visitors.filter(v => v.hasWechat).length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* 统计数据 */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* 主要数据卡片 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-400 p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.totalVisitors}</p>
                  <p className="text-blue-100 text-sm">总访问次数</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-emerald-500 to-teal-400 p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.uniqueVisitors}</p>
                  <p className="text-emerald-100 text-sm">独立访客</p>
                </div>
              </div>
            </div>

            {/* 留微信卡片 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-amber-400 p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">留微信数</p>
                    <p className="text-5xl font-bold text-white">{stats.wechatSubmissions}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 01.176-.554C23.063 18.065 24 16.358 24 14.488c0-3.06-2.973-5.578-7.062-5.63zm-2.745 2.678c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.842 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 成交数据 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-violet-500 to-purple-400 p-5 rounded-2xl">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.addedCount}</p>
                  <p className="text-violet-100 text-sm">已添加微信</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-rose-500 to-pink-400 p-5 rounded-2xl">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.dealedCount}</p>
                  <p className="text-rose-100 text-sm">已成交</p>
                </div>
              </div>
            </div>

            {/* 转化率 */}
            {stats.wechatSubmissions > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/80 text-sm">成交转化率</span>
                  <span className="text-2xl font-bold text-white">
                    {Math.round((stats.dealedCount / stats.wechatSubmissions) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((stats.dealedCount / stats.wechatSubmissions) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 访客记录 */}
        {activeTab === 'visitors' && (
          <div className="space-y-3">
            {visitors.filter(v => v.hasWechat).length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-white/60 text-lg">暂无留微信的访客</p>
                <p className="text-white/40 text-sm mt-2">分享您的推广链接，开始收集访客信息</p>
              </div>
            ) : (
              visitors.filter(v => v.hasWechat).map((v, index) => (
                <div 
                  key={v.id} 
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">访客 #{index + 1}</p>
                        <p className="text-white/50 text-sm">{new Date(v.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-sm font-medium ${
                      v.status === 'dealed' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white' 
                        : v.status === 'added' 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                          : 'bg-white/20 text-white/70'
                    }`}>
                      {v.status === 'dealed' ? '已成交' : v.status === 'added' ? '已添加' : '待处理'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 底部品牌 */}
        <div className="mt-8 text-center">
          <p className="text-white/30 text-xs">玲姐假发 · 专业假发定制</p>
        </div>
      </div>
    </div>
  );
}
