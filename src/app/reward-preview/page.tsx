'use client';

import { useState } from 'react';

export default function RewardPreview() {
  const [type, setType] = useState<'100' | '300'>('100');
  const [verifiedCount, setVerifiedCount] = useState(0);

  // 计算当前位置（300版本）
  const currentPosition = verifiedCount % 3;

  // 计算累计奖励（100版本）
  const totalReward = verifiedCount * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="max-w-md mx-auto">
        {/* 控制面板 */}
        <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 p-4">
          <h1 className="text-white font-bold text-xl mb-4">奖励规则预览</h1>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setType('100')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                type === '100'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              100元版本
            </button>
            <button
              onClick={() => setType('300')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                type === '300'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              300元版本
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-slate-300 text-sm">已核销人数：</label>
            <input
              type="number"
              value={verifiedCount}
              onChange={(e) => setVerifiedCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              min="0"
            />
          </div>
        </div>

        {/* 奖励规则展示 */}
        {type === '100' ? (
          // 100元版本：稳定奖励计划
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            {/* 标题 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">💰</span>
              <h2 className="text-white font-semibold text-lg">稳定奖励计划</h2>
            </div>

            {/* 规则说明 */}
            <div className="mb-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-3 border border-blue-400/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📊</span>
                <p className="text-blue-200 text-sm font-semibold">收益稳定</p>
              </div>
              <p className="text-blue-100 text-sm">每次消费：100元奖励</p>
              <p className="text-blue-100 text-sm">不限制消费次数</p>
            </div>

            {/* 三个卡片 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-white/10 p-4 text-center border border-blue-400/30">
                <p className="text-blue-200 text-xs mb-2">第1次</p>
                <p className="text-blue-400 text-2xl font-bold">100元</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 text-center border border-blue-400/30">
                <p className="text-blue-200 text-xs mb-2">第2次</p>
                <p className="text-blue-400 text-2xl font-bold">100元</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 text-center border border-blue-400/30">
                <p className="text-blue-200 text-xs mb-2">第3次</p>
                <p className="text-blue-400 text-2xl font-bold">100元</p>
              </div>
            </div>

            {/* 标识点（全绿色，表示稳定） */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
            </div>

            {/* 当前位置 */}
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-sm">
                当前累计消费：<span className="text-white font-semibold">{verifiedCount}</span> 次
              </p>
              <p className="text-blue-300 text-base">
                已获得：<span className="font-bold text-xl">{totalReward}</span> 元
              </p>
            </div>
          </div>
        ) : (
          // 300元版本：奖励规则
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            {/* 标题 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">🎁</span>
              <h2 className="text-white font-semibold text-lg">奖励规则</h2>
            </div>

            {/* 规则说明 */}
            <p className="text-slate-400 text-sm mb-4 text-center">每3人一轮，循环计算</p>

            {/* 三个卡片 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-white/5 p-4 text-center border-2 border-green-400">
                <p className="text-slate-400 text-xs mb-2">第1人</p>
                <p className="text-green-400 text-2xl font-bold">100元</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center border-2 border-blue-400">
                <p className="text-slate-400 text-xs mb-2">第2人</p>
                <p className="text-blue-400 text-2xl font-bold">200元</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center border-2 border-purple-400">
                <p className="text-slate-400 text-xs mb-2">第3人</p>
                <p className="text-purple-400 text-2xl font-bold">300元</p>
              </div>
            </div>

            {/* 轮次标识点 */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <div className="w-4 h-4 rounded-full bg-blue-400"></div>
              <div className="w-4 h-4 rounded-full bg-purple-400"></div>
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <div className="w-4 h-4 rounded-full bg-blue-400"></div>
              <div className="w-4 h-4 rounded-full bg-purple-400"></div>
            </div>

            {/* 当前位置 */}
            <p className="text-slate-400 text-sm text-center">
              您当前位于第 {currentPosition} 位
            </p>
          </div>
        )}

        {/* 说明文字 */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs sm:text-sm">
            点击上方按钮切换不同版本预览
          </p>
        </div>
      </div>
    </div>
  );
}
