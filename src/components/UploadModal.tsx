import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, Check, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { parseSpreadsheetFile, normalizeSalesRow, normalizeStoreRow } from '../utils/dataEngine';
import { SalesRecord, StoreRecord } from '../types/retail';
import { DEMO_STORES, generateDemoSalesDataset } from '../data/demoRetailData';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (sales: SalesRecord[], stores: StoreRecord[]) => void;
  currentSalesCount: number;
  currentStoreCount: number;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  currentSalesCount,
  currentStoreCount,
}) => {
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [storeFile, setStoreFile] = useState<File | null>(null);
  const [salesData, setSalesData] = useState<SalesRecord[] | null>(null);
  const [storeData, setStoreData] = useState<StoreRecord[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const salesInputRef = useRef<HTMLInputElement>(null);
  const storeInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSalesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const rawRows = await parseSpreadsheetFile(file);
      if (rawRows.length === 0) throw new Error('Sales dataset is empty.');
      const parsed = rawRows.map(normalizeSalesRow);
      setSalesFile(file);
      setSalesData(parsed);
    } catch (err: any) {
      setErrorMsg(`Sales file error: ${err.message || 'Could not parse spreadsheet'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStoreUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const rawRows = await parseSpreadsheetFile(file);
      if (rawRows.length === 0) throw new Error('Store master is empty.');
      const parsed = rawRows.map(normalizeStoreRow);
      setStoreFile(file);
      setStoreData(parsed);
    } catch (err: any) {
      setErrorMsg(`Store master error: ${err.message || 'Could not parse spreadsheet'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!salesData || !storeData) return;
    onDataLoaded(salesData, storeData);
    onClose();
  };

  const handleReloadDemo = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onDataLoaded(generateDemoSalesDataset(), DEMO_STORES);
      setIsProcessing(false);
      onClose();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manage Data Sources</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active dataset: {currentSalesCount.toLocaleString()} sales rows · {currentStoreCount} stores
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sales Upload */}
            <div
              onClick={() => salesInputRef.current?.click()}
              className={`p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                salesData ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={salesInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleSalesUpload}
                className="hidden"
              />
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                {salesData ? (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">Select file</span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-900">1. Sales Dataset (.xlsx)</p>
              <p className="text-xs text-slate-600 mt-1 truncate">
                {salesFile ? salesFile.name : 'retail_weekly_sales.xlsx'}
              </p>
              {salesData && (
                <p className="text-xs font-mono text-emerald-800 mt-1">
                  {salesData.length.toLocaleString()} rows
                </p>
              )}
            </div>

            {/* Store Upload */}
            <div
              onClick={() => storeInputRef.current?.click()}
              className={`p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                storeData ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={storeInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleStoreUpload}
                className="hidden"
              />
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                {storeData ? (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">Select file</span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-900">2. Store Reference (.xlsx)</p>
              <p className="text-xs text-slate-600 mt-1 truncate">
                {storeFile ? storeFile.name : 'store_master.xlsx'}
              </p>
              {storeData && (
                <p className="text-xs font-mono text-emerald-800 mt-1">
                  {storeData.length.toLocaleString()} stores
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Or switch back to standard 1,920-row sample:</span>
            <button
              onClick={handleReloadDemo}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Reset to Demo Data
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/70 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!salesData || !storeData || isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md shadow-xs transition-colors"
          >
            <span>Apply and Update Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
