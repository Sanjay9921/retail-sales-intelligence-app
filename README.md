# Retail Sales Intelligence App
### Executive Performance, Target Achievement & Inventory Risk Analytics Dashboard

---

## Objective
The **Retail Sales Intelligence App** is an interactive, single-page enterprise web dashboard built for retail business managers, regional directors, and merchandising leads. The application provides end-to-end sales performance tracking, store target evaluations, product category health diagnostics, inventory stockout risk monitoring, and automated heuristic business intelligence summaries—executing entirely client-side without external cloud database or backend API dependencies.

---

## Technologies Used
- **Frontend Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tooling & Dev Server**: [Vite 8](https://vitejs.dev/) with Fast Refresh
- **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/) following Clean Enterprise Light mode principles
- **Icons & Visual Language**: [Lucide React](https://lucide.dev/)
- **Spreadsheet Parsing & Ingestion**: [SheetJS (xlsx)](https://docs.sheetjs.com/) for in-browser `.xlsx`, `.xls`, and `.csv` decoding
- **Visual Analytics**: Interactive, responsive SVG vector charts with crosshairs, tooltips, and zero-dependency coordinate rendering
- **Typography**: Google Fonts (*Plus Jakarta Sans* for typographic hierarchy, *JetBrains Mono* for tabular numerals)

---

## Getting Started: Clone & Run

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- `npm` or `yarn`

### Installation & Execution
```bash
# 1. Clone the repository
git clone https://github.com/your-username/retail-sales-intelligence-app.git

# 2. Navigate to the project directory
cd retail-sales-intelligence-app

# 3. Install project dependencies
npm install

# 4. Start the local development server (runs on port 3000)
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to launch the application.

### Production Build & Linting
```bash
# Validate TypeScript types and codebase hygiene
npm run lint

# Compile and package optimized bundle for production
npm run build

# Preview the production build locally
npm run preview
```

### Optional: Python Synthetic Dataset Generation (`requirements.txt`)
If you wish to programmatically generate or regenerate the raw spreadsheet datasets (`retail_weekly_sales.xlsx` with 1,920 rows and `store_master.xlsx` with 20 rows), a Python script and `requirements.txt` are provided:
```bash
# 1. Install Python data dependencies
pip install -r requirements.txt

# 2. Run the dataset generator
python scripts/generate_retail_datasets.py
```
This generates:
- `retail_weekly_sales.xlsx` (1,920 rows × 19 columns)
- `store_master.xlsx` (20 rows × 5 columns)

---

## 1. App Specification & Design

The dashboard was architected according to high-density enterprise analytics UX standards, strictly enforcing **anti-slop aesthetic discipline**: flat single-elevation card surfaces, hairline borders (`border-slate-200`), tabular numerals (`font-mono tabular-nums`), zero pill badge enclosures on static labels, and rich interactive tooltips.

### Master Prompt Feature Implementation:

#### 1. Dynamic Global Filter Bar
The filter bar allows slicing the multi-dimensional dataset across six granular dimensions simultaneously, alongside real-time search:
- **Week / Time Period**: Multi-week time periods (`Week 01` through `Week 16+`).
- **Region**: 5 operational territories (`East`, `West`, `North`, `South`, `Central`).
- **Store Location**: 20 distinct store nodes by name and ID (e.g., `Manhattan 5th Ave Flagship [STR-101]`).
- **City**: Metropolitan markets (`New York`, `Chicago`, `San Francisco`, `Miami`, `Seattle`, etc.).
- **Store Format**: Retail concepts (`Flagship`, `Mall Store`, `Standard`, `Outlet`).
- **Product Category**: Core merchandise divisions (`Apparel & Fashion`, `Footwear & Athletic`, `Beauty & Personal Care`, `Home & Living`, `Consumer Electronics`, `Accessories & Leather`).
- **Reset Filters**: One-click action restoring all filter dimensions to default (`all`) and clearing the search term.

```typescript
// Filter State Definition and Filtering Pipeline (src/utils/dataEngine.ts)
export function filterDataset(data: JoinedRecord[], filters: FilterState): JoinedRecord[] {
  return data.filter((row) => {
    // 1. Week Filter
    if (filters.week !== 'all' && String(row.Week_Number) !== filters.week) return false;
    // 2. Region Filter
    if (filters.region !== 'all' && row.Region !== filters.region) return false;
    // 3. Store ID Filter
    if (filters.storeId !== 'all' && row.Store_ID !== filters.storeId) return false;
    // 4. City Filter
    if (filters.city !== 'all' && row.City !== filters.city) return false;
    // 5. Store Format Filter
    if (filters.storeFormat !== 'all' && row.Store_Format !== filters.storeFormat) return false;
    // 6. Product Category Filter
    if (filters.category !== 'all' && row.Product_Category !== filters.category) return false;
    // 7. Global Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        row.Store_Name.toLowerCase().includes(q) ||
        row.Store_ID.toLowerCase().includes(q) ||
        row.City.toLowerCase().includes(q) ||
        row.Product_Category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}
```

#### 2. Top-Level Mandatory KPI Cards
Five prominent KPI cards at the top of the dashboard provide immediate executive status, backed by strict mathematical definitions and tabular alignment:
1. **Net Sales**: Aggregate net revenue across the active selection with gross sales reference.
2. **Target Achievement (%)**: Actual revenue compared against corporate budget quotas with colored target delta markers (`≥100%` emerald, `<100%` amber/rose).
3. **Average Transaction Value (ATV)**: Average checkout dollar value per transaction (`Net Sales / Transactions`).
4. **Return Rate (%)**: Percentage of sales lost to returns (`Return Amount / Net Sales * 100`), benchmarked against operational thresholds.
5. **Discount Rate (%)**: Promotional markdown exposure as a percentage of gross sales (`Discount Amount / Gross Sales * 100`).
6. **Stockout Risk Indicator**: Aggregate count of stockout events, portfolio stockout rate (%), and active risk severity alert (High >10%, Moderate 5%–10%, Low <5%).

#### 3. Five Interactive Visual Analytics Charts
1. **Weekly Trend Line Chart**: Dual-series interactive curve contrasting **Net Sales** vs. **Target Sales** across weeks with crosshair tracking and tooltip breakdowns.
2. **Sales by Region Bar Chart**: Side-by-side performance across all 5 operational regions with target marker pins and regional store counts.
3. **Category Performance Breakdown**: Horizontal volume breakdown showing revenue share (%), target achievement, and return rate warnings per product line.
4. **Store Performance Leaderboard**: Target achievement ranking with interactive quick toggles for **Top 5 Overperforming**, **Bottom 5 Underperforming**, or **All 20 Stores**.
5. **Stockout Risk & Inventory Health Chart**: Category and store-level stockout frequency, units lost, and interactive risk tier filters (**High Risk >10%**, **Moderate Risk 5%–10%**, **Low Risk <5%**).

#### 4. Automated Business Insight Summary Panel
An executive briefing panel dynamically generates heuristic insights from active filter selections:
- **Regional Leaders & Laggards**: Automatically identifies highest and lowest sales regions with achievement percentages.
- **Stores Missing Targets**: Flags individual store locations failing to meet revenue targets and displays exact dollar shortfalls.
- **High Return Categories**: Flags merchandise categories exceeding return benchmarks with total refund amounts.
- **Stockout Risk Alerts**: Summarizes portfolio inventory health and flags critical supply chain bottlenecks.

```typescript
// Heuristic Insight Generation Algorithm (src/utils/dataEngine.ts)
export function generateExecutiveInsights(
  dataset: JoinedRecord[],
  kpis: KPISummary
): ExecutiveInsights {
  const regions = getRegionMetrics(dataset);
  const categories = getCategoryMetrics(dataset);
  const stores = getStoreLeaderboard(dataset);

  // Identify Best and Worst Regions by Net Sales
  const sortedRegions = [...regions].sort((a, b) => b.netSales - a.netSales);
  const bestRegion = sortedRegions.length > 0
    ? { name: sortedRegions[0].region, sales: sortedRegions[0].netSales, achievement: sortedRegions[0].targetAchievementPct }
    : null;
  const worstRegion = sortedRegions.length > 1
    ? { name: sortedRegions[sortedRegions.length - 1].region, sales: sortedRegions[sortedRegions.length - 1].netSales, achievement: sortedRegions[sortedRegions.length - 1].targetAchievementPct }
    : null;

  // Identify Stores Missing Target (< 100% Achievement)
  const underperformingStores = stores
    .filter(s => s.targetAchievementPct < 100 && s.targetSales > 0)
    .sort((a, b) => a.targetAchievementPct - b.targetAchievementPct)
    .map(s => ({
      storeId: s.storeId,
      storeName: s.storeName,
      region: s.region,
      achievement: s.targetAchievementPct,
      gapAmount: Math.max(0, s.targetSales - s.netSales)
    }));

  // Identify Categories with High Return Rate (> 6.0%)
  const highReturnCategories = categories
    .filter(c => c.returnRatePct >= 6.0)
    .sort((a, b) => b.returnRatePct - a.returnRatePct)
    .map(c => ({
      category: c.category,
      returnRatePct: c.returnRatePct,
      returnAmount: c.returnAmount
    }));

  return {
    bestRegion,
    worstRegion,
    underperformingStores,
    highReturnCategories,
    criticalStockoutStores: stores.filter(s => s.stockoutRatePct >= 10),
    topPerformingStores: stores.filter(s => s.targetAchievementPct >= 100).slice(0, 5)
  };
}
```

#### 5. Data Download & Export Utilities
- **Export Filtered Sales Data (CSV)**: Generates a CSV file containing the exact subset of records matching all active filter selections via client-side `Blob` generation.
- **Download Executive Insights**: Exports the dynamic narrative synthesis and KPI summary table as either a formatted plain-text report (`.txt`) or structured Markdown document (`.md`).

```typescript
// Export Utilities (src/utils/dataEngine.ts)
export function exportFilteredDataToCSV(data: JoinedRecord[], filename = 'filtered_retail_sales.csv'): void {
  const headers = [
    'Store_ID', 'Store_Name', 'Region', 'City', 'Store_Format',
    'Week_Number', 'Product_Category', 'Gross_Sales', 'Net_Sales',
    'Target_Sales', 'Target_Achievement_Pct', 'Transactions', 'ATV',
    'Return_Amount', 'Return_Rate_Pct', 'Discount_Amount', 'Discount_Rate_Pct',
    'Stockout_Flag', 'Visitors'
  ];

  const rows = data.map((r) => [
    `"${r.Store_ID}"`, `"${r.Store_Name}"`, `"${r.Region}"`, `"${r.City}"`, `"${r.Store_Format}"`,
    r.Week_Number, `"${r.Product_Category}"`, r.Gross_Sales, r.Net_Sales,
    r.Target_Sales, r.Target_Achievement_Pct.toFixed(2), r.Transactions, r.ATV.toFixed(2),
    r.Return_Amount, r.Return_Rate_Pct.toFixed(2), r.Discount_Amount, r.Discount_Rate_Pct.toFixed(2),
    r.Stockout_Flag ? 'TRUE' : 'FALSE', r.Visitors ?? 0
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(url);
}
```

---

## 2. Data Integration, Architecture & Logic

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Retail Sales Intelligence Engine                     │
├────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐  ┌───────────────────────────────────────┐ │
│ │ retail_weekly_sales.xlsx │  │ store_master.xlsx                     │ │
│ │ (1,920 rows, 19 cols)   │  │ (20 stores, 5 cols)                   │ │
│ └───────────┬─────────────┘  └──────────────────┬────────────────────┘ │
│             │                                   │                      │
│             ▼                                   ▼                      │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │   In-Memory Join on Store_ID (Normalized, Case-Insensitive)  │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│                                  ▼                                     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │   Dynamic Filter Pipeline (Week · Region · Store · Category) │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│         ┌────────────────────────┼────────────────────────┐            │
│         ▼                        ▼                        ▼            │
│ ┌───────────────┐      ┌───────────────────┐    ┌────────────────────┐ │
│ │  6 KPI Cards  │      │ 5 Visual Charts   │    │ Automated Insights │ │
│ └───────────────┘      └───────────────────┘    └────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Ingestion & Joining Logic
The engine joins the sales dataset (`retail_weekly_sales.xlsx`) with the store reference master (`store_master.xlsx`) entirely in the browser memory using SheetJS.

1. **Header Tolerant Normalization**: Column headers are normalized using `normalizeKey()` (stripping whitespace, underscores, and casing), accommodating variations like `Store_ID`, `Store ID`, `storeId`, or `Store`.
2. **Indexed Lookup Join**: A `Map<string, StoreRecord>` is keyed on `storeId.trim().toLowerCase()` to achieve $O(N)$ join complexity across the 1,920 records.
3. **Metadata Merging**: Enriches each sales transaction row with `Store_Name`, `Region`, `City`, and `Store_Format`.

```typescript
// Joining Logic Implementation (src/utils/dataEngine.ts)
export function joinSalesAndStoreData(
  sales: SalesRecord[],
  stores: StoreRecord[]
): JoinedRecord[] {
  // Build O(1) Store Reference Lookup
  const storeLookup = new Map<string, StoreRecord>();
  for (const st of stores) {
    if (st.Store_ID) {
      storeLookup.set(st.Store_ID.trim().toLowerCase(), st);
    }
  }

  // Join and enrich sales dataset
  return sales.map((sale) => {
    const key = (sale.Store_ID || '').trim().toLowerCase();
    const matched = storeLookup.get(key);

    const netSales = parseSafeNumber(sale.Net_Sales, 0);
    const targetSales = parseSafeNumber(sale.Target_Sales, 0);
    const grossSales = parseSafeNumber(sale.Gross_Sales, netSales);
    const returnAmount = parseSafeNumber(sale.Return_Amount, 0);
    const discountAmount = parseSafeNumber(sale.Discount_Amount, 0);
    const transactions = parseSafeNumber(sale.Transactions, 0);

    return {
      ...sale,
      Gross_Sales: grossSales,
      Net_Sales: netSales,
      Target_Sales: targetSales,
      Return_Amount: returnAmount,
      Discount_Amount: discountAmount,
      Transactions: transactions,
      Store_Name: matched?.Store_Name ?? `Store ${sale.Store_ID}`,
      Region: matched?.Region ?? 'Unassigned',
      City: matched?.City ?? 'Unassigned',
      Store_Format: matched?.Store_Format ?? 'Standard',
      // Precomputed row-level metrics with safe division
      Target_Achievement_Pct: targetSales > 0 ? safeDivide(netSales, targetSales, 0) * 100 : 0,
      Return_Rate_Pct: netSales > 0 ? safeDivide(returnAmount, netSales, 0) * 100 : 0,
      Discount_Rate_Pct: grossSales > 0 ? safeDivide(discountAmount, grossSales, 0) * 100 : 0,
      ATV: transactions > 0 ? safeDivide(netSales, transactions, 0) : 0,
      Stockout_Flag: isStockoutRecord(sale),
      Stockout: isStockoutRecord(sale) ? 1 : 0
    };
  });
}
```

---

## 3. Mandatory Mathematical Formulas & Guardrails

The application strictly enforces the following mathematical definitions across all calculations:

### 1. Target Achievement (%)
$$\text{Target Achievement (\%)} = \left(\frac{\text{Total Net Sales}}{\text{Total Target Sales}}\right) \times 100$$
- *Guardrail*: If `Total Target Sales == 0`, returns `0` (and renders as `"N/A"` in the UI rather than `Infinity` or `NaN`).

### 2. Return Rate (%)
$$\text{Return Rate (\%)} = \left(\frac{\text{Total Return Amount}}{\text{Total Net Sales}}\right) \times 100$$
- *Guardrail*: If `Total Net Sales == 0`, returns `0.0%` (strictly uses `Net_Sales` as denominator).

### 3. Discount Rate (%)
$$\text{Discount Rate (\%)} = \left(\frac{\text{Total Discount Amount}}{\text{Total Gross Sales}}\right) \times 100$$
- *Guardrail*: If `Total Gross Sales == 0`, returns `0.0%` (strictly uses `Gross_Sales` as denominator).

### 4. Average Transaction Value (ATV)
$$\text{ATV} = \frac{\text{Total Net Sales}}{\text{Total Transactions}}$$
- *Guardrail*: If `Total Transactions == 0`, returns `0` (and renders as `"N/A"`).

### 5. Stockout Count & Stockout Rate (%)
$$\text{Stockout Count} = \sum \left[\text{Records where } \text{Stockout\_Flag} == \text{True} \text{ or } \text{Stockout} == 1\right]$$

$$\text{Stockout Rate (\%)} = \left(\frac{\text{Total Stockout Events}}{\text{Total Product-Week Records}}\right) \times 100$$

### 6. Stockout Risk Alert Thresholds
- **High Risk (Red)**: $\text{Stockout Rate} > 10.0\%$ (flagged for immediate replenishment).
- **Moderate Risk (Yellow)**: $5.0\% \le \text{Stockout Rate} \le 10.0\%$ (flagged for buffer monitoring).
- **Low Risk (Green)**: $\text{Stockout Rate} < 5.0\%$ (nominal inventory health).

### 7. Computational Guardrail Implementations
```typescript
// Safe Division & Missing Data Coercion (src/utils/dataEngine.ts)
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (
    denominator === 0 ||
    !Number.isFinite(denominator) ||
    Number.isNaN(denominator) ||
    !Number.isFinite(numerator) ||
    Number.isNaN(numerator)
  ) {
    return fallback;
  }
  const result = numerator / denominator;
  return Number.isFinite(result) && !Number.isNaN(result) ? result : fallback;
}

export function parseSafeNumber(val: unknown, fallback: number = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') {
    return Number.isFinite(val) && !Number.isNaN(val) ? val : fallback;
  }
  const cleaned = String(val).replace(/[$,%]/g, '').trim();
  if (!cleaned) return fallback;
  const num = Number(cleaned);
  return Number.isFinite(num) && !Number.isNaN(num) ? num : fallback;
}
```

---

## 4. Project Structure

```
├── .env.example                     # Environment template
├── index.html                       # HTML5 entry point with Plus Jakarta Sans & JetBrains Mono
├── metadata.json                    # Application metadata and capability declarations
├── package.json                     # Project manifest and scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite bundler configuration with Tailwind CSS v4
├── src/
│   ├── main.tsx                     # React root mount
│   ├── App.tsx                      # Dashboard root container, filter state, and layout
│   ├── index.css                    # Tailwind CSS v4 import and base typography
│   ├── types/
│   │   └── retail.ts                # TypeScript interfaces (SalesRecord, StoreRecord, KPISummary)
│   ├── data/
│   │   └── demoRetailData.ts        # 1,920-row sales and 20-store benchmark dataset generator
│   ├── utils/
│   │   └── dataEngine.ts            # Joining, KPI math, safe division, insights, and exports
│   └── components/
│       ├── Header.tsx               # Top-bar contract with navigation and quick actions
│       ├── ZeroStateUpload.tsx      # Dual-file upload dropzone and sample file downloads
│       ├── UploadModal.tsx          # Modal for uploading or updating data sources
│       ├── FilterBar.tsx            # Multi-dimensional dynamic filter controls
│       ├── KPICards.tsx             # 5 mandatory KPI cards + Stockout indicator card
│       ├── ExecutiveInsightsPanel.tsx # Automated narrative insights and export triggers
│       ├── DataTable.tsx            # Sortable, searchable, and paginated transaction ledger
│       └── Charts/
│           ├── WeeklyTrendChart.tsx # SVG Weekly Net vs. Target line chart with crosshairs
│           ├── RegionBarChart.tsx   # 5-Region sales comparison chart with target pins
│           ├── CategoryChart.tsx    # Category revenue share and return rate breakdown
│           ├── StoreLeaderboardChart.tsx # Store ranking by target achievement
│           └── StockoutRiskChart.tsx # Stockout event count and 3-tier risk alerts
```

---

## License
Apache-2.0
