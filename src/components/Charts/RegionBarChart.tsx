import React, { useState } from 'react';
import { RegionMetric } from '../../types/retail';
import { formatCurrency, formatPercent } from '../../utils/dataEngine';

interface RegionBarChartProps {
  data: RegionMetric[];
}

export const RegionBarChart: React.FC<RegionBarChartProps> = ({ data }) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center text-slate-400 text-xs">
        No regional data for current selection.
      </div>
    );
  }

  const maxSales = Math.max(...data.map((d) => Math.max(d.netSales, d.targetSales)), 1000) * 1.15;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            2. Sales by Region (5 Regions)
          </h3>
          <p className="text-xs text-slate-500">
            Regional Net Sales vs. Target across store clusters
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs"></span>
            <span>Net Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border-2 border-teal-600 bg-white"></span>
            <span>Target Mark</span>
          </div>
        </div>
      </div>

      {/* Bar List */}
      <div className="space-y-3.5 my-auto">
        {data.map((item) => {
          const barWidthPct = Math.min(100, Math.max(4, (item.netSales / maxSales) * 100));
          const targetMarkerPct = Math.min(100, Math.max(4, (item.targetSales / maxSales) * 100));
          const isTargetAchieved = item.netSales >= item.targetSales;
          const isHovered = hoveredRegion === item.region;

          return (
            <div
              key={item.region}
              onMouseEnter={() => setHoveredRegion(item.region)}
              onMouseLeave={() => setHoveredRegion(null)}
              className={`p-2.5 rounded-lg transition-colors ${
                isHovered ? 'bg-slate-50' : 'bg-transparent'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{item.region} Region</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({item.storeCount} store{item.storeCount !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-slate-900">{formatCurrency(item.netSales)}</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      item.targetSales <= 0 ? 'text-slate-400' : isTargetAchieved ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {item.targetSales > 0 ? formatPercent(item.targetAchievementPct) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Bar track container */}
              <div className="relative h-4 bg-slate-100 rounded-full overflow-visible">
                {/* Net Sales fill bar */}
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isTargetAchieved ? 'bg-blue-600' : 'bg-blue-500'
                  }`}
                  style={{ width: `${barWidthPct}%` }}
                />

                {/* Target Marker Pin */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-teal-600 bg-white shadow-xs z-10"
                  style={{ left: `${targetMarkerPct}%` }}
                  title={`Target: ${formatCurrency(item.targetSales)}`}
                />
              </div>

              {/* Sub-metrics on hover or focus */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
                <span>Target: {formatCurrency(item.targetSales)}</span>
                <span>Return Rate: {item.netSales > 0 ? formatPercent(item.returnRatePct) : '0.0%'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
