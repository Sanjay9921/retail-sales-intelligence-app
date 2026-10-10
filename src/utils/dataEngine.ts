import * as XLSX from 'xlsx';
import {
  SalesRecord,
  StoreRecord,
  JoinedRecord,
  FilterState,
  KPISummary,
  RegionMetric,
  CategoryMetric,
  StoreLeaderboardItem,
  WeeklyTrendPoint,
  ExecutiveInsights,
  RiskLevel,
  EntityStockoutRisk
} from '../types/retail';

/**
 * Computational Guardrail: Safe number parsing.
 * Treats missing/null/undefined/blank/invalid values as fallback (default: 0)
 * WITHOUT dropping the record.
 */
export function parseSafeNumber(val: unknown, fallback: number = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') {
    return Number.isFinite(val) && !Number.isNaN(val) ? val : fallback;
  }
  // Strip currency symbols, commas, percent signs, and whitespace
  const cleaned = String(val).replace(/[$,%]/g, '').trim();
  if (!cleaned) return fallback;
  const num = Number(cleaned);
  return Number.isFinite(num) && !Number.isNaN(num) ? num : fallback;
}

/**
 * Computational Guardrail: Zero Division Prevention.
 * If denominator equals 0, is NaN, or is non-finite, returns fallback (default: 0)
 * preventing Infinity and NaN.
 */
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

/**
 * Normalizes text keys for tolerant column mapping
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[\s_\-–]/g, '');
}

/**
 * Stockout evaluation predicate
 * Handles Stockout_Flag == True (or Stockout == 1, or text/numeric equivalents)
 */
export function isStockoutRecord(row: Record<string, any>): boolean {
  // 1. Explicit Stockout_Flag
  if (row.Stockout_Flag !== undefined && row.Stockout_Flag !== null) {
    if (typeof row.Stockout_Flag === 'boolean') return row.Stockout_Flag;
    const str = String(row.Stockout_Flag).trim().toLowerCase();
    if (str === 'true' || str === '1' || str === 'yes') return true;
    if (str === 'false' || str === '0' || str === 'no') return false;
  }

  // 2. Explicit Stockout (binary or boolean)
  if (row.Stockout !== undefined && row.Stockout !== null) {
    if (typeof row.Stockout === 'boolean') return row.Stockout;
    if (typeof row.Stockout === 'number') return row.Stockout === 1;
    const str = String(row.Stockout).trim().toLowerCase();
    if (str === '1' || str === 'true' || str === 'yes') return true;
    if (str === '0' || str === 'false' || str === 'no') return false;
  }

  // 3. Fallback to Stockout_Status text inspection
  if (row.Stockout_Status) {
    const s = String(row.Stockout_Status).trim().toLowerCase();
    if (s.includes('out of stock') || s.includes('stockout') || s === 'risk' || s === 'shortage') {
      return true;
    }
  }

  return false;
}

/**
 * Risk Level classifier according to business rules:
 * - High Risk (Red): Stockout Rate > 10%
 * - Moderate Risk (Yellow): Stockout Rate between 5% and 10%
 * - Low Risk (Green): Stockout Rate < 5%
 */
export function calculateRiskLevel(ratePct: number): RiskLevel {
  if (ratePct > 10.0) return 'High';
  if (ratePct >= 5.0) return 'Moderate';
  return 'Low';
}

/**
 * Standardizes raw uploaded Sales record to typed SalesRecord
 * Robust Guardrail: Treats missing/null values in numeric columns (Return_Amount,
 * Discount_Amount, etc.) as 0 without dropping the corresponding sales records.
 */
export function normalizeSalesRow(row: Record<string, any>): SalesRecord {
  const normMap: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    normMap[normalizeKey(k)] = v;
  }

  const storeId = String(normMap['storeid'] || normMap['store'] || normMap['id'] || '').trim();
  const rawWeek = normMap['weeknumber'] ?? normMap['week'] ?? normMap['weeknum'] ?? 1;
  const weekNum = typeof rawWeek === 'string' && !isNaN(Number(rawWeek.replace(/\D/g, '')))
    ? Number(rawWeek.replace(/\D/g, ''))
    : rawWeek;
  const weekDate = normMap['weekstartdate'] ?? normMap['date'] ?? normMap['startdate'] ?? '';
  const category = String(normMap['productcategory'] || normMap['category'] || normMap['cat'] || 'General Retail').trim();
  
  // Safe number parsing - null/missing/empty values become 0 without dropping row
  const grossSales = parseSafeNumber(normMap['grosssales'] ?? normMap['gross'], 0);
  let netSales = parseSafeNumber(normMap['netsales'] ?? normMap['net'], 0);
  const targetSales = parseSafeNumber(normMap['targetsales'] ?? normMap['target'], 0);
  const transactions = parseSafeNumber(normMap['transactions'] ?? normMap['trans'] ?? normMap['orders'], 0);
  const returnAmount = parseSafeNumber(normMap['returnamount'] ?? normMap['returns'] ?? normMap['refunds'], 0);
  const discountAmount = parseSafeNumber(normMap['discountamount'] ?? normMap['discount'] ?? normMap['discounts'], 0);
  const visitors = parseSafeNumber(normMap['visitors'] ?? normMap['footfall'] ?? normMap['customercount'] ?? normMap['customers'], 0);

  // If gross was supplied but net was 0 or missing, compute gross - discount safely
  if (netSales === 0 && grossSales > 0) {
    netSales = Math.max(0, grossSales - discountAmount);
  }

  const stockoutStatus = String(
    normMap['stockoutstatus'] || normMap['stockout'] || normMap['status'] || 'In Stock'
  ).trim();

  // Determine stockout boolean
  const isStockout = isStockoutRecord({
    Stockout_Flag: normMap['stockoutflag'] ?? normMap['isstockout'],
    Stockout: normMap['stockout'],
    Stockout_Status: stockoutStatus,
    ...row
  });

  const stockoutUnits = parseSafeNumber(normMap['stockoutunits'] ?? normMap['unitslost'], 0);
  const unitsSold = parseSafeNumber(normMap['unitssold'] ?? normMap['units'], 0);
  const marginAmount = parseSafeNumber(normMap['marginamount'] ?? normMap['margin'], 0);
  const promoType = String(normMap['promotiontype'] || normMap['promo'] || 'Regular').trim();
  const channel = String(normMap['channel'] || 'Retail Store').trim();
  const returnTrans = parseSafeNumber(normMap['returntransactions'] ?? normMap['returntrans'], 0);
  const inventoryUnits = parseSafeNumber(normMap['inventoryunits'] ?? normMap['inventory'], 0);

  return {
    Store_ID: storeId,
    Week_Number: weekNum,
    Week_Start_Date: String(weekDate),
    Product_Category: category,
    Gross_Sales: grossSales || (netSales + discountAmount),
    Net_Sales: netSales,
    Target_Sales: targetSales,
    Transactions: Math.max(0, transactions),
    Return_Amount: returnAmount,
    Discount_Amount: discountAmount,
    Stockout_Status: isStockout && stockoutStatus.toLowerCase() === 'in stock' ? 'Out of Stock' : stockoutStatus,
    Stockout_Flag: isStockout,
    Stockout: isStockout ? 1 : 0,
    Stockout_Units: stockoutUnits,
    Units_Sold: unitsSold,
    Margin_Amount: marginAmount,
    Customer_Count: visitors || transactions,
    Visitors: visitors || transactions,
    Promotion_Type: promoType,
    Channel: channel,
    Return_Transactions: returnTrans,
    Inventory_Units: inventoryUnits,
    ...row
  };
}

/**
 * Standardizes raw uploaded Store Master record to typed StoreRecord
 */
export function normalizeStoreRow(row: Record<string, any>): StoreRecord {
  const normMap: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    normMap[normalizeKey(k)] = v;
  }

  const storeId = String(normMap['storeid'] || normMap['store'] || normMap['id'] || '').trim();
  const storeName = String(normMap['storename'] || normMap['name'] || `Store ${storeId}`).trim();
  const region = String(normMap['region'] || normMap['zone'] || normMap['territory'] || 'Central').trim();
  const city = String(normMap['city'] || normMap['location'] || 'Metropolitan').trim();
  const format = String(normMap['storeformat'] || normMap['format'] || normMap['type'] || 'Standard').trim();

  return {
    Store_ID: storeId,
    Store_Name: storeName,
    Region: region,
    City: city,
    Store_Format: format,
    ...row
  };
}

/**
 * Joins sales dataset with store master on Store_ID.
 * Computational Guardrails Applied:
 * - Target Achievement: 0 if Target_Sales == 0 (no Infinity/NaN)
 * - Return Rate: 0 if Net_Sales == 0 (no Infinity/NaN)
 * - Discount Rate: 0 if Gross_Sales == 0 (no Infinity/NaN)
 * - ATV: 0 if Transactions == 0 (no Infinity/NaN)
 * - Conversion Rate: 0 if Visitors == 0 (no Infinity/NaN)
 */
export function joinSalesAndStoreData(
  sales: SalesRecord[],
  stores: StoreRecord[]
): JoinedRecord[] {
  const storeLookup = new Map<string, StoreRecord>();
  for (const st of stores) {
    if (st.Store_ID) {
      storeLookup.set(st.Store_ID.trim().toLowerCase(), st);
    }
  }

  return sales.map((sale) => {
    const key = (sale.Store_ID || '').trim().toLowerCase();
    const matchedStore = storeLookup.get(key);

    const storeName = matchedStore ? matchedStore.Store_Name : `Store ${sale.Store_ID || 'Unknown'}`;
    const region = matchedStore ? matchedStore.Region : 'Unassigned';
    const city = matchedStore ? matchedStore.City : 'Unassigned';
    const storeFormat = matchedStore ? matchedStore.Store_Format : 'Standard';

    // Zero-division protected metrics
    const targetAchievementPct = sale.Target_Sales > 0
      ? safeDivide(sale.Net_Sales, sale.Target_Sales, 0) * 100
      : 0;

    const returnRatePct = sale.Net_Sales > 0
      ? safeDivide(sale.Return_Amount, sale.Net_Sales, 0) * 100
      : 0;

    const discountRatePct = sale.Gross_Sales > 0
      ? safeDivide(sale.Discount_Amount, sale.Gross_Sales, 0) * 100
      : 0;

    const atv = sale.Transactions > 0
      ? safeDivide(sale.Net_Sales, sale.Transactions, 0)
      : 0;

    const visitors = Number(sale.Visitors ?? sale.Customer_Count ?? sale.Transactions ?? 0);
    const conversionRatePct = visitors > 0
      ? safeDivide(sale.Transactions, visitors, 0) * 100
      : 0;

    const isStockout = isStockoutRecord(sale);

    return {
      ...sale,
      Store_Name: storeName,
      Region: region,
      City: city,
      Store_Format: storeFormat,
      Target_Achievement_Pct: targetAchievementPct,
      Return_Rate_Pct: returnRatePct,
      Discount_Rate_Pct: discountRatePct,
      ATV: atv,
      Visitors: visitors,
      Conversion_Rate_Pct: conversionRatePct,
      Stockout_Flag: isStockout,
      Stockout: isStockout ? 1 : 0
    };
  });
}

/**
 * Filter Recalculation Engine:
 * Ensures every calculation dynamically re-executes whenever any global filter
 * (Week, Region, Store, City, Format, Category) or search query changes.
 */
export function filterDataset(
  dataset: JoinedRecord[],
  filters: FilterState
): JoinedRecord[] {
  return dataset.filter((row) => {
    // 1. Week Filter
    if (filters.week !== 'all') {
      const rowWeekStr = String(row.Week_Number);
      if (rowWeekStr !== filters.week && `Week ${rowWeekStr}` !== filters.week) {
        return false;
      }
    }

    // 2. Region Filter
    if (filters.region !== 'all' && row.Region !== filters.region) {
      return false;
    }

    // 3. Store Filter
    if (filters.storeId !== 'all' && row.Store_ID !== filters.storeId) {
      return false;
    }

    // 4. City Filter
    if (filters.city !== 'all' && row.City !== filters.city) {
      return false;
    }

    // 5. Store Format Filter
    if (filters.storeFormat !== 'all' && row.Store_Format !== filters.storeFormat) {
      return false;
    }

    // 6. Category Filter
    if (filters.category !== 'all' && row.Product_Category !== filters.category) {
      return false;
    }

    // 7. Search Query Filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        (row.Store_Name && row.Store_Name.toLowerCase().includes(q)) ||
        (row.Store_ID && row.Store_ID.toLowerCase().includes(q)) ||
        (row.Region && row.Region.toLowerCase().includes(q)) ||
        (row.City && row.City.toLowerCase().includes(q)) ||
        (row.Product_Category && row.Product_Category.toLowerCase().includes(q)) ||
        (row.Store_Format && row.Store_Format.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });
}

/**
 * KPI Calculations strictly adhering to formulas with Zero-Division Guardrails:
 * 1. Net Sales: Sum of total sales
 * 2. Target Achievement (%): (Total Net Sales / Total Target Sales) * 100 -> 0 if Target_Sales == 0
 * 3. Average Transaction Value (ATV): Total Net Sales / Total Transactions -> 0 if Transactions == 0
 * 4. Return Rate (%): (Total Return Amount / Total Net Sales) * 100 -> 0 if Net_Sales == 0
 * 5. Discount Rate (%): (Total Discount Amount / Total Gross Sales) * 100 -> 0 if Gross_Sales == 0
 * 6. Conversion Rate (%): (Total Transactions / Total Visitors) * 100 -> 0 if Visitors == 0
 * 7. Stockout Count: Aggregate total where Stockout_Flag == True (or Stockout == 1)
 * 8. Stockout Rate (%): (Total Stockout Events / Total Product-Week Records) * 100 -> 0 if records == 0
 */
export function calculateKPISummary(dataset: JoinedRecord[]): KPISummary {
  if (dataset.length === 0) {
    return {
      totalNetSales: 0,
      totalGrossSales: 0,
      totalTargetSales: 0,
      totalTransactions: 0,
      totalReturnAmount: 0,
      totalDiscountAmount: 0,
      totalVisitors: 0,
      conversionRatePct: 0,
      targetAchievementPct: 0,
      atv: 0,
      returnRatePct: 0,
      discountRatePct: 0,
      recordCount: 0,
      totalStockouts: 0,
      stockoutRatePct: 0,
      stockoutRiskLevel: 'Low'
    };
  }

  let totalNetSales = 0;
  let totalGrossSales = 0;
  let totalTargetSales = 0;
  let totalTransactions = 0;
  let totalReturnAmount = 0;
  let totalDiscountAmount = 0;
  let totalVisitors = 0;
  let totalStockouts = 0;

  for (const row of dataset) {
    totalNetSales += parseSafeNumber(row.Net_Sales, 0);
    totalGrossSales += parseSafeNumber(row.Gross_Sales, 0);
    totalTargetSales += parseSafeNumber(row.Target_Sales, 0);
    totalTransactions += parseSafeNumber(row.Transactions, 0);
    totalReturnAmount += parseSafeNumber(row.Return_Amount, 0);
    totalDiscountAmount += parseSafeNumber(row.Discount_Amount, 0);
    totalVisitors += parseSafeNumber(row.Visitors ?? row.Customer_Count ?? row.Transactions, 0);

    // Stockout Count aggregation
    if (isStockoutRecord(row)) {
      totalStockouts++;
    }
  }

  // Robust Zero-Division Guardrails
  const targetAchievementPct = totalTargetSales > 0
    ? safeDivide(totalNetSales, totalTargetSales, 0) * 100
    : 0;

  const atv = totalTransactions > 0
    ? safeDivide(totalNetSales, totalTransactions, 0)
    : 0;

  const returnRatePct = totalNetSales > 0
    ? safeDivide(totalReturnAmount, totalNetSales, 0) * 100
    : 0;

  const discountRatePct = totalGrossSales > 0
    ? safeDivide(totalDiscountAmount, totalGrossSales, 0) * 100
    : 0;

  const conversionRatePct = totalVisitors > 0
    ? safeDivide(totalTransactions, totalVisitors, 0) * 100
    : 0;

  const stockoutRatePct = dataset.length > 0
    ? safeDivide(totalStockouts, dataset.length, 0) * 100
    : 0;

  const stockoutRiskLevel = calculateRiskLevel(stockoutRatePct);

  return {
    totalNetSales,
    totalGrossSales,
    totalTargetSales,
    totalTransactions,
    totalReturnAmount,
    totalDiscountAmount,
    totalVisitors,
    conversionRatePct,
    targetAchievementPct,
    atv,
    returnRatePct,
    discountRatePct,
    recordCount: dataset.length,
    totalStockouts,
    stockoutRatePct,
    stockoutRiskLevel
  };
}

/**
 * 1. Weekly Trend (Net Sales vs Target Sales)
 */
export function getWeeklyTrend(dataset: JoinedRecord[]): WeeklyTrendPoint[] {
  const weekMap = new Map<number, { net: number; target: number }>();

  for (const row of dataset) {
    const rawWeek = typeof row.Week_Number === 'number' 
      ? row.Week_Number 
      : parseInt(String(row.Week_Number).replace(/\D/g, ''), 10) || 1;
    
    const existing = weekMap.get(rawWeek) || { net: 0, target: 0 };
    existing.net += parseSafeNumber(row.Net_Sales, 0);
    existing.target += parseSafeNumber(row.Target_Sales, 0);
    weekMap.set(rawWeek, existing);
  }

  const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => a - b);

  return sortedWeeks.map((w) => {
    const item = weekMap.get(w)!;
    const achievementPct = item.target > 0
      ? safeDivide(item.net, item.target, 0) * 100
      : 0;
    return {
      week: `W${w.toString().padStart(2, '0')}`,
      weekNumber: w,
      netSales: item.net,
      targetSales: item.target,
      achievementPct
    };
  });
}

/**
 * 2. Sales by Region Bar Chart (Covers all 5 regions)
 */
export function getRegionMetrics(dataset: JoinedRecord[]): RegionMetric[] {
  const regionMap = new Map<
    string,
    { net: number; target: number; trans: number; returns: number; stores: Set<string>; stockouts: number; count: number }
  >();

  for (const row of dataset) {
    const reg = row.Region || 'Unassigned';
    const entry = regionMap.get(reg) || {
      net: 0,
      target: 0,
      trans: 0,
      returns: 0,
      stores: new Set(),
      stockouts: 0,
      count: 0
    };
    entry.net += parseSafeNumber(row.Net_Sales, 0);
    entry.target += parseSafeNumber(row.Target_Sales, 0);
    entry.trans += parseSafeNumber(row.Transactions, 0);
    entry.returns += parseSafeNumber(row.Return_Amount, 0);
    entry.count += 1;
    if (isStockoutRecord(row)) {
      entry.stockouts += 1;
    }
    if (row.Store_ID) entry.stores.add(row.Store_ID);
    regionMap.set(reg, entry);
  }

  const results: RegionMetric[] = [];
  for (const [region, data] of regionMap.entries()) {
    const targetAchievementPct = data.target > 0
      ? safeDivide(data.net, data.target, 0) * 100
      : 0;
    const returnRatePct = data.net > 0
      ? safeDivide(data.returns, data.net, 0) * 100
      : 0;
    const ratePct = data.count > 0
      ? safeDivide(data.stockouts, data.count, 0) * 100
      : 0;

    results.push({
      region,
      netSales: data.net,
      targetSales: data.target,
      targetAchievementPct,
      transactions: data.trans,
      returnRatePct,
      storeCount: data.stores.size,
      stockoutCount: data.stockouts,
      totalRecords: data.count,
      stockoutRatePct: ratePct,
      riskLevel: calculateRiskLevel(ratePct)
    });
  }

  return results.sort((a, b) => b.netSales - a.netSales);
}

/**
 * 3. Category Performance Breakdown with Stockout Metrics
 */
export function getCategoryMetrics(dataset: JoinedRecord[]): CategoryMetric[] {
  const catMap = new Map<
    string,
    { net: number; target: number; returns: number; stockouts: number; count: number }
  >();

  for (const row of dataset) {
    const cat = row.Product_Category || 'Other';
    const entry = catMap.get(cat) || { net: 0, target: 0, returns: 0, stockouts: 0, count: 0 };
    entry.net += parseSafeNumber(row.Net_Sales, 0);
    entry.target += parseSafeNumber(row.Target_Sales, 0);
    entry.returns += parseSafeNumber(row.Return_Amount, 0);
    entry.count += 1;
    if (isStockoutRecord(row)) {
      entry.stockouts += 1;
    }
    catMap.set(cat, entry);
  }

  const results: CategoryMetric[] = [];
  for (const [category, data] of catMap.entries()) {
    const targetAchievementPct = data.target > 0
      ? safeDivide(data.net, data.target, 0) * 100
      : 0;
    const returnRatePct = data.net > 0
      ? safeDivide(data.returns, data.net, 0) * 100
      : 0;
    const ratePct = data.count > 0
      ? safeDivide(data.stockouts, data.count, 0) * 100
      : 0;

    results.push({
      category,
      netSales: data.net,
      targetSales: data.target,
      targetAchievementPct,
      returnAmount: data.returns,
      returnRatePct,
      stockoutCount: data.stockouts,
      totalRecords: data.count,
      stockoutRatePct: ratePct,
      riskLevel: calculateRiskLevel(ratePct)
    });
  }

  return results.sort((a, b) => b.netSales - a.netSales);
}

/**
 * 4. Store Leaderboard with Zero-Division Guardrails
 */
export function getStoreLeaderboard(dataset: JoinedRecord[]): StoreLeaderboardItem[] {
  const storeMap = new Map<
    string,
    {
      storeName: string;
      region: string;
      city: string;
      storeFormat: string;
      net: number;
      target: number;
      stockouts: number;
      count: number;
    }
  >();

  for (const row of dataset) {
    const id = row.Store_ID;
    const entry = storeMap.get(id) || {
      storeName: row.Store_Name,
      region: row.Region,
      city: row.City,
      storeFormat: row.Store_Format,
      net: 0,
      target: 0,
      stockouts: 0,
      count: 0
    };
    entry.net += parseSafeNumber(row.Net_Sales, 0);
    entry.target += parseSafeNumber(row.Target_Sales, 0);
    entry.count += 1;
    if (isStockoutRecord(row)) {
      entry.stockouts += 1;
    }
    storeMap.set(id, entry);
  }

  const results: StoreLeaderboardItem[] = [];
  for (const [storeId, d] of storeMap.entries()) {
    const achievement = d.target > 0
      ? safeDivide(d.net, d.target, 0) * 100
      : 0;
    const ratePct = d.count > 0
      ? safeDivide(d.stockouts, d.count, 0) * 100
      : 0;

    results.push({
      storeId,
      storeName: d.storeName,
      region: d.region,
      city: d.city,
      storeFormat: d.storeFormat,
      netSales: d.net,
      targetSales: d.target,
      targetAchievementPct: achievement,
      targetVariance: d.net - d.target,
      stockoutCount: d.stockouts,
      totalRecords: d.count,
      stockoutRatePct: ratePct,
      riskLevel: calculateRiskLevel(ratePct)
    });
  }

  return results.sort((a, b) => b.targetAchievementPct - a.targetAchievementPct);
}

/**
 * 5. Stockout Risk Indicator & Summary
 * Guardrail: Safe rate calculation (0 if records == 0)
 */
export function getStockoutRiskMetrics(dataset: JoinedRecord[]) {
  const categoryStats = new Map<string, { stockouts: number; count: number; lostUnits: number }>();
  const storeStats = new Map<
    string,
    { storeName: string; region: string; stockouts: number; count: number; lostUnits: number }
  >();

  for (const row of dataset) {
    const isStockout = isStockoutRecord(row);

    // Category aggregation
    const cat = row.Product_Category;
    const curCat = categoryStats.get(cat) || { stockouts: 0, count: 0, lostUnits: 0 };
    curCat.count += 1;
    if (isStockout) {
      curCat.stockouts += 1;
      curCat.lostUnits += parseSafeNumber(row.Stockout_Units, 0);
    }
    categoryStats.set(cat, curCat);

    // Store aggregation
    const stId = row.Store_ID;
    const curStore = storeStats.get(stId) || {
      storeName: row.Store_Name,
      region: row.Region,
      stockouts: 0,
      count: 0,
      lostUnits: 0
    };
    curStore.count += 1;
    if (isStockout) {
      curStore.stockouts += 1;
      curStore.lostUnits += parseSafeNumber(row.Stockout_Units, 0);
    }
    storeStats.set(stId, curStore);
  }

  // Convert categories
  const byCategory: EntityStockoutRisk[] = Array.from(categoryStats.entries())
    .map(([cat, val]) => {
      const ratePct = val.count > 0 ? safeDivide(val.stockouts, val.count, 0) * 100 : 0;
      return {
        id: cat,
        name: cat,
        type: 'Category' as const,
        stockoutCount: val.stockouts,
        totalRecords: val.count,
        stockoutRatePct: ratePct,
        riskLevel: calculateRiskLevel(ratePct),
        unitsLost: val.lostUnits
      };
    })
    .sort((a, b) => b.stockoutRatePct - a.stockoutRatePct);

  // Convert stores
  const byStore: EntityStockoutRisk[] = Array.from(storeStats.entries())
    .map(([id, val]) => {
      const ratePct = val.count > 0 ? safeDivide(val.stockouts, val.count, 0) * 100 : 0;
      return {
        id,
        name: val.storeName,
        region: val.region,
        type: 'Store' as const,
        stockoutCount: val.stockouts,
        totalRecords: val.count,
        stockoutRatePct: ratePct,
        riskLevel: calculateRiskLevel(ratePct),
        unitsLost: val.lostUnits
      };
    })
    .sort((a, b) => b.stockoutRatePct - a.stockoutRatePct);

  return {
    byCategory,
    byStore,
    highRiskStores: byStore.filter((s) => s.riskLevel === 'High'),
    moderateRiskStores: byStore.filter((s) => s.riskLevel === 'Moderate'),
    lowRiskStores: byStore.filter((s) => s.riskLevel === 'Low'),
    highRiskCategories: byCategory.filter((c) => c.riskLevel === 'High'),
    moderateRiskCategories: byCategory.filter((c) => c.riskLevel === 'Moderate'),
    lowRiskCategories: byCategory.filter((c) => c.riskLevel === 'Low')
  };
}

/**
 * Automated Executive Text Insight Summary
 */
export function generateExecutiveInsights(
  dataset: JoinedRecord[],
  kpis: KPISummary
): ExecutiveInsights {
  if (dataset.length === 0) {
    return {
      bestRegion: null,
      worstRegion: null,
      underperformingStores: [],
      highReturnCategories: [],
      stockoutAlerts: {
        overallRate: 0,
        overallLevel: 'Low',
        highRiskStores: [],
        moderateRiskStores: [],
        lowRiskStores: [],
        highRiskCategories: [],
        moderateRiskCategories: [],
        lowRiskCategories: []
      },
      summaryNarrative: 'No sales records match the active filter selection.'
    };
  }

  const regionMetrics = getRegionMetrics(dataset);
  const bestRegion = regionMetrics.length > 0 
    ? { name: regionMetrics[0].region, sales: regionMetrics[0].netSales, achievement: regionMetrics[0].targetAchievementPct }
    : null;
  const worstRegion = regionMetrics.length > 1
    ? { 
        name: regionMetrics[regionMetrics.length - 1].region, 
        sales: regionMetrics[regionMetrics.length - 1].netSales, 
        achievement: regionMetrics[regionMetrics.length - 1].targetAchievementPct 
      }
    : null;

  // Stores missing targets
  const leaderboard = getStoreLeaderboard(dataset);
  const underperformingStores = leaderboard
    .filter((s) => s.targetSales > 0 && s.targetAchievementPct < 100)
    .sort((a, b) => a.targetAchievementPct - b.targetAchievementPct)
    .map((s) => ({
      storeId: s.storeId,
      storeName: s.storeName,
      region: s.region,
      achievement: s.targetAchievementPct,
      gapAmount: Math.abs(s.targetVariance)
    }));

  // High return categories
  const categoryMetrics = getCategoryMetrics(dataset);
  const overallReturnRate = kpis.returnRatePct;
  const highReturnCategories = categoryMetrics
    .filter((c) => c.netSales > 0 && c.returnRatePct > Math.max(5.0, overallReturnRate * 1.1))
    .sort((a, b) => b.returnRatePct - a.returnRatePct)
    .map((c) => ({
      category: c.category,
      returnRate: c.returnRatePct,
      returnAmount: c.returnAmount,
      totalSales: c.netSales
    }));

  // Stockout risk breakdown
  const {
    highRiskStores,
    moderateRiskStores,
    lowRiskStores,
    highRiskCategories,
    moderateRiskCategories,
    lowRiskCategories
  } = getStockoutRiskMetrics(dataset);

  const stockoutAlerts = {
    overallRate: kpis.stockoutRatePct,
    overallLevel: kpis.stockoutRiskLevel,
    highRiskStores,
    moderateRiskStores,
    lowRiskStores,
    highRiskCategories,
    moderateRiskCategories,
    lowRiskCategories
  };

  // Synthesize narrative
  const narrativeParts: string[] = [];
  if (bestRegion) {
    narrativeParts.push(
      `Regional leadership is led by ${bestRegion.name} with ${formatCurrency(bestRegion.sales)} in Net Sales (${formatPercent(bestRegion.achievement)} target achievement).`
    );
  }
  if (worstRegion && worstRegion.name !== bestRegion?.name) {
    narrativeParts.push(
      `${worstRegion.name} lags behind with ${formatCurrency(worstRegion.sales)} (${formatPercent(worstRegion.achievement)} target realization).`
    );
  }
  if (underperformingStores.length > 0) {
    const worstStore = underperformingStores[0];
    narrativeParts.push(
      `${underperformingStores.length} store${underperformingStores.length > 1 ? 's are' : ' is'} currently missing revenue quotas, notably ${worstStore.storeName} (${formatPercent(worstStore.achievement)} of target, -${formatCurrency(worstStore.gapAmount)} gap).`
    );
  } else {
    narrativeParts.push('All evaluated store locations have met or surpassed their respective sales targets.');
  }

  if (highReturnCategories.length > 0) {
    const highestRet = highReturnCategories[0];
    narrativeParts.push(
      `Return rate friction is concentrated in ${highestRet.category} at ${formatPercent(highestRet.returnRate)} (${formatCurrency(highestRet.returnAmount)} returned).`
    );
  }

  // Stockout Risk narrative
  if (highRiskStores.length > 0 || highRiskCategories.length > 0) {
    const highEntities = [
      ...highRiskStores.map((s) => s.name),
      ...highRiskCategories.map((c) => c.name)
    ];
    narrativeParts.push(
      `Stockout Risk Alert: Overall stockout rate is ${formatPercent(kpis.stockoutRatePct)} (${kpis.stockoutRiskLevel} Risk). High stockout risk (>10%) detected in ${highEntities.slice(0, 3).join(', ')}.`
    );
  } else if (kpis.stockoutRiskLevel === 'Moderate') {
    narrativeParts.push(
      `Stockout Risk Alert: Moderate stockout risk (${formatPercent(kpis.stockoutRatePct)}), monitor replenishment cycles.`
    );
  } else {
    narrativeParts.push(
      `Stockout Risk Alert: Inventory health is Low Risk (${formatPercent(kpis.stockoutRatePct)} stockout rate).`
    );
  }

  return {
    bestRegion,
    worstRegion,
    underperformingStores,
    highReturnCategories,
    stockoutAlerts,
    summaryNarrative: narrativeParts.join(' ')
  };
}

/**
 * Format currency helper with NaN/Infinity guardrails
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount) || Number.isNaN(amount)) {
    return '$0';
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatExactCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount) || Number.isNaN(amount)) {
    return '$0.00';
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format percentage with NaN/Infinity guardrails.
 * Returns "N/A" if hasDenominator is false or value is undefined/NaN.
 */
export function formatPercent(value: number | null | undefined, hasDenominator: boolean = true): string {
  if (!hasDenominator || value === null || value === undefined || !Number.isFinite(value) || Number.isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(1)}%`;
}

/**
 * Generates formatted plain-text executive summary for download
 */
export function generatePlainTextSummary(
  kpis: KPISummary,
  insights: ExecutiveInsights,
  filters: FilterState
): string {
  const timestamp = new Date().toLocaleString();
  const filterSummary = [
    `Week: ${filters.week === 'all' ? 'All Weeks' : filters.week}`,
    `Region: ${filters.region === 'all' ? 'All 5 Regions' : filters.region}`,
    `Store: ${filters.storeId === 'all' ? 'All Stores' : filters.storeId}`,
    `City: ${filters.city === 'all' ? 'All Cities' : filters.city}`,
    `Store Format: ${filters.storeFormat === 'all' ? 'All Formats' : filters.storeFormat}`,
    `Category: ${filters.category === 'all' ? 'All Categories' : filters.category}`
  ].join(' | ');

  let content = `========================================================================\n`;
  content += `RETAIL SALES INTELLIGENCE REPORT\n`;
  content += `Generated: ${timestamp}\n`;
  content += `Active Filters: ${filterSummary}\n`;
  content += `========================================================================\n\n`;

  content += `1. KEY PERFORMANCE METRICS (KPIS)\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `* Total Net Sales:             ${formatExactCurrency(kpis.totalNetSales)}\n`;
  content += `* Target Sales:                ${formatExactCurrency(kpis.totalTargetSales)}\n`;
  content += `* Target Achievement:          ${kpis.totalTargetSales > 0 ? formatPercent(kpis.targetAchievementPct) : 'N/A'}\n`;
  content += `* Average Transaction Value:   ${kpis.totalTransactions > 0 ? formatExactCurrency(kpis.atv) : 'N/A'}\n`;
  content += `* Total Transactions:          ${kpis.totalTransactions.toLocaleString()}\n`;
  content += `* Total Footfall / Visitors:   ${kpis.totalVisitors.toLocaleString()}\n`;
  content += `* Visitor Conversion Rate:     ${kpis.totalVisitors > 0 ? formatPercent(kpis.conversionRatePct) : 'N/A'}\n`;
  content += `* Return Rate:                 ${kpis.totalNetSales > 0 ? formatPercent(kpis.returnRatePct) : 'N/A'} (${formatExactCurrency(kpis.totalReturnAmount)})\n`;
  content += `* Discount Rate:               ${kpis.totalGrossSales > 0 ? formatPercent(kpis.discountRatePct) : 'N/A'} (${formatExactCurrency(kpis.totalDiscountAmount)})\n`;
  content += `* Total Stockout Count:        ${kpis.totalStockouts} (weeks/items where Stockout_Flag == True)\n`;
  content += `* Stockout Rate:               ${kpis.recordCount > 0 ? formatPercent(kpis.stockoutRatePct) : 'N/A'} (${kpis.totalStockouts} / ${kpis.recordCount} product-week records)\n`;
  content += `* Stockout Risk Alert:         ${kpis.stockoutRiskLevel.toUpperCase()} RISK\n\n`;

  content += `2. STOCKOUT RISK ALERTS\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `* Overall Risk Level: ${kpis.stockoutRiskLevel} (${formatPercent(kpis.stockoutRatePct)})\n`;
  content += `* High Risk Stores (>10%):     ${insights.stockoutAlerts.highRiskStores.length}\n`;
  content += `* Moderate Risk Stores (5-10%): ${insights.stockoutAlerts.moderateRiskStores.length}\n`;
  content += `* Low Risk Stores (<5%):        ${insights.stockoutAlerts.lowRiskStores.length}\n\n`;

  if (insights.stockoutAlerts.highRiskStores.length > 0) {
    content += `High Risk Stores:\n`;
    insights.stockoutAlerts.highRiskStores.forEach((s) => {
      content += `  - [${s.id}] ${s.name} (${s.region}): ${formatPercent(s.stockoutRatePct)} stockout rate (${s.stockoutCount}/${s.totalRecords} records)\n`;
    });
  }

  if (insights.stockoutAlerts.highRiskCategories.length > 0) {
    content += `High Risk Categories:\n`;
    insights.stockoutAlerts.highRiskCategories.forEach((c) => {
      content += `  - ${c.name}: ${formatPercent(c.stockoutRatePct)} stockout rate (${c.stockoutCount}/${c.totalRecords} records)\n`;
    });
  }

  content += `\n3. EXECUTIVE BUSINESS INSIGHTS\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `Overview Narrative:\n${insights.summaryNarrative}\n\n`;

  if (insights.bestRegion) {
    content += `* Best Performing Region:  ${insights.bestRegion.name} (${formatExactCurrency(insights.bestRegion.sales)} | ${formatPercent(insights.bestRegion.achievement)} of Target)\n`;
  }
  if (insights.worstRegion) {
    content += `* Lowest Performing Region: ${insights.worstRegion.name} (${formatExactCurrency(insights.worstRegion.sales)} | ${formatPercent(insights.worstRegion.achievement)} of Target)\n`;
  }

  content += `\n4. STORES MISSING TARGETS (${insights.underperformingStores.length} Store${insights.underperformingStores.length !== 1 ? 's' : ''})\n`;
  content += `------------------------------------------------------------------------\n`;
  if (insights.underperformingStores.length === 0) {
    content += `All stores within the current selection reached or surpassed their sales target.\n`;
  } else {
    insights.underperformingStores.forEach((s, idx) => {
      content += `${idx + 1}. [${s.storeId}] ${s.storeName} (${s.region}) - Achievement: ${formatPercent(s.achievement)} | Shortfall: -${formatExactCurrency(s.gapAmount)}\n`;
    });
  }

  content += `\n5. HIGH RETURN PRODUCT CATEGORIES\n`;
  content += `------------------------------------------------------------------------\n`;
  if (insights.highReturnCategories.length === 0) {
    content += `All categories maintain acceptable return margins within normal benchmarks.\n`;
  } else {
    insights.highReturnCategories.forEach((c, idx) => {
      content += `${idx + 1}. ${c.category}: ${formatPercent(c.returnRate)} Return Rate (${formatExactCurrency(c.returnAmount)} returned on ${formatExactCurrency(c.totalSales)} net sales)\n`;
    });
  }

  content += `\n========================================================================\n`;
  content += `END OF REPORT - Retail Sales Intelligence System\n`;
  return content;
}

/**
 * Generates formatted Markdown (.md) executive summary for download
 */
export function generateMarkdownSummary(
  kpis: KPISummary,
  insights: ExecutiveInsights,
  filters: FilterState
): string {
  const timestamp = new Date().toLocaleString();
  const filterSummary = [
    `**Week:** ${filters.week === 'all' ? 'All Weeks' : filters.week}`,
    `**Region:** ${filters.region === 'all' ? 'All 5 Regions' : filters.region}`,
    `**Store:** ${filters.storeId === 'all' ? 'All Stores' : filters.storeId}`,
    `**City:** ${filters.city === 'all' ? 'All Cities' : filters.city}`,
    `**Store Format:** ${filters.storeFormat === 'all' ? 'All Formats' : filters.storeFormat}`,
    `**Category:** ${filters.category === 'all' ? 'All Categories' : filters.category}`
  ].join(' | ');

  let md = `# Retail Sales Intelligence — Executive Insights Report\n\n`;
  md += `*Generated: ${timestamp}*\n\n`;
  md += `**Active Filter Parameters:** ${filterSummary}\n\n`;
  md += `## Executive Synthesis\n\n${insights.summaryNarrative}\n\n`;

  md += `## 1. Key Performance Metrics (KPIs)\n\n`;
  md += `| Metric | Current Value | Benchmark & Supporting Details |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **Net Sales** | ${formatExactCurrency(kpis.totalNetSales)} | Gross Sales: ${formatExactCurrency(kpis.totalGrossSales)} |\n`;
  md += `| **Target Sales** | ${formatExactCurrency(kpis.totalTargetSales)} | Corporate Baseline Quota |\n`;
  md += `| **Target Achievement** | ${kpis.totalTargetSales > 0 ? formatPercent(kpis.targetAchievementPct) : 'N/A'} | (Net Sales / Target Sales) * 100 |\n`;
  md += `| **Average Transaction Value (ATV)** | ${kpis.totalTransactions > 0 ? formatExactCurrency(kpis.atv) : 'N/A'} | Net Sales / Transactions |\n`;
  md += `| **Total Transactions** | ${kpis.totalTransactions.toLocaleString()} orders | Retail Store Checkouts |\n`;
  md += `| **Return Rate** | ${kpis.totalNetSales > 0 ? formatPercent(kpis.returnRatePct) : 'N/A'} | Total Refunded: ${formatExactCurrency(kpis.totalReturnAmount)} |\n`;
  md += `| **Discount Rate** | ${kpis.totalGrossSales > 0 ? formatPercent(kpis.discountRatePct) : 'N/A'} | Total Markdowns: ${formatExactCurrency(kpis.totalDiscountAmount)} |\n`;
  md += `| **Total Stockout Count** | ${kpis.totalStockouts} events | Aggregated where Stockout_Flag == True |\n`;
  md += `| **Stockout Rate** | ${kpis.recordCount > 0 ? formatPercent(kpis.stockoutRatePct) : 'N/A'} | ${kpis.totalStockouts} / ${kpis.recordCount} product-week records |\n`;
  md += `| **Stockout Risk Alert** | **${kpis.stockoutRiskLevel.toUpperCase()} RISK** | ${kpis.stockoutRiskLevel === 'High' ? '>10%' : kpis.stockoutRiskLevel === 'Moderate' ? '5%-10%' : '<5%'} |\n\n`;

  md += `## 2. Regional Performance (5 Regions)\n\n`;
  if (insights.bestRegion) {
    md += `- **Top Performing Region:** **${insights.bestRegion.name}** — ${formatExactCurrency(insights.bestRegion.sales)} (${formatPercent(insights.bestRegion.achievement)} of Target)\n`;
  }
  if (insights.worstRegion) {
    md += `- **Lowest Performing Region:** **${insights.worstRegion.name}** — ${formatExactCurrency(insights.worstRegion.sales)} (${formatPercent(insights.worstRegion.achievement)} of Target)\n`;
  }
  md += `\n`;

  md += `## 3. Stores Missing Targets\n\n`;
  if (insights.underperformingStores.length === 0) {
    md += `*All store locations reached or surpassed target sales quotas.*\n\n`;
  } else {
    insights.underperformingStores.forEach((s, idx) => {
      md += `${idx + 1}. **[${s.storeId}] ${s.storeName}** (${s.region}) — Achievement: **${formatPercent(s.achievement)}** | Revenue Shortfall: -${formatExactCurrency(s.gapAmount)}\n`;
    });
    md += `\n`;
  }

  md += `## 4. High Return Product Categories\n\n`;
  if (insights.highReturnCategories.length === 0) {
    md += `*All product categories maintained nominal return margins within operational benchmarks.*\n\n`;
  } else {
    insights.highReturnCategories.forEach((c, idx) => {
      md += `${idx + 1}. **${c.category}**: **${formatPercent(c.returnRate)}** Return Rate (${formatExactCurrency(c.returnAmount)} returned on ${formatExactCurrency(c.totalSales)} net sales)\n`;
    });
    md += `\n`;
  }

  md += `## 5. Stockout Risk Alerts\n\n`;
  md += `- **High Risk Stores (>10%):** ${insights.stockoutAlerts.highRiskStores.length} stores\n`;
  insights.stockoutAlerts.highRiskStores.forEach((s) => {
    md += `  - [${s.id}] ${s.name} (${s.region}): **${formatPercent(s.stockoutRatePct)}** stockout rate (${s.stockoutCount}/${s.totalRecords} records)\n`;
  });
  md += `- **Moderate Risk Stores (5%–10%):** ${insights.stockoutAlerts.moderateRiskStores.length} stores\n`;
  md += `- **Low Risk Stores (<5%):** ${insights.stockoutAlerts.lowRiskStores.length} stores\n\n`;

  md += `---\n*Generated by Retail Sales Intelligence App*\n`;
  return md;
}

/**
 * Downloads a string as a text or markdown file
 */
export function downloadTextFile(text: string, filename: string) {
  const mimeType = filename.endsWith('.md') ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports filtered records as CSV with computational guardrails
 */
export function exportDatasetToCSV(data: JoinedRecord[], filename: string = 'retail_filtered_sales.csv') {
  if (data.length === 0) return;

  const headers = [
    'Store_ID',
    'Store_Name',
    'Region',
    'City',
    'Store_Format',
    'Week_Number',
    'Week_Start_Date',
    'Product_Category',
    'Gross_Sales',
    'Discount_Amount',
    'Net_Sales',
    'Target_Sales',
    'Target_Achievement_Pct',
    'Transactions',
    'Visitors',
    'Conversion_Rate_Pct',
    'ATV',
    'Return_Amount',
    'Return_Rate_Pct',
    'Discount_Rate_Pct',
    'Stockout_Status',
    'Stockout_Flag',
    'Stockout',
    'Stockout_Units'
  ];

  const rows = data.map((r) => [
    r.Store_ID,
    `"${(r.Store_Name || '').replace(/"/g, '""')}"`,
    r.Region,
    `"${(r.City || '').replace(/"/g, '""')}"`,
    r.Store_Format,
    r.Week_Number,
    r.Week_Start_Date || '',
    `"${(r.Product_Category || '').replace(/"/g, '""')}"`,
    r.Gross_Sales,
    r.Discount_Amount,
    r.Net_Sales,
    r.Target_Sales,
    r.Target_Sales > 0 ? r.Target_Achievement_Pct.toFixed(2) : 'N/A',
    r.Transactions,
    r.Visitors,
    r.Visitors > 0 ? r.Conversion_Rate_Pct.toFixed(2) : 'N/A',
    r.Transactions > 0 ? r.ATV.toFixed(2) : 'N/A',
    r.Return_Amount,
    r.Net_Sales > 0 ? r.Return_Rate_Pct.toFixed(2) : 'N/A',
    r.Gross_Sales > 0 ? r.Discount_Rate_Pct.toFixed(2) : 'N/A',
    r.Stockout_Status,
    r.Stockout_Flag ? 'TRUE' : 'FALSE',
    r.Stockout,
    r.Stockout_Units || 0
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Client-side file parser supporting .xlsx, .xls, and .csv using SheetJS
 */
export async function parseSpreadsheetFile(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Spreadsheet contains no sheets.');
        }

        const sheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
          defval: ''
        });

        resolve(rawJson);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
