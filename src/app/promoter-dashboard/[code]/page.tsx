'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  const router = useRouter();
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
      // 获取推广者信息
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
        
        // 获取访客记录
        const visitorsRes = await fetch(`/api/promoter/${code}/visitors`);
        const visitorsData = await visitorsRes.json();
        if (visitorsData.success) {
          setVisitors(visitorsData.data || []);
        }
      } else {
        alert('推广者不存在');
        router.push('/');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-lg mb-6">
          <h1 className="text-2xl font-bold mb-2">推广者中心</h1>
          <p className="opacity-90">推广者：{promoter?.name} | 推广码：{code}</p>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded ${activeTab === 'stats' ? 'bg-pink-500 text-white' : 'bg-white'}`}
          >
            数据统计
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`px-4 py-2 rounded ${activeTab === 'visitors' ? 'bg-pink-500 text-white' : 'bg-white'}`}
          >
            访客记录 ({visitors.filter(v => v.hasWechat).length})
          </button>
        </div>

        {/* 统计数据 */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg text-center shadow">
              <p className="text-3xl font-bold text-blue-600">{stats.totalVisitors}</p>
              <p className="text-gray-600 text-sm mt-1">总访问次数</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow">
              <p className="text-3xl font-bold text-green-600">{stats.uniqueVisitors}</p>
              <p className="text-gray-600 text-sm mt-1">独立访客</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow">
              <p className="text-3xl font-bold text-orange-600">{stats.wechatSubmissions}</p>
              <p className="text-gray-600 text-sm mt-1">留微信数</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow">
              <p className="text-3xl font-bold text-purple-600">{stats.addedCount}</p>
              <p className="text-gray-600 text-sm mt-1">已添加</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow">
              <p className="text-3xl font-bold text-red-600">{stats.dealedCount}</p>
              <p className="text-gray-600 text-sm mt-1">已成交</p>
            </div>
          </div>
        )}

        {/* 访客记录 */}
        {activeTab === 'visitors' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {visitors.filter(v => v.hasWechat).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                暂无留微信的访客
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">访客编号</th>
                      <th className="px-4 py-3 text-left text-sm">状态</th>
                      <th className="px-4 py-3 text-left text-sm">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.filter(v => v.hasWechat).map((v, index) => (
                      <tr key={v.id} className="border-t">
                        <td className="px-4 py-3 font-medium">访客 #{index + 1}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 底部链接 */}
        <div className="mt-6 text-center">
          <a href="/" className="text-pink-500 hover:underline">返回首页</a>
        </div>
      </div>
    </div>
  );
}
