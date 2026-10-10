import React from 'react';
import { Filter, RotateCcw, Search, ChevronDown } from 'lucide-react';
import { FilterState, JoinedRecord } from '../types/retail';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  dataset: JoinedRecord[];
  totalFilteredCount: number;
  totalRawCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  dataset,
  totalFilteredCount,
  totalRawCount,
}) => {
  // Extract distinct options from raw joined dataset
  const weeks = Array.from(new Set(dataset.map((d) => String(d.Week_Number))))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

  const regions = Array.from(new Set(dataset.map((d) => d.Region).filter(Boolean))).sort();
  
  // Stores with ID and Name
  const storeMap = new Map<string, string>();
  for (const d of dataset) {
    if (d.Store_ID && !storeMap.has(d.Store_ID)) {
      storeMap.set(d.Store_ID, d.Store_Name || d.Store_ID);
    }
  }
  const stores = Array.from(storeMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));

  const cities = Array.from(new Set(dataset.map((d) => d.City).filter(Boolean))).sort();
  const formats = Array.from(new Set(dataset.map((d) => d.Store_Format).filter(Boolean))).sort();
  const categories = Array.from(new Set(dataset.map((d) => d.Product_Category).filter(Boolean))).sort();

  const activeFiltersCount =
    (filters.week !== 'all' ? 1 : 0) +
    (filters.region !== 'all' ? 1 : 0) +
    (filters.storeId !== 'all' ? 1 : 0) +
    (filters.city !== 'all' ? 1 : 0) +
    (filters.storeFormat !== 'all' ? 1 : 0) +
    (filters.category !== 'all' ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  const updateField = (key: keyof FilterState, val: string) => {
    onFilterChange({
      ...filters,
      [key]: val,
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Label + stats */}
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium shrink-0">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-900">Global Filters:</span>
            <span className="text-slate-500 font-mono">
              Showing {totalFilteredCount.toLocaleString()} of {totalRawCount.toLocaleString()} records
            </span>
            {activeFiltersCount > 0 && (
              <span className="text-blue-700 font-medium">
                ({activeFiltersCount} active)
              </span>
            )}
          </div>

          {/* Search box & reset button */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search store, city, category..."
                value={filters.searchQuery}
                onChange={(e) => updateField('searchQuery', e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
              />
            </div>

            <button
              onClick={onResetFilters}
              disabled={activeFiltersCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors shrink-0 whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {/* Week Filter */}
          <div className="relative">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Time Period
            </label>
            <select
              value={filters.week}
              onChange={(e) => updateField('week', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 truncate"
            >
              <option value="all">All Weeks</option>
              {weeks.map((w) => (
                <option key={w} value={w}>
                  Week {w.padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div className="relative">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Region (5)
            </label>
            <select
              value={filters.region}
              onChange={(e) => updateField('region', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 truncate"
            >
              <option value="all">All 5 Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r} Region
                </option>
              ))}
            </select>
          </div>

          {/* Store Filter */}
          <div className="relative">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Store Location
            </label>
            <select
              value={filters.storeId}
              onChange={(e) => updateField('storeId', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 truncate"
            >
              <option value="all">All Stores</option>
              {stores.map(([id, name]) => (
                <option key={id} value={id}>
                  {name} ({id})
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="relative">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 truncate"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Store Format Filter */}
          <div className="relative">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Store Format
            </label>
            <select
              value={filters.storeFormat}
              onChange={(e) => updateField('storeFormat', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 truncate"
            >
              <option value="all">All Formats</option>
              {formats.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Product Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
