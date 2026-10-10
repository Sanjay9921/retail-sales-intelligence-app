import React from 'react';
import { CategoryMetric } from '../../types/retail';
import { formatCurrency, formatPercent } from '../../utils/dataEngine';

interface CategoryChartProps {
  data: CategoryMetric[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center text-slate-400 text-xs">
        No category records found.
      </div>
    );
  }

  const totalSales = data.reduce((sum, d) => sum + d.netSales, 0) || 1;
  const maxSales = Math.max(...data.map((d) => d.netSales), 1000);

  // Curated category accents
  const categoryColors: Record<string, string> = {
    'Apparel & Fashion': '#3B82F6', // Blue
    'Consumer Electronics': '#6366F1', // Indigo
    'Footwear & Athletic': '#0EA5E9', // Sky
    'Home & Living': '#14B8A6', // Teal
    'Beauty & Personal Care': '#EC4899', // Pink
    'Accessories & Leather': '#8B5CF6', // Purple
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            3. Product Category Breakdown
          </h3>
          <p className="text-xs text-slate-500">
            Net revenue, portfolio share, and return rate per category
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500">
          Total: {formatCurrency(totalSales)}
        </span>
      </div>

      <div className="space-y-3.5 my-auto">
        {data.map((cat) => {
          const sharePct = (cat.netSales / totalSales) * 100;
          const barWidthPct = Math.min(100, Math.max(5, (cat.netSales / maxSales) * 100));
          const color = categoryColors[cat.category] || '#64748B';
          const isHighReturn = cat.returnRatePct > 10.0;

          return (
            <div key={cat.category} className="group">
              <div className="flex items-center justify-between text-xs mb-1 font-medium">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-semibold text-slate-800 truncate max-w-[180px] sm:max-w-xs">
                    {cat.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-slate-900">{formatCurrency(cat.netSales)}</span>
                  <span className="text-[11px] text-slate-400">({sharePct.toFixed(1)}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${barWidthPct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>

              {/* Category sub-stats */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                <span>
                  Target: {formatCurrency(cat.targetSales)} ({cat.targetSales > 0 ? formatPercent(cat.targetAchievementPct) : 'N/A'})
                </span>
                <span className={isHighReturn ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                  Return: {cat.netSales > 0 ? formatPercent(cat.returnRatePct) : '0.0%'} {isHighReturn && '⚠️'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
