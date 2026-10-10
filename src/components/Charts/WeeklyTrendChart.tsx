import React, { useState } from 'react';
import { WeeklyTrendPoint } from '../../types/retail';
import { formatCurrency, formatPercent } from '../../utils/dataEngine';

interface WeeklyTrendChartProps {
  data: WeeklyTrendPoint[];
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center text-slate-400 text-xs">
        No weekly trend data available for current filter.
      </div>
    );
  }

  // Chart dimensions & scaling
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 60 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.netSales, d.targetSales)),
    1000
  ) * 1.12;

  const getX = (idx: number) => {
    if (data.length === 1) return padding.left + plotWidth / 2;
    return padding.left + (idx / (data.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    return padding.top + plotHeight - (val / maxVal) * plotHeight;
  };

  // Generate SVG path strings
  const netPoints = data.map((d, i) => `${getX(i)},${getY(d.netSales)}`);
  const targetPoints = data.map((d, i) => `${getX(i)},${getY(d.targetSales)}`);

  const netPath = `M ${netPoints.join(' L ')}`;
  const targetPath = `M ${targetPoints.join(' L ')}`;

  // Area path for net sales fill
  const netAreaPath = `M ${getX(0)},${padding.top + plotHeight} L ${netPoints.join(' L ')} L ${getX(data.length - 1)},${padding.top + plotHeight} Z`;

  // Grid tick marks
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((frac) => ({
    val: maxVal * frac,
    y: getY(maxVal * frac),
  }));

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            1. Weekly Sales vs. Target Trend
          </h3>
          <p className="text-xs text-slate-500">
            Net Sales trajectory against corporate baseline targets ({data.length} periods)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 rounded"></span>
            <span>Net Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-teal-600"></span>
            <span>Target Sales</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="netSalesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={tick.y + 3.5}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {formatCurrency(tick.val)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={netAreaPath} fill="url(#netSalesGradient)" />

          {/* Target line (Dashed teal) */}
          <path
            d={targetPath}
            fill="none"
            stroke="#0D9488"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />

          {/* Net Sales line (Solid blue) */}
          <path
            d={netPath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots & hover regions */}
          {data.map((d, i) => {
            const x = getX(i);
            const yNet = getY(d.netSales);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i} className="cursor-pointer">
                {/* Vertical hover indicator */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + plotHeight}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Target point small dot */}
                <circle cx={x} cy={getY(d.targetSales)} r={2} fill="#0D9488" />

                {/* Net point circle */}
                <circle
                  cx={x}
                  cy={yNet}
                  r={isHovered ? 5 : 3}
                  fill={isHovered ? '#1D4ED8' : '#2563EB'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                {/* X axis labels (display every 2 or 3 weeks if many) */}
                {(data.length <= 8 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) && (
                  <text
                    x={x}
                    y={height - 10}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    {d.week}
                  </text>
                )}

                {/* Transparent hover capture column */}
                <rect
                  x={x - (plotWidth / data.length) / 2}
                  y={padding.top}
                  width={plotWidth / data.length}
                  height={plotHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activePoint && hoveredIndex !== null && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-900/90 text-white rounded-lg px-3 py-2 text-xs shadow-lg font-mono border border-slate-700 transition-all"
            style={{
              left: Math.min(Math.max(10, (getX(hoveredIndex) / width) * 100 - 15), 70) + '%',
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1 font-sans">
              {activePoint.week} Summary
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-blue-300">Net Sales:</span>
              <span>{formatCurrency(activePoint.netSales)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-teal-300">Target:</span>
              <span>{formatCurrency(activePoint.targetSales)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px] pt-1 border-t border-slate-700/60 mt-1">
              <span className="text-slate-300">Achievement:</span>
              <span
                className={
                  activePoint.targetSales <= 0
                    ? 'text-slate-400'
                    : activePoint.achievementPct >= 100
                    ? 'text-emerald-300'
                    : 'text-amber-300'
                }
              >
                {activePoint.targetSales > 0 ? formatPercent(activePoint.achievementPct) : 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
