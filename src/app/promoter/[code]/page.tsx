'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PromoterPage() {
  const params = useParams();
  const code = params.code as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (!code) return;

    fetch(`/api/promoter/${code}`)
      .then(res => res.json())
      .then(result => {
        if (result.data) {
          setData(result.data);
          setQrCodeUrl(`/api/promoter/${code}/qrcode`);
        } else {
          setError(result.error || '获取数据失败');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('获取数据失败');
        setLoading(false);
      });
  }, [code]);

  const copyLink = () => {
    const url = `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(url);
    alert('链接已复制');
  };

  const downloadQR = () => {
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `推广二维码_${code}.png`;
    a.click();
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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-white mb-3">推广者不存在</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const visitors = data.visitorRecords || [];
  const visitorsWithWechat = visitors.filter((v: any) => v.wechat_id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:px-6">
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">推广者后台</h1>
          <p className="text-slate-400 text-sm sm:text-base">欢迎, {data.promoter?.name}!</p>
        </div>

        {/* 微信提示 */}
        <div className="mb-5 rounded-xl bg-amber-500/20 border border-amber-500/30 p-3 sm:p-4">
          <p className="text-amber-200 text-sm sm:text-base">
            <strong>微信使用说明：</strong>由于微信限制，建议下载二维码图片发朋友圈
          </p>
        </div>

        {/* 二维码卡片 */}
        <div className="mb-5 rounded-2xl bg-white/10 border border-white/10 p-4 sm:p-6 backdrop-blur-sm">
          <h2 className="text-white font-semibold text-base sm:text-lg mb-4">推广二维码</h2>
          <div className="flex justify-center mb-4">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="二维码"
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg"
              />
            )}
          </div>
          <button
            onClick={downloadQR}
            className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30"
          >
            下载二维码
          </button>
        </div>

        {/* 推广链接卡片 */}
        <div className="mb-5 rounded-2xl bg-white/10 border border-white/10 p-4 sm:p-6 backdrop-blur-sm">
          <h2 className="text-white font-semibold text-base sm:text-lg mb-4">推广链接</h2>
          <div className="bg-white/5 rounded-lg p-3 sm:p-4 mb-4 border border-white/10">
            <p className="text-blue-300 text-sm sm:text-base break-all font-mono">
              {typeof window !== 'undefined' ? window.location.origin : 'https://www.ljjf.fun'}/p/{code}
            </p>
          </div>
          <button
            onClick={copyLink}
            className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/30"
          >
            复制链接
          </button>
        </div>

        {/* 统计数据 */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 sm:p-4 text-center shadow-lg shadow-cyan-500/25">
            <p className="text-white text-2xl sm:text-3xl font-bold">{data.stats?.uniqueVisitors || 0}</p>
            <p className="text-white/80 text-xs sm:text-sm mt-1">独立访客</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-3 sm:p-4 text-center shadow-lg shadow-violet-500/25">
            <p className="text-white text-2xl sm:text-3xl font-bold">{data.stats?.totalVisits || 0}</p>
            <p className="text-white/80 text-xs sm:text-sm mt-1">总访问量</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 sm:p-4 text-center shadow-lg shadow-emerald-500/25">
            <p className="text-white text-2xl sm:text-3xl font-bold">{data.stats?.wechatSubmissions || 0}</p>
            <p className="text-white/80 text-xs sm:text-sm mt-1">留微信号</p>
          </div>
        </div>

        {/* 留微信号的访客 */}
        {visitorsWithWechat.length > 0 && (
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-4 sm:p-6">
            <h3 className="text-emerald-200 font-semibold text-base sm:text-lg mb-3">
              有 {visitorsWithWechat.length} 位访客留下微信号
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {visitorsWithWechat.map((v: any, i: number) => (
                <div key={i} className="rounded-xl bg-white/10 p-3 sm:p-4 border border-white/10">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm sm:text-base font-medium mb-1">
                        微信号: <span className="text-emerald-300">{v.wechat_id}</span>
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm">{v.created_at}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(v.wechat_id);
                        alert('已复制');
                      }}
                      className="flex-shrink-0 py-1.5 px-3 sm:px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
                    >
                      复制
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 访客记录 */}
        <div className="rounded-2xl bg-white/10 border border-white/10 p-4 sm:p-6 backdrop-blur-sm">
          <h2 className="text-white font-semibold text-base sm:text-lg mb-4">访客记录</h2>
          {visitors.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm sm:text-base">暂无访客记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visitors.slice(0, 10).map((v: any, i: number) => (
                <div key={i} className="rounded-xl bg-white/5 p-3 sm:p-4 border border-white/10">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm sm:text-base font-medium mb-1">
                        微信号: <span className="text-slate-300">{v.wechat_id || '-'}</span>
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm">{v.created_at}</p>
                    </div>
                    {v.wechat_id && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(v.wechat_id);
                          alert('已复制');
                        }}
                        className="flex-shrink-0 py-1.5 px-3 sm:px-4 bg-white/10 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-white/20 transition-all duration-200"
                      >
                        复制
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs sm:text-sm">玲姐假发 · 专业假发定制</p>
        </div>
      </div>
    </div>
  );
}
