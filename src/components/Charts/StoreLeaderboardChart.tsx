import React, { useState } from 'react';
import { StoreLeaderboardItem } from '../../types/retail';
import { formatCurrency, formatPercent } from '../../utils/dataEngine';
import { Award, AlertTriangle, ArrowUpDown } from 'lucide-react';

interface StoreLeaderboardChartProps {
  data: StoreLeaderboardItem[];
}

export const StoreLeaderboardChart: React.FC<StoreLeaderboardChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'top' | 'bottom' | 'all'>('top');

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center text-slate-400 text-xs">
        No store records found.
      </div>
    );
  }

  // Sorted by achievement descending
  const sorted = [...data].sort((a, b) => b.targetAchievementPct - a.targetAchievementPct);

  let displayedItems: StoreLeaderboardItem[] = [];
  if (viewMode === 'top') {
    displayedItems = sorted.slice(0, 5);
  } else if (viewMode === 'bottom') {
    displayedItems = sorted.slice(-5).reverse(); // show lowest first
  } else {
    displayedItems = sorted;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
      {/* Header with Segmented View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            4. Store Performance Leaderboard
          </h3>
          <p className="text-xs text-slate-500">
            Store rankings ranked by Target Achievement %
          </p>
        </div>

        {/* View mode segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium shrink-0">
          <button
            onClick={() => setViewMode('top')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'top'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" /> Top 5
            </span>
          </button>

          <button
            onClick={() => setViewMode('bottom')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'bottom'
                ? 'bg-white text-rose-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Bottom 5
            </span>
          </button>

          <button
            onClick={() => setViewMode('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({data.length})
          </button>
        </div>
      </div>

      {/* Leaderboard Rows */}
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {displayedItems.map((store, idx) => {
          const hasTarget = store.targetSales > 0;
          const isOver = hasTarget && store.targetAchievementPct >= 100;
          const isSevereMiss = hasTarget && store.targetAchievementPct < 90;

          return (
            <div
              key={store.storeId}
              className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 w-4 text-[11px]">
                    #{viewMode === 'bottom' ? data.length - idx : idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">{store.storeName}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5 font-mono">
                      {store.storeId} · {store.region} · {store.storeFormat}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-slate-900">
                    {formatCurrency(store.netSales)}
                  </span>
                  <span
                    className={`font-semibold text-xs ${
                      !hasTarget
                        ? 'text-slate-400'
                        : isOver
                        ? 'text-emerald-700'
                        : isSevereMiss
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {hasTarget ? formatPercent(store.targetAchievementPct) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Progress bar vs 100% target */}
              <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver ? 'bg-emerald-500' : isSevereMiss ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(100, store.targetAchievementPct)}%`,
                  }}
                />
              </div>

              {/* Variance subtext */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                <span>Target: {formatCurrency(store.targetSales)}</span>
                <span className={store.targetVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {store.targetVariance >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(store.targetVariance))} variance
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
