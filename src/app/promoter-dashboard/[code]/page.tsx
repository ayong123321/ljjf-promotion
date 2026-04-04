'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  verifiedCount: number; // 已核销数
  pendingCashback: number; // 待返现金额
  totalCashback: number; // 已返现金额
}

export default function PromoterDashboard() {
  const params = useParams();
  const code = params.code as string;
  
  const [loading, setLoading] = useState(true);
  const [promoter, setPromoter] = useState<{ name: string; code: string; cashbackRuleType?: string } | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    wechatSubmissions: 0,
    addedCount: 0,
    dealedCount: 0,
    verifiedCount: 0,
    pendingCashback: 0,
    totalCashback: 0
  });
  const [prevStats, setPrevStats] = useState<Stats | null>(null);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'visitors'>('stats');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [highlightKey, setHighlightKey] = useState(0);
  const prevStatsRef = useRef<Stats | null>(null);

  const fetchPromoterData = useCallback(async (isInitial = false) => {
    if (!isInitial) {
      setIsUpdating(true);
    }
    
    try {
      const res = await fetch(`/api/promoter/${code}`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      
      if (data.data) {
        // 保存旧数据用于对比
        prevStatsRef.current = stats;
        
        setPromoter(data.data.promoter);
        
        // 获取核销和返现统计
        const cashbackRes = await fetch(`/api/promoter/${code}/cashback`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const cashbackData = await cashbackRes.json();
        
        const newStats = {
          totalVisitors: data.data.stats.totalVisits,
          uniqueVisitors: data.data.stats.uniqueVisitors,
          wechatSubmissions: data.data.stats.wechatSubmissions,
          addedCount: data.data.stats.addedCount || 0,
          dealedCount: data.data.stats.dealedCount || 0,
          verifiedCount: cashbackData.data?.verifiedCount || 0,
          pendingCashback: cashbackData.data?.pendingCashback || 0,
          totalCashback: cashbackData.data?.totalCashback || 0
        };
        
        // 检测数据变化
        if (JSON.stringify(newStats) !== JSON.stringify(stats)) {
          setPrevStats(stats);
          setStats(newStats);
          setHighlightKey(k => k + 1);
        }
        
        const visitorsRes = await fetch(`/api/promoter/${code}/visitors`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const visitorsData = await visitorsRes.json();
        if (visitorsData.success) {
          setVisitors(visitorsData.data || []);
        }
        
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  }, [code, stats]);

  // 初始加载
  useEffect(() => {
    fetchPromoterData(true);
  }, [code]);

  // 实时更新：每3秒轮询一次
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPromoterData(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchPromoterData]);

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

  // 检查数据是否变化
  const hasChanged = (key: keyof Stats) => {
    if (!prevStats) return false;
    return prevStats[key] !== stats[key];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-400/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-indigo-200 text-base mt-5">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      <div className="max-w-md mx-auto px-4 py-5">
        
        {/* 头部：推广者信息 + 实时状态 */}
        <div className="mb-5">
          <div className="flex items-center gap-4 mb-4">
            {/* 头像 */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/40">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            {/* 名称和推广码 */}
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-1">推广者</p>
              <h1 className="text-2xl font-bold text-white mb-1">{promoter?.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-sm">推广码</span>
                <span className="text-white font-mono text-base tracking-wider font-semibold bg-white/10 px-2 py-0.5 rounded">{code}</span>
              </div>
            </div>
          </div>
          
          {/* 实时状态指示器 */}
          <div className="flex items-center justify-center gap-2 text-sm">
            {isUpdating ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>正在更新...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>实时更新中 · 每3秒刷新</span>
              </div>
            )}
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-5 bg-white/5 rounded-2xl p-1.5">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3.5 px-4 rounded-xl font-semibold text-base transition-all ${
              activeTab === 'stats' 
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30' 
                : 'text-slate-400'
            }`}
          >
            数据统计
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex-1 py-3.5 px-4 rounded-xl font-semibold text-base transition-all relative ${
              activeTab === 'visitors' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                : 'text-slate-400'
            }`}
          >
            访客记录
            {visitors.filter(v => v.hasWechat).length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {visitors.filter(v => v.hasWechat).length}
              </span>
            )}
          </button>
        </div>

        {/* 统计数据 */}
        {activeTab === 'stats' && (
          <div className="space-y-4" key={highlightKey}>
            
            {/* 核心指标：留微信数 - 最大最醒目 */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 shadow-xl shadow-orange-500/30 transition-all duration-500 ${hasChanged('wechatSubmissions') ? 'ring-4 ring-white/50 scale-105' : ''}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-base font-medium mb-2">留微信数</p>
                  <p className="text-6xl font-bold text-white transition-all duration-300">{stats.wechatSubmissions}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* 两列数据 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 总访问 */}
              <div className={`rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 shadow-lg shadow-cyan-500/25 transition-all duration-500 ${hasChanged('totalVisitors') ? 'ring-2 ring-white/50' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm">总访问</span>
                </div>
                <p className="text-4xl font-bold text-white transition-all duration-300">{stats.totalVisitors}</p>
              </div>

              {/* 独立访客 */}
              <div className={`rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg shadow-emerald-500/25 transition-all duration-500 ${hasChanged('uniqueVisitors') ? 'ring-2 ring-white/50' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm">独立访客</span>
                </div>
                <p className="text-4xl font-bold text-white transition-all duration-300">{stats.uniqueVisitors}</p>
              </div>
            </div>

            {/* 成交数据 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 已添加 */}
              <div className={`rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-5 shadow-lg shadow-violet-500/25 transition-all duration-500 ${hasChanged('addedCount') ? 'ring-2 ring-white/50' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm">已添加</span>
                </div>
                <p className="text-4xl font-bold text-white transition-all duration-300">{stats.addedCount}</p>
              </div>

              {/* 已成交 */}
              <div className={`rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 shadow-lg shadow-rose-500/25 transition-all duration-500 ${hasChanged('dealedCount') ? 'ring-2 ring-white/50' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm">已成交</span>
                </div>
                <p className="text-4xl font-bold text-white transition-all duration-300">{stats.dealedCount}</p>
              </div>
            </div>

            {/* 核销和返现数据 */}
            {(stats.verifiedCount > 0 || stats.pendingCashback > 0 || stats.totalCashback > 0) && (
              <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4">
                <h3 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  核销与返现
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-white text-2xl font-bold">{stats.verifiedCount}</p>
                    <p className="text-slate-400 text-xs mt-1">已核销</p>
                  </div>
                  <div className="bg-amber-500/20 rounded-xl p-3 border border-amber-500/30">
                    <p className="text-amber-400 text-2xl font-bold">¥{stats.pendingCashback}</p>
                    <p className="text-slate-400 text-xs mt-1">待返现</p>
                  </div>
                  <div className="bg-green-500/20 rounded-xl p-3 border border-green-500/30">
                    <p className="text-green-400 text-2xl font-bold">¥{stats.totalCashback}</p>
                    <p className="text-slate-400 text-xs mt-1">已返现</p>
                  </div>
                </div>
                {/* 奖励规则说明 */}
                {promoter?.cashbackRuleType === 'type_100' ? (
                  // 100版本：稳定奖励计划
                  <div className="mt-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                      <span className="text-lg">💰</span> 稳定奖励计划
                    </h4>
                    <div className="bg-blue-100 rounded-lg p-3 mb-3">
                      <p className="text-blue-900 text-xs font-medium mb-1">📊 收益稳定</p>
                      <p className="text-blue-700 text-sm">每次消费：100元奖励</p>
                      <p className="text-blue-700 text-sm">不限制消费次数</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-500">第1次</p>
                        <p className="text-base font-bold text-blue-600">100元</p>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-500">第2次</p>
                        <p className="text-base font-bold text-blue-600">100元</p>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-500">第3次</p>
                        <p className="text-base font-bold text-blue-600">100元</p>
                      </div>
                    </div>
                    <p className="text-blue-600 text-xs mt-3 text-center">⭐ 适合稳定分享</p>
                  </div>
                ) : (
                  // 300版本：奖励规则
                  <div className="mt-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-4">
                    <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2 text-sm">
                      <span className="text-lg">🎁</span> 奖励规则
                    </h4>
                    <div className="text-purple-700 text-xs mb-2 text-center">每3人一轮，循环计算</div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="bg-white rounded-lg p-2 text-center border-2 border-green-400">
                        <p className="text-xs text-gray-600">第1人</p>
                        <p className="text-lg font-bold text-green-600">100元</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border-2 border-blue-400">
                        <p className="text-xs text-gray-600">第2人</p>
                        <p className="text-lg font-bold text-blue-600">200元</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border-2 border-purple-400">
                        <p className="text-xs text-gray-600">第3人</p>
                        <p className="text-lg font-bold text-purple-600">300元</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    </div>
                    <p className="text-purple-600 text-xs mt-2 text-center">
                      您当前位于第 {((stats.verifiedCount - 1) % 3) + 1} 位
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 转化率 */}
            {stats.wechatSubmissions > 0 && (
              <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 text-base font-medium">成交转化率</span>
                  </div>
                  <span className="text-3xl font-bold text-white">
                    {Math.round((stats.dealedCount / stats.wechatSubmissions) * 100)}%
                  </span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.round((stats.dealedCount / stats.wechatSubmissions) * 100))}%` }}
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
              <div className="rounded-2xl bg-white/5 p-10 text-center border border-white/10">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <p className="text-slate-300 text-lg font-medium mb-2">暂无留微信的访客</p>
                <p className="text-slate-500 text-sm">分享您的推广链接，开始收集访客信息</p>
              </div>
            ) : (
              visitors.filter(v => v.hasWechat).map((v, index) => (
                <div 
                  key={v.id} 
                  className={`rounded-2xl p-4 transition-all duration-300 ${
                    v.status === 'dealed' 
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30' 
                      : v.status === 'added' 
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30'
                        : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                        v.status === 'dealed' 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                          : v.status === 'added' 
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium text-base">访客 #{index + 1}</p>
                        <p className="text-slate-400 text-sm">{formatTime(v.created_at)}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                      v.status === 'dealed' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                        : v.status === 'added' 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-white/10 text-slate-300'
                    }`}>
                      {v.status === 'dealed' ? '已成交' : v.status === 'added' ? '已添加' : '待处理'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 底部 */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-slate-500 text-xs">
            最后更新: {lastUpdate.toLocaleTimeString()}
          </p>
          <p className="text-slate-600 text-sm">玲姐假发 · 专业假发定制</p>
        </div>
      </div>
    </div>
  );
}
