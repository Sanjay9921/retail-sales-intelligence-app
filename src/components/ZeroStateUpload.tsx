import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle, ArrowRight, Sparkles, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseSpreadsheetFile, normalizeSalesRow, normalizeStoreRow } from '../utils/dataEngine';
import { SalesRecord, StoreRecord } from '../types/retail';
import { DEMO_STORES, generateDemoSalesDataset } from '../data/demoRetailData';

interface ZeroStateUploadProps {
  onDataLoaded: (sales: SalesRecord[], stores: StoreRecord[]) => void;
}

export const ZeroStateUpload: React.FC<ZeroStateUploadProps> = ({ onDataLoaded }) => {
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [storeFile, setStoreFile] = useState<File | null>(null);
  const [salesData, setSalesData] = useState<SalesRecord[] | null>(null);
  const [storeData, setStoreData] = useState<StoreRecord[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const salesInputRef = useRef<HTMLInputElement>(null);
  const storeInputRef = useRef<HTMLInputElement>(null);

  const handleSalesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const rawRows = await parseSpreadsheetFile(file);
      if (rawRows.length === 0) {
        throw new Error('Sales dataset is empty.');
      }
      const parsedSales = rawRows.map(normalizeSalesRow);
      setSalesFile(file);
      setSalesData(parsedSales);
    } catch (err: any) {
      setErrorMsg(`Sales file error: ${err.message || 'Could not parse spreadsheet'}`);
      setSalesFile(null);
      setSalesData(null);
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
      if (rawRows.length === 0) {
        throw new Error('Store master file is empty.');
      }
      const parsedStores = rawRows.map(normalizeStoreRow);
      setStoreFile(file);
      setStoreData(parsedStores);
    } catch (err: any) {
      setErrorMsg(`Store master error: ${err.message || 'Could not parse spreadsheet'}`);
      setStoreFile(null);
      setStoreData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyJoinedData = () => {
    if (!salesData || !storeData) return;
    onDataLoaded(salesData, storeData);
  };

  const handleLoadDemoDataset = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const demoSales = generateDemoSalesDataset();
      const demoStores = DEMO_STORES;
      onDataLoaded(demoSales, demoStores);
      setIsProcessing(false);
    }, 150);
  };

  const handleDownloadSampleSales = () => {
    const demo = generateDemoSalesDataset();
    const ws = XLSX.utils.json_to_sheet(demo);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Weekly Sales');
    XLSX.writeFile(wb, 'retail_weekly_sales.xlsx');
  };

  const handleDownloadSampleStores = () => {
    const ws = XLSX.utils.json_to_sheet(DEMO_STORES);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Store Master');
    XLSX.writeFile(wb, 'store_master.xlsx');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto w-full">
        {/* Intro */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Retail Sales Intelligence
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            Upload your weekly retail sales records and store master reference sheets to calculate KPIs, evaluate target achievements, monitor return anomalies, and generate executive insights.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Upload Notice</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Dual Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Box 1: Sales Dataset */}
          <div
            onClick={() => salesInputRef.current?.click()}
            className={`cursor-pointer group relative rounded-xl border-2 border-dashed p-6 transition-all bg-white hover:bg-slate-50/70 ${
              salesData
                ? 'border-emerald-400 ring-2 ring-emerald-100'
                : 'border-slate-300 hover:border-blue-400'
            }`}
          >
            <input
              ref={salesInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleSalesUpload}
              className="hidden"
            />
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              {salesData ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <Check className="w-3.5 h-3.5" /> Ready
                </span>
              ) : (
                <span className="text-xs text-slate-600">Required</span>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-base font-semibold text-slate-900">
                1. Weekly Sales Dataset
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Accepts <code className="text-slate-700">retail_weekly_sales.xlsx</code> (approx. 1,920 rows &amp; 19 columns: Net Sales, Target, Returns, Discounts, Stockout).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              {salesData ? (
                <span className="font-mono text-emerald-800">
                  {salesFile?.name} ({salesData.length.toLocaleString()} rows)
                </span>
              ) : (
                <span className="group-hover:text-blue-600 flex items-center gap-1">
                  <UploadCloud className="w-4 h-4" /> Click to choose or drop file
                </span>
              )}
              <span className="text-slate-600">.xlsx, .csv</span>
            </div>
          </div>

          {/* Box 2: Store Master */}
          <div
            onClick={() => storeInputRef.current?.click()}
            className={`cursor-pointer group relative rounded-xl border-2 border-dashed p-6 transition-all bg-white hover:bg-slate-50/70 ${
              storeData
                ? 'border-emerald-400 ring-2 ring-emerald-100'
                : 'border-slate-300 hover:border-blue-400'
            }`}
          >
            <input
              ref={storeInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleStoreUpload}
              className="hidden"
            />
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              {storeData ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <Check className="w-3.5 h-3.5" /> Ready
                </span>
              ) : (
                <span className="text-xs text-slate-600">Required</span>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-base font-semibold text-slate-900">
                2. Store Reference Master
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Accepts <code className="text-slate-700">store_master.xlsx</code> (approx. 20 rows &amp; 5 columns: Store_ID, Store_Name, Region, City, Store_Format).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              {storeData ? (
                <span className="font-mono text-emerald-800">
                  {storeFile?.name} ({storeData.length.toLocaleString()} stores)
                </span>
              ) : (
                <span className="group-hover:text-indigo-600 flex items-center gap-1">
                  <UploadCloud className="w-4 h-4" /> Click to choose or drop file
                </span>
              )}
              <span className="text-slate-600">.xlsx, .csv</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Template files:</span>
            <button
              onClick={handleDownloadSampleSales}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium underline"
            >
              <Download className="w-3 h-3" /> sample_sales.xlsx
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleDownloadSampleStores}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium underline"
            >
              <Download className="w-3 h-3" /> sample_stores.xlsx
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleLoadDemoDataset}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Load 1,920-Row Demo Dataset</span>
            </button>

            <button
              onClick={handleApplyJoinedData}
              disabled={!salesData || !storeData || isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
