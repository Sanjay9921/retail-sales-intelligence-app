import React from 'react';
import { DollarSign, Target, ShoppingBag, RotateCcw, Tag, PackageX, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { KPISummary } from '../types/retail';
import { formatCurrency, formatExactCurrency, formatPercent } from '../utils/dataEngine';

interface KPICardsProps {
  kpis: KPISummary;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const hasTarget = kpis.totalTargetSales > 0;
  const hasNet = kpis.totalNetSales > 0;
  const hasGross = kpis.totalGrossSales > 0;
  const hasTrans = kpis.totalTransactions > 0;
  const hasRecords = kpis.recordCount > 0;

  const isTargetMet = hasTarget && kpis.targetAchievementPct >= 100;
  const isTargetWarning = hasTarget && kpis.targetAchievementPct >= 90 && kpis.targetAchievementPct < 100;

  // Stockout Risk Alert thresholds
  // High Risk (Red): > 10%
  // Moderate Risk (Yellow): 5% to 10%
  // Low Risk (Green): < 5%
  const riskLevel = kpis.stockoutRiskLevel;
  const isHighRisk = riskLevel === 'High';
  const isModerateRisk = riskLevel === 'Moderate';

  const riskBadgeConfig = {
    High: {
      label: 'High Risk Alert (>10%)',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      icon: AlertTriangle,
    },
    Moderate: {
      label: 'Moderate Risk (5%–10%)',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: AlertCircle,
    },
    Low: {
      label: 'Low Risk (<5%)',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: CheckCircle2,
    },
  }[riskLevel];

  const RiskIcon = riskBadgeConfig.icon;

  return (
    <section id="kpi-section" className="mb-6 space-y-3">
      {/* 6 Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Net Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              1. Net Sales
            </span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {formatCurrency(kpis.totalNetSales)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Gross: {formatCurrency(kpis.totalGrossSales)}</span>
            <span className="text-slate-400 font-sans">Sum of Net</span>
          </div>
        </div>

        {/* KPI 2: Target Achievement (%) - Protected against Zero Division */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              2. Target Achievement
            </span>
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center ${
                !hasTarget
                  ? 'bg-slate-100 text-slate-400'
                  : isTargetMet
                  ? 'bg-emerald-50 text-emerald-600'
                  : isTargetWarning
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tracking-tight ${
                !hasTarget
                  ? 'text-slate-400'
                  : isTargetMet
                  ? 'text-emerald-700'
                  : isTargetWarning
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {hasTarget ? formatPercent(kpis.targetAchievementPct) : 'N/A'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              vs {hasTarget ? formatCurrency(kpis.totalTargetSales) : '$0'}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>
              {hasTarget
                ? `Delta: ${kpis.totalNetSales >= kpis.totalTargetSales ? '+' : '-'}${formatCurrency(
                    Math.abs(kpis.totalNetSales - kpis.totalTargetSales)
                  )}`
                : 'No Target Set'}
            </span>
            <span className="text-slate-400 font-sans">Net / Target</span>
          </div>
        </div>

        {/* KPI 3: Average Transaction Value (ATV) - Protected against Zero Division */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              3. Avg. Trans. Value
            </span>
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {hasTrans ? formatExactCurrency(kpis.atv) : 'N/A'}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>{kpis.totalTransactions.toLocaleString()} orders</span>
            <span className="text-slate-400 font-sans">Net / Trans.</span>
          </div>
        </div>

        {/* KPI 4: Return Rate (%) - Protected against Zero Division */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              4. Return Rate
            </span>
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center ${
                !hasNet
                  ? 'bg-slate-100 text-slate-400'
                  : kpis.returnRatePct > 10.0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tracking-tight ${
                !hasNet
                  ? 'text-slate-400'
                  : kpis.returnRatePct > 10.0
                  ? 'text-rose-700'
                  : 'text-slate-900'
              }`}
            >
              {hasNet ? formatPercent(kpis.returnRatePct) : '0.0%'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({formatCurrency(kpis.totalReturnAmount)})
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Refunds: {formatCurrency(kpis.totalReturnAmount)}</span>
            <span className="text-slate-400 font-sans">Return / Net</span>
          </div>
        </div>

        {/* KPI 5: Discount Rate (%) - Protected against Zero Division */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              5. Discount Rate
            </span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tracking-tight ${
                !hasGross ? 'text-slate-400' : 'text-slate-900'
              }`}
            >
              {hasGross ? formatPercent(kpis.discountRatePct) : '0.0%'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({formatCurrency(kpis.totalDiscountAmount)})
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Markdowns: {formatCurrency(kpis.totalDiscountAmount)}</span>
            <span className="text-slate-400 font-sans">Disc / Gross</span>
          </div>
        </div>

        {/* Stockout Indicator & Risk Flag Card */}
        <div
          className={`rounded-xl border p-4 transition-shadow hover:shadow-xs ${
            isHighRisk
              ? 'bg-rose-50/40 border-rose-200'
              : isModerateRisk
              ? 'bg-amber-50/40 border-amber-200'
              : 'bg-emerald-50/30 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stockout Indicator
            </span>
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center ${riskBadgeConfig.bgColor} ${riskBadgeConfig.textColor}`}
            >
              <PackageX className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tracking-tight ${riskBadgeConfig.textColor}`}>
              {hasRecords ? formatPercent(kpis.stockoutRatePct) : '0.0%'}
            </span>
            <span className="text-xs font-mono text-slate-500">
              ({kpis.totalStockouts} event{kpis.totalStockouts !== 1 ? 's' : ''})
            </span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium">
            <span className={`flex items-center gap-1 font-semibold ${riskBadgeConfig.textColor}`}>
              <RiskIcon className="w-3.5 h-3.5" />
              <span>{hasRecords ? `${riskLevel} Risk` : 'No Data'}</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {kpis.totalStockouts}/{kpis.recordCount} rows
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
