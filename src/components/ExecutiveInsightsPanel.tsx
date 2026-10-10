import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  PackageX
} from 'lucide-react';
import { ExecutiveInsights, KPISummary } from '../types/retail';
import { formatCurrency, formatPercent } from '../utils/dataEngine';

interface ExecutiveInsightsPanelProps {
  insights: ExecutiveInsights;
  kpis: KPISummary;
  onDownloadReport: (format?: 'txt' | 'md') => void;
  onExportCSV: () => void;
}

export const ExecutiveInsightsPanel: React.FC<ExecutiveInsightsPanelProps> = ({
  insights,
  kpis,
  onDownloadReport,
  onExportCSV,
}) => {
  const stockoutAlerts = insights.stockoutAlerts;
  const isHighRisk = stockoutAlerts.overallLevel === 'High';
  const isModerateRisk = stockoutAlerts.overallLevel === 'Moderate';

  return (
    <section id="executive-insights" className="mb-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Automated Business Intelligence &amp; Executive Summary
              </span>
              <span className="text-xs text-blue-700 font-medium font-mono">
                Auto-Generated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time heuristic evaluation dynamically computed from filtered sales transactions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Format toggle (.txt vs .md) */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md text-[11px] font-mono">
              <button
                type="button"
                onClick={() => onDownloadReport('txt')}
                className="px-2 py-1 rounded text-slate-700 hover:text-slate-900 font-semibold"
                title="Download as plain text file (.txt)"
              >
                .TXT
              </button>
              <button
                type="button"
                onClick={() => onDownloadReport('md')}
                className="px-2 py-1 rounded text-slate-700 hover:text-slate-900 font-semibold"
                title="Download as Markdown document (.md)"
              >
                .MD
              </button>
            </div>

            <button
              onClick={() => onDownloadReport('txt')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Executive Insights</span>
            </button>

            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Filtered Sales Data (CSV)</span>
            </button>
          </div>
        </div>

        {/* Narrative Banner */}
        <div className="my-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-sans">
          <span className="font-semibold text-slate-900">Executive Synthesis: </span>
          {insights.summaryNarrative}
        </div>

        {/* 4 Core Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Best & Worst Performing Regions */}
          <div className="rounded-lg border border-slate-200 p-4 bg-white flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-3">
                1. Regional Leaders &amp; Laggards
              </span>

              {/* Best Region */}
              {insights.bestRegion ? (
                <div className="mb-2.5 p-2 rounded bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      Top: {insights.bestRegion.name}
                    </span>
                    <span className="font-mono font-bold text-emerald-800 text-[11px]">
                      {formatPercent(insights.bestRegion.achievement)}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    Net: {formatCurrency(insights.bestRegion.sales)}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No regional data available.</p>
              )}

              {/* Worst Region */}
              {insights.worstRegion && (
                <div className="p-2 rounded bg-amber-50/70 border border-amber-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-bold text-amber-900">
                      <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                      Lowest: {insights.worstRegion.name}
                    </span>
                    <span className="font-mono font-bold text-amber-800 text-[11px]">
                      {formatPercent(insights.worstRegion.achievement)}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 font-mono">
                    Net: {formatCurrency(insights.worstRegion.sales)}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              5 operating regions evaluated
            </div>
          </div>

          {/* 2. Stores Missing Targets */}
          <div className="rounded-lg border border-slate-200 p-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900">
                  2. Stores Missing Targets
                </span>
                <span className="text-xs font-mono font-bold text-rose-700">
                  {insights.underperformingStores.length} Flagged
                </span>
              </div>

              {insights.underperformingStores.length === 0 ? (
                <div className="p-3 bg-emerald-50 rounded border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All stores in current filter reached target quota.</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                  {insights.underperformingStores.slice(0, 3).map((s) => (
                    <div
                      key={s.storeId}
                      className="p-2 rounded bg-slate-50 border border-slate-200/70 text-xs"
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-900 truncate max-w-[140px]">
                          {s.storeName}
                        </span>
                        <span className="font-mono text-rose-600 font-bold text-[11px]">
                          {formatPercent(s.achievement)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-0.5">
                        <span>{s.region}</span>
                        <span>Gap: -{formatCurrency(s.gapAmount)}</span>
                      </div>
                    </div>
                  ))}
                  {insights.underperformingStores.length > 3 && (
                    <p className="text-[11px] text-slate-500 text-center font-mono">
                      + {insights.underperformingStores.length - 3} more stores under target
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              Target Achievement &lt; 100%
            </div>
          </div>

          {/* 3. High Return Categories */}
          <div className="rounded-lg border border-slate-200 p-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900">
                  3. High Return Categories
                </span>
                <span className="text-xs font-mono font-bold text-slate-600">
                  Avg: {formatPercent(kpis.returnRatePct)}
                </span>
              </div>

              {insights.highReturnCategories.length === 0 ? (
                <div className="p-3 bg-emerald-50 rounded border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Category return rates are within nominal tolerances.</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                  {insights.highReturnCategories.map((c) => (
                    <div
                      key={c.category}
                      className="p-2 rounded bg-rose-50/70 border border-rose-100 text-xs"
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-rose-950 truncate max-w-[140px]">
                          {c.category}
                        </span>
                        <span className="font-mono text-rose-700 font-bold text-[11px]">
                          {formatPercent(c.returnRate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-rose-600 font-mono mt-0.5">
                        <span>Refunds: {formatCurrency(c.returnAmount)}</span>
                        <span>Net: {formatCurrency(c.totalSales)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              (Return Amount / Net Sales) &times; 100
            </div>
          </div>

          {/* 4. Stockout Risk Alerts (High, Moderate, Low) */}
          <div
            className={`rounded-lg border p-4 flex flex-col justify-between ${
              isHighRisk
                ? 'bg-rose-50/30 border-rose-200'
                : isModerateRisk
                ? 'bg-amber-50/30 border-amber-200'
                : 'bg-emerald-50/20 border-emerald-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <PackageX className="w-3.5 h-3.5 text-slate-700" />
                  4. Stockout Risk Alert
                </span>
                <span
                  className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${
                    isHighRisk
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : isModerateRisk
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {stockoutAlerts.overallLevel} Risk
                </span>
              </div>

              {/* Risk Tier Counts */}
              <div className="space-y-1.5 text-xs">
                {/* High Risk (>10%) */}
                <div className="p-2 rounded bg-white border border-rose-200 text-rose-900">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1 text-[11px] text-rose-700">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      High Risk (&gt;10%):
                    </span>
                    <span className="font-mono text-xs font-bold text-rose-700">
                      {stockoutAlerts.highRiskStores.length} stores · {stockoutAlerts.highRiskCategories.length} cats
                    </span>
                  </div>
                  {stockoutAlerts.highRiskStores.length > 0 && (
                    <p className="text-[10px] text-rose-600 truncate mt-0.5">
                      Top: {stockoutAlerts.highRiskStores[0].name} ({formatPercent(stockoutAlerts.highRiskStores[0].stockoutRatePct)})
                    </p>
                  )}
                </div>

                {/* Moderate Risk (5-10%) */}
                <div className="p-2 rounded bg-white border border-amber-200 text-amber-900">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1 text-[11px] text-amber-700">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Moderate (5%–10%):
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-700">
                      {stockoutAlerts.moderateRiskStores.length} stores · {stockoutAlerts.moderateRiskCategories.length} cats
                    </span>
                  </div>
                </div>

                {/* Low Risk (<5%) */}
                <div className="p-2 rounded bg-white border border-emerald-200 text-emerald-900">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Low Risk (&lt;5%):
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      {stockoutAlerts.lowRiskStores.length} stores · {stockoutAlerts.lowRiskCategories.length} cats
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono">
              Portfolio Stockout: {formatPercent(stockoutAlerts.overallRate)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
