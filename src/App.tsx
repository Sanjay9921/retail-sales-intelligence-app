import React, { useState, useMemo } from 'react';
import { SalesRecord, StoreRecord, JoinedRecord, FilterState } from './types/retail';
import {
  joinSalesAndStoreData,
  filterDataset,
  calculateKPISummary,
  getWeeklyTrend,
  getRegionMetrics,
  getCategoryMetrics,
  getStoreLeaderboard,
  generateExecutiveInsights,
  generatePlainTextSummary,
  generateMarkdownSummary,
  downloadTextFile,
  exportDatasetToCSV
} from './utils/dataEngine';
import { Header } from './components/Header';
import { ZeroStateUpload } from './components/ZeroStateUpload';
import { UploadModal } from './components/UploadModal';
import { FilterBar } from './components/FilterBar';
import { KPICards } from './components/KPICards';
import { WeeklyTrendChart } from './components/Charts/WeeklyTrendChart';
import { RegionBarChart } from './components/Charts/RegionBarChart';
import { CategoryChart } from './components/Charts/CategoryChart';
import { StoreLeaderboardChart } from './components/Charts/StoreLeaderboardChart';
import { StockoutRiskChart } from './components/Charts/StockoutRiskChart';
import { ExecutiveInsightsPanel } from './components/ExecutiveInsightsPanel';
import { DataTable } from './components/DataTable';

const INITIAL_FILTERS: FilterState = {
  week: 'all',
  region: 'all',
  storeId: 'all',
  city: 'all',
  storeFormat: 'all',
  category: 'all',
  searchQuery: ''
};

export default function App() {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[] | null>(null);
  const [storeRecords, setStoreRecords] = useState<StoreRecord[] | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Join sales and store master dataset
  const joinedData = useMemo<JoinedRecord[]>(() => {
    if (!salesRecords || !storeRecords) return [];
    return joinSalesAndStoreData(salesRecords, storeRecords);
  }, [salesRecords, storeRecords]);

  // Filtered dataset based on user filter controls
  const filteredData = useMemo<JoinedRecord[]>(() => {
    return filterDataset(joinedData, filters);
  }, [joinedData, filters]);

  // Computed metrics & KPIs
  const kpis = useMemo(() => calculateKPISummary(filteredData), [filteredData]);
  const weeklyTrend = useMemo(() => getWeeklyTrend(filteredData), [filteredData]);
  const regionMetrics = useMemo(() => getRegionMetrics(filteredData), [filteredData]);
  const categoryMetrics = useMemo(() => getCategoryMetrics(filteredData), [filteredData]);
  const storeLeaderboard = useMemo(() => getStoreLeaderboard(filteredData), [filteredData]);
  const executiveInsights = useMemo(() => generateExecutiveInsights(filteredData, kpis), [filteredData, kpis]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.week !== 'all') count++;
    if (filters.region !== 'all') count++;
    if (filters.storeId !== 'all') count++;
    if (filters.city !== 'all') count++;
    if (filters.storeFormat !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.searchQuery.trim()) count++;
    return count;
  }, [filters]);

  const handleDataLoaded = (sales: SalesRecord[], stores: StoreRecord[]) => {
    setSalesRecords(sales);
    setStoreRecords(stores);
    setFilters(INITIAL_FILTERS);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleExportCSV = () => {
    exportDatasetToCSV(filteredData, 'retail_sales_filtered_export.csv');
  };

  const handleDownloadReport = (format: 'txt' | 'md' = 'txt') => {
    if (format === 'md') {
      const mdReport = generateMarkdownSummary(kpis, executiveInsights, filters);
      downloadTextFile(mdReport, 'retail_sales_executive_insights.md');
    } else {
      const textReport = generatePlainTextSummary(kpis, executiveInsights, filters);
      downloadTextFile(textReport, 'retail_sales_executive_insights.txt');
    }
  };

  // If no data loaded yet, show the zero-state upload screen
  if (!salesRecords || !storeRecords) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header
          onOpenUpload={() => {}}
          onResetFilters={() => {}}
          onExportCSV={() => {}}
          onDownloadReport={() => {}}
          recordCount={0}
          totalStores={0}
          activeFilterCount={0}
        />
        <main className="flex-1">
          <ZeroStateUpload onDataLoaded={handleDataLoaded} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Navigation Contract */}
      <Header
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onResetFilters={handleResetFilters}
        onExportCSV={handleExportCSV}
        onDownloadReport={handleDownloadReport}
        recordCount={filteredData.length}
        totalStores={storeRecords.length}
        activeFilterCount={activeFilterCount}
      />

      {/* Dynamic Global Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        dataset={joinedData}
        totalFilteredCount={filteredData.length}
        totalRawCount={joinedData.length}
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {filteredData.length === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-800">
            <div>
              <p className="font-semibold text-amber-900">No records match the current filter criteria</p>
              <p className="text-amber-700 mt-0.5">
                The selected combination of Week, Region, Store, Format, or Category produced 0 records. Guardrails returned safe zero/N/A values.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100/60 rounded-md font-semibold text-amber-900 shrink-0 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* 5 Mandatory KPI Summary Cards */}
        <KPICards kpis={kpis} />

        {/* 5 Visualizations Grid */}
        <section id="analytics-grid" className="space-y-6">
          {/* Row 1: Weekly Trend (Full Width or 2/3) + Region Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <WeeklyTrendChart data={weeklyTrend} />
            </div>
            <div className="lg:col-span-5">
              <RegionBarChart data={regionMetrics} />
            </div>
          </div>

          {/* Row 2: Category Breakdown + Store Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <CategoryChart data={categoryMetrics} />
            </div>
            <div className="lg:col-span-6">
              <StoreLeaderboardChart data={storeLeaderboard} />
            </div>
          </div>

          {/* Row 3: Stockout Risk Chart & Indicator */}
          <div className="grid grid-cols-1 gap-6">
            <StockoutRiskChart dataset={filteredData} />
          </div>
        </section>

        {/* Dedicated Automated Business Insight Summary Panel */}
        <ExecutiveInsightsPanel
          insights={executiveInsights}
          kpis={kpis}
          onDownloadReport={handleDownloadReport}
          onExportCSV={handleExportCSV}
        />

        {/* Interactive Detailed Drill-Down Table (Search, Sort, Pagination) */}
        <DataTable data={filteredData} onExportCSV={handleExportCSV} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <span>Retail Sales Intelligence System · Local In-Browser Processing</span>
          <span>Joined on Store_ID · Client-Side SheetJS Engine</span>
        </div>
      </footer>

      {/* Modal for updating/replacing files */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
        currentSalesCount={salesRecords.length}
        currentStoreCount={storeRecords.length}
      />
    </div>
  );
}
