import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { JoinedRecord } from '../types/retail';
import { formatCurrency, formatExactCurrency, formatPercent } from '../utils/dataEngine';

interface DataTableProps {
  data: JoinedRecord[];
  onExportCSV: () => void;
}

type SortField =
  | 'Store_Name'
  | 'Region'
  | 'City'
  | 'Store_Format'
  | 'Product_Category'
  | 'Week_Number'
  | 'Net_Sales'
  | 'Target_Sales'
  | 'Target_Achievement_Pct'
  | 'ATV'
  | 'Return_Rate_Pct'
  | 'Discount_Rate_Pct'
  | 'Stockout_Status';

export const DataTable: React.FC<DataTableProps> = ({ data, onExportCSV }) => {
  const [sortField, setSortField] = useState<SortField>('Net_Sales');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    const list = [...data];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        const cmp = (aVal as string).localeCompare(bVal as string);
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      if (typeof aVal === 'number') {
        const numA = aVal as number;
        const numB = (bVal as number) || 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      return 0;
    });
    return list;
  }, [data, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline-block" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 ml-1 inline-block" />
    );
  };

  return (
    <section id="drilldown-table" className="mb-10">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Detailed Transaction Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Granular joined dataset with store metadata ({data.length.toLocaleString()} records)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Filtered Sales Data (CSV)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold select-none">
                <th
                  onClick={() => handleSort('Store_Name')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                >
                  Store {renderSortIcon('Store_Name')}
                </th>
                <th
                  onClick={() => handleSort('Region')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                >
                  Region {renderSortIcon('Region')}
                </th>
                <th
                  onClick={() => handleSort('Store_Format')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                >
                  Format {renderSortIcon('Store_Format')}
                </th>
                <th
                  onClick={() => handleSort('Product_Category')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                >
                  Category {renderSortIcon('Product_Category')}
                </th>
                <th
                  onClick={() => handleSort('Week_Number')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap text-center"
                >
                  Week {renderSortIcon('Week_Number')}
                </th>
                <th
                  onClick={() => handleSort('Net_Sales')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap text-right"
                >
                  Net Sales {renderSortIcon('Net_Sales')}
                </th>
                <th
                  onClick={() => handleSort('Target_Sales')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap text-right"
                >
                  Target {renderSortIcon('Target_Sales')}
                </th>
                <th
                  onClick={() => handleSort('Target_Achievement_Pct')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap text-right"
                >
                  Target % {renderSortIcon('Target_Achievement_Pct')}
                </th>
                <th
                  onClick={() => handleSort('ATV')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap text-right"
                >
                  ATV {renderSortIcon('ATV')}
                </th>
                <th
                  onClick={() => handleSort('Return_Rate_Pct')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap text-right"
                >
                  Return % {renderSortIcon('Return_Rate_Pct')}
                </th>
                <th
                  onClick={() => handleSort('Discount_Rate_Pct')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap text-right"
                >
                  Discount % {renderSortIcon('Discount_Rate_Pct')}
                </th>
                <th
                  onClick={() => handleSort('Stockout_Status')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap text-center"
                >
                  Stockout {renderSortIcon('Stockout_Status')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    No matching records found for current filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const isStockout =
                    row.Stockout_Status &&
                    row.Stockout_Status.toLowerCase() !== 'in stock' &&
                    row.Stockout_Status.toLowerCase() !== 'available';
                  const isMet = row.Target_Achievement_Pct >= 100;

                  return (
                    <tr
                      key={`${row.Store_ID}-${row.Week_Number}-${row.Product_Category}-${idx}`}
                      className="hover:bg-slate-50/80 transition-colors h-10"
                    >
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-900">
                        {row.Store_Name}
                        <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                          {row.Store_ID}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-slate-600">
                        {row.Region}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-slate-600">
                        {row.Store_Format}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-slate-800">
                        {row.Product_Category}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-center font-mono">
                        W{String(row.Week_Number).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                        {formatCurrency(row.Net_Sales)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right font-mono text-slate-600">
                        {formatCurrency(row.Target_Sales)}
                      </td>
                      <td
                        className={`py-2 px-3 whitespace-nowrap text-right font-mono font-semibold ${
                          row.Target_Sales > 0 ? (isMet ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-400'
                        }`}
                      >
                        {row.Target_Sales > 0 ? formatPercent(row.Target_Achievement_Pct) : 'N/A'}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right font-mono text-slate-700">
                        {row.Transactions > 0 ? formatExactCurrency(row.ATV) : 'N/A'}
                      </td>
                      <td
                        className={`py-2 px-3 whitespace-nowrap text-right font-mono ${
                          row.Net_Sales > 0 && row.Return_Rate_Pct > 10.0 ? 'text-rose-700 font-semibold' : 'text-slate-600'
                        }`}
                      >
                        {row.Net_Sales > 0 ? formatPercent(row.Return_Rate_Pct) : '0.0%'}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right font-mono text-slate-600">
                        {row.Gross_Sales > 0 ? formatPercent(row.Discount_Rate_Pct) : '0.0%'}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-center font-mono">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            row.Stockout_Flag
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'text-slate-500 bg-slate-50 border-slate-200'
                          }`}
                        >
                          {row.Stockout_Flag ? 'STOCKOUT' : 'IN STOCK'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            <span>
              Showing{' '}
              <span className="font-mono font-semibold text-slate-900">
                {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)}
              </span>{' '}
              to{' '}
              <span className="font-mono font-semibold text-slate-900">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </span>{' '}
              of <span className="font-mono font-semibold text-slate-900">{sortedData.length}</span> entries
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
