import React, { useState } from 'react';
import { PackageX, AlertTriangle, AlertCircle, CheckCircle2, Filter } from 'lucide-react';
import { JoinedRecord, RiskLevel } from '../../types/retail';
import { getStockoutRiskMetrics, formatPercent } from '../../utils/dataEngine';

interface StockoutRiskChartProps {
  dataset: JoinedRecord[];
}

export const StockoutRiskChart: React.FC<StockoutRiskChartProps> = ({ dataset }) => {
  const [breakdownMode, setBreakdownMode] = useState<'category' | 'store'>('category');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');

  const {
    byCategory,
    byStore,
    highRiskStores,
    moderateRiskStores,
    lowRiskStores,
    highRiskCategories,
    moderateRiskCategories,
    lowRiskCategories
  } = getStockoutRiskMetrics(dataset);

  const totalStockouts = dataset.filter((d) => d.Stockout_Flag || d.Stockout === 1).length;
  const totalRecords = dataset.length;
  const overallRate = totalRecords > 0 ? (totalStockouts / totalRecords) * 100 : 0;
  const overallRiskLevel: RiskLevel = overallRate > 10.0 ? 'High' : overallRate >= 5.0 ? 'Moderate' : 'Low';

  const currentList = breakdownMode === 'category' ? byCategory : byStore;
  const filteredList = riskFilter === 'All'
    ? currentList
    : currentList.filter((item) => item.riskLevel === riskFilter);

  const highCount = breakdownMode === 'category' ? highRiskCategories.length : highRiskStores.length;
  const modCount = breakdownMode === 'category' ? moderateRiskCategories.length : moderateRiskStores.length;
  const lowCount = breakdownMode === 'category' ? lowRiskCategories.length : lowRiskStores.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>5. Stockout Risk Indicator &amp; Inventory Health</span>
          </h3>
          <p className="text-xs text-slate-500">
            Stockout Count (weeks/items with Stockout_Flag == True) &amp; Stockout Rate (%)
          </p>
        </div>

        {/* Breakdown Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium shrink-0">
          <button
            onClick={() => setBreakdownMode('category')}
            className={`px-3 py-1 rounded-md transition-colors ${
              breakdownMode === 'category'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Category ({byCategory.length})
          </button>
          <button
            onClick={() => setBreakdownMode('store')}
            className={`px-3 py-1 rounded-md transition-colors ${
              breakdownMode === 'store'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Store ({byStore.length})
          </button>
        </div>
      </div>

      {/* Stockout Risk Alert Banners & KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {/* Overall Summary Card */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Portfolio Stockout Rate
          </span>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {formatPercent(overallRate)}
            </span>
            <span className="text-xs font-mono text-slate-500">
              ({totalStockouts} events)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {totalStockouts} / {totalRecords} product-weeks
          </span>
        </div>

        {/* High Risk Tier (Red) */}
        <button
          onClick={() => setRiskFilter(riskFilter === 'High' ? 'All' : 'High')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            riskFilter === 'High' ? 'ring-2 ring-rose-400' : ''
          } bg-rose-50/60 border-rose-200 hover:bg-rose-50`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              High Risk Alert
            </span>
            <span className="text-xs font-bold font-mono text-rose-700">
              {highCount}
            </span>
          </div>
          <p className="text-[11px] text-rose-700 font-mono font-medium">
            Stockout Rate &gt; 10%
          </p>
          <span className="text-[10px] text-rose-600 block mt-1">
            Requires priority replenishment
          </span>
        </button>

        {/* Moderate Risk Tier (Yellow) */}
        <button
          onClick={() => setRiskFilter(riskFilter === 'Moderate' ? 'All' : 'Moderate')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            riskFilter === 'Moderate' ? 'ring-2 ring-amber-400' : ''
          } bg-amber-50/60 border-amber-200 hover:bg-amber-50`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Moderate Risk
            </span>
            <span className="text-xs font-bold font-mono text-amber-700">
              {modCount}
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-mono font-medium">
            Stockout Rate 5% – 10%
          </p>
          <span className="text-[10px] text-amber-600 block mt-1">
            Monitor inventory buffer
          </span>
        </button>

        {/* Low Risk Tier (Green) */}
        <button
          onClick={() => setRiskFilter(riskFilter === 'Low' ? 'All' : 'Low')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            riskFilter === 'Low' ? 'ring-2 ring-emerald-400' : ''
          } bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Low Risk
            </span>
            <span className="text-xs font-bold font-mono text-emerald-700">
              {lowCount}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-mono font-medium">
            Stockout Rate &lt; 5%
          </p>
          <span className="text-[10px] text-emerald-600 block mt-1">
            Healthy stock levels
          </span>
        </button>
      </div>

      {/* Filter status banner if filtered */}
      {riskFilter !== 'All' && (
        <div className="mb-3 px-3 py-1.5 bg-slate-100 rounded-md flex items-center justify-between text-xs text-slate-700">
          <span>
            Filtering by <strong className="font-semibold">{riskFilter} Risk</strong> only ({filteredList.length} items)
          </span>
          <button
            onClick={() => setRiskFilter('All')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Show All
          </button>
        </div>
      )}

      {/* Breakdown Items List */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {filteredList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
            No {breakdownMode === 'category' ? 'categories' : 'stores'} match the {riskFilter} Risk criteria.
          </div>
        ) : (
          filteredList.map((item) => {
            const isHigh = item.riskLevel === 'High';
            const isMod = item.riskLevel === 'Moderate';

            const barColor = isHigh ? 'bg-rose-500' : isMod ? 'bg-amber-500' : 'bg-emerald-500';
            const badgeClass = isHigh
              ? 'text-rose-700 bg-rose-50 border-rose-200'
              : isMod
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200';

            return (
              <div
                key={item.id}
                className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                      {item.name}
                    </span>
                    {item.region && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        · {item.region}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border font-mono ${badgeClass}`}
                    >
                      {item.riskLevel} Risk
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-slate-900">
                      {formatPercent(item.stockoutRatePct)}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({item.stockoutCount}/{item.totalRecords} wks)
                    </span>
                  </div>
                </div>

                {/* Risk Progress Bar */}
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.min(100, Math.max(3, item.stockoutRatePct))}%` }}
                  />
                </div>

                {/* Sub details */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>
                    Stockout Count: {item.stockoutCount} event{item.stockoutCount !== 1 ? 's' : ''}
                  </span>
                  <span>
                    {item.unitsLost && item.unitsLost > 0 ? (
                      <span className="text-rose-600 font-medium">
                        {item.unitsLost} units unfulfilled
                      </span>
                    ) : (
                      <span>Inventory fulfillment tracked</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
