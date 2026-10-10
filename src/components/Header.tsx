import React from 'react';
import { Download, UploadCloud, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onOpenUpload: () => void;
  onResetFilters: () => void;
  onExportCSV: () => void;
  onDownloadReport: () => void;
  recordCount: number;
  totalStores: number;
  activeFilterCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  onResetFilters,
  onExportCSV,
  onDownloadReport,
  recordCount,
  totalStores,
  activeFilterCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark in display face */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Retail Sales Intelligence
            </span>
            {recordCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>{recordCount.toLocaleString()} rows</span>
                <span aria-hidden="true">·</span>
                <span>{totalStores} stores active</span>
              </span>
            )}
          </div>

          {/* Zone 2: Concise navigation & quick actions */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#kpi-section" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Performance KPIs
            </a>
            <a href="#analytics-grid" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Regional & Category Visuals
            </a>
            <a href="#executive-insights" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Executive Brief
            </a>
            <a href="#drilldown-table" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Detailed Ledger
            </a>
          </nav>

          {/* Zone 3: Functional actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {activeFilterCount > 0 && (
              <button
                onClick={onResetFilters}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}

            <button
              onClick={onDownloadReport}
              disabled={recordCount === 0}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Executive Insights</span>
            </button>

            <button
              onClick={onExportCSV}
              disabled={recordCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Filtered Sales Data (CSV)</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{recordCount > 0 ? 'Update Datasets' : 'Upload Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
