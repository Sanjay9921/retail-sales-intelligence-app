# Retail Sales Intelligence Dashboard — Implementation Plan

Interactive, single-page enterprise retail analytics dashboard enabling retail executives and store managers to evaluate weekly sales performance, track target achievement, identify stockout risks, and extract automated business intelligence.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following requirements and user preferences have been confirmed and will guide the implementation:

- **Initial State**: Start with an empty state requiring file uploads first (with an optional one-click "Load Demo Dataset" quick-action button for instant exploration and testing).
- **Visual Aesthetic**: Clean Enterprise Light mode with crisp slate/neutral surfaces, corporate indigo/emerald accents, high-density layout, zero-pill typography, and tabular figures.
- **Data Exploration**: Include an interactive, sortable detailed data table with search, category filtering, and pagination alongside the 5 mandatory charts and KPI cards.
- **Client-Side Execution**: Runs 100% locally in the browser with zero external cloud dependencies or server secrets, handling client-side Excel (`.xlsx`/`.xls`) parsing via SheetJS.

---

## 1. Overview & Core Concept

The **Retail Sales Intelligence Dashboard** joins weekly sales transaction data (1,920 rows, 19 columns) with store master reference data (20 stores across 5 regions) to provide real-time multidimensional retail analysis. 

- **Primary Persona**: Retail Operations Directors, Regional Sales Heads, and Merchandise Planners.
- **Core Value Proposition**: Instant reconciliation of store target achievements, category return rates, promotional discount impacts, and inventory stockout risks without requiring complex BI desktop software.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Data Ingestion View (Zero State)**:
   - Clear dual drag-and-drop upload zone for `retail_weekly_sales.xlsx` and `store_master.xlsx`.
   - File validation checkmarks, row count previews, and column schema detection.
   - "Load Demo Dataset (1,920 rows & 20 stores)" fallback button allowing immediate testing without manual file preparation.
2. **Global Filter Bar**:
   - Single-row sticky filter toolbar: Week/Time Period multi-select or slider, Region (5 regions), Store dropdown, City dropdown, Store Format selector, and Product Category selector.
   - Active filter count indicator and one-click "Reset Filters" button.
3. **Executive KPI Strip**:
   - 5 mandatory cards: Net Sales, Target Achievement (%), Average Transaction Value (ATV), Return Rate (%), and Discount Rate (%).
   - Monospace tabular figures (`tabular-nums`) with visual progress benchmarks against targets.
4. **Visual Analytics Grid**:
   - Weekly Net vs. Target Sales line chart with crosshairs.
   - Sales by Region bar chart comparing the 5 regions.
   - Category performance breakdown chart.
   - Store leaderboard ranking top and bottom performers by achievement percentage.
   - Stockout risk and inventory health indicators by category and store.
5. **Automated Executive Insights & Export**:
   - Automated business insight cards identifying best/worst performing regions, stores missing targets, and high-return categories.
   - Export filtered dataset to CSV and download formatted executive text summary.
6. **Detailed Data Drill-Down Table**:
   - High-density table (36px row height) with column sorting, text search, and pagination.

### Visual Identity & Theme
- **Theme**: Clean Enterprise Light mode.
- **Palette**:
  - Canvas: `#F8FAFC` (Slate 50) and `#FFFFFF` (Pure White).
  - Surfaces & Borders: `#F1F5F9` (Slate 100), hairline `#E2E8F0` (Slate 200).
  - Accents: `#2563EB` (Enterprise Blue) for Net Sales, `#0D9488` (Teal) for Target Sales, `#16A34A` (Emerald) for Target Success, `#DC2626` (Rose/Crimson) for Stockouts and Underperformance.
- **Typography**: `Plus Jakarta Sans` for titles and controls; monospace tabular figures (`font-mono tabular-nums`) for all currencies, percentages, and metrics.
- **Anti-Slop Restraint**: Zero decorative glowing badges, no pill enclosures on static text labels (using quiet `·` separators), no decorative pulsers, clean hairline borders.

---

## 3. Key Product Decisions & Trade-Offs

- **Client-Side XLSX Parsing**:
  - *Chosen Approach*: Use `xlsx` (SheetJS) to read `.xlsx`, `.xls`, and `.csv` directly in memory using HTML5 `FileReader` `readAsArrayBuffer`.
  - *Why*: Ultra-fast parsing of 1,920 rows (<50ms), zero server latency, 100% data privacy, and zero backend cloud dependencies.
- **Fuzzy & Case-Insensitive Column Joining**:
  - *Chosen Approach*: Normalize headers and join on `Store_ID` (case-insensitive string trim, accommodating column variations such as `StoreID`, `Store_Id`, `Store ID`).
  - *Why*: Eliminates user frustration caused by minor column naming discrepancies between different export sources.
- **Embedded Realistic Retail Demo Generator**:
  - *Chosen Approach*: Embed an exact generator replicating the 1,920-row / 19-column schema (52 weeks, 20 stores, 5 regions, 6 categories, target formulas, stockouts) available as a 1-click fallback.
  - *Why*: Ensures immediate evaluation even before the user loads their local files, while honoring the empty-state requirement.
- **Self-Contained Responsive Charts**:
  - *Chosen Approach*: High-performance interactive SVG charts with tooltips and crosshairs (or lightweight Lucide + SVG coordinate mapping).
  - *Why*: Zero layout jank, fully responsive, zero heavy external charting bundle locks, crisp rendering in light mode.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Retail Sales Intelligence Dashboard                  │
├────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐  ┌───────────────────────────────────────┐ │
│ │  Upload Zone & Ingestion │  │  Global Filter Bar                   │ │
│ │  - retail_weekly_sales  │  │  - Week · Region · Store · Format     │ │
│ │  - store_master.xlsx    │  │  - Product Category · Reset Button    │ │
│ └───────────┬─────────────┘  └──────────────────┬────────────────────┘ │
│             │                                   │                      │
│             ▼                                   ▼                      │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │             Data Engine (Join on Store_ID + Filter)          │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│         ┌────────────────────────┼────────────────────────┐            │
│         ▼                        ▼                        ▼            │
│ ┌───────────────┐      ┌───────────────────┐    ┌────────────────────┐ │
│ │ 5 KPI Cards   │      │ 5 Visual Charts   │    │ Automated Insights │ │
│ │ - Net Sales   │      │ 1. Weekly Trend   │    │ - Top/Bottom Regs  │ │
│ │ - Achievement │      │ 2. Region Sales   │    │ - Target Misses    │ │
│ │ - ATV ($)     │      │ 3. Category Split │    │ - Return Anomalies │ │
│ │ - Return Rate │      │ 4. Store Leaderbd │    │ - Download Summary │ │
│ │ - Discount %  │      │ 5. Stockout Risk  │    │ - Download CSV     │ │
│ └───────────────┘      └───────────────────┘    └────────────────────┘ │
│                                  │                                     │
│                                  ▼                                     │
│               ┌─────────────────────────────────────┐                  │
│               │ Sortable Tabular Drill-Down Grid    │                  │
│               │ (Search, Pagination, Export)        │                  │
│               └─────────────────────────────────────┘                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Schema & Joining Logic
1. **`sales_record`**:
   - `Store_ID`, `Week`, `Date`, `Product_Category`, `Gross_Sales`, `Net_Sales`, `Target_Sales`, `Transactions`, `Return_Amount`, `Discount_Amount`, `Stockout_Status` / `Stockout_Units`, `Units_Sold`, `Margin_Amount`, `Customer_Count`, etc.
2. **`store_master`**:
   - `Store_ID`, `Store_Name`, `Region` (North, South, East, West, Central), `City`, `Store_Format` (Flagship, Outlet, Mall, High Street, Express).
3. **Calculated Metrics**:
   - `Target_Achievement_Pct` = `(Net_Sales / Target_Sales) * 100`
   - `ATV` = `Net_Sales / Transactions`
   - `Return_Rate_Pct` = `(Return_Amount / Net_Sales) * 100`
   - `Discount_Rate_Pct` = `(Discount_Amount / Gross_Sales) * 100`

---

## 5. Verification Plan

1. **Compilation & Linting**: Run `compile_applet` and verify zero TypeScript or bundler errors.
2. **File Ingestion Verification**: Test parsing of multi-sheet and single-sheet Excel files as well as CSV format.
3. **KPI Precision Verification**: Test strict mathematical adherence to formulas for Return Rate, Discount Rate, ATV, and Target Achievement.
4. **Filter Cohesion**: Ensure changing any dropdown (Week, Region, Store, Format, Category) cascades instantly across all 5 KPIs, all 5 charts, the insight text generator, and the table.
5. **Export Verification**: Verify CSV file generation and downloaded executive summary text integrity.
