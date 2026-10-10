export type RiskLevel = 'High' | 'Moderate' | 'Low';

export interface SalesRecord {
  Store_ID: string;
  Week_Number: number | string;
  Week_Start_Date?: string;
  Product_Category: string;
  Gross_Sales: number;
  Net_Sales: number;
  Target_Sales: number;
  Transactions: number;
  Return_Amount: number;
  Discount_Amount: number;
  Stockout_Status: string;
  Stockout_Flag?: boolean;
  Stockout?: number | boolean;
  Stockout_Units?: number;
  Units_Sold?: number;
  Margin_Amount?: number;
  Customer_Count?: number;
  Visitors?: number;
  Promotion_Type?: string;
  Channel?: string;
  Return_Transactions?: number;
  Inventory_Units?: number;
  [key: string]: unknown;
}

export interface StoreRecord {
  Store_ID: string;
  Store_Name: string;
  Region: string;
  City: string;
  Store_Format: string;
  [key: string]: unknown;
}

export interface JoinedRecord extends SalesRecord {
  Store_Name: string;
  Region: string;
  City: string;
  Store_Format: string;
  Target_Achievement_Pct: number;
  Return_Rate_Pct: number;
  Discount_Rate_Pct: number;
  ATV: number;
  Visitors: number;
  Conversion_Rate_Pct: number;
  Stockout_Flag: boolean;
  Stockout: number;
}

export interface FilterState {
  week: string; // 'all' or specific week
  region: string; // 'all' or specific region
  storeId: string; // 'all' or specific store ID
  city: string; // 'all' or specific city
  storeFormat: string; // 'all' or specific format
  category: string; // 'all' or specific category
  searchQuery: string;
}

export interface KPISummary {
  totalNetSales: number;
  totalGrossSales: number;
  totalTargetSales: number;
  totalTransactions: number;
  totalReturnAmount: number;
  totalDiscountAmount: number;
  totalVisitors: number;
  conversionRatePct: number;
  targetAchievementPct: number;
  atv: number;
  returnRatePct: number;
  discountRatePct: number;
  recordCount: number;
  totalStockouts: number;
  stockoutRatePct: number;
  stockoutRiskLevel: RiskLevel;
}

export interface RegionMetric {
  region: string;
  netSales: number;
  targetSales: number;
  targetAchievementPct: number;
  transactions: number;
  returnRatePct: number;
  storeCount: number;
  stockoutCount: number;
  totalRecords: number;
  stockoutRatePct: number;
  riskLevel: RiskLevel;
}

export interface CategoryMetric {
  category: string;
  netSales: number;
  targetSales: number;
  targetAchievementPct: number;
  transactions?: number;
  returnAmount: number;
  returnRatePct: number;
  stockoutCount: number;
  totalRecords: number;
  stockoutRatePct: number;
  riskLevel: RiskLevel;
}

export interface StoreLeaderboardItem {
  storeId: string;
  storeName: string;
  region: string;
  city: string;
  storeFormat: string;
  netSales: number;
  targetSales: number;
  targetAchievementPct: number;
  targetVariance: number;
  transactions?: number;
  stockoutCount: number;
  totalRecords: number;
  stockoutRatePct: number;
  riskLevel: RiskLevel;
}

export interface WeeklyTrendPoint {
  week: string;
  weekNumber: number;
  netSales: number;
  targetSales: number;
  achievementPct: number;
  transactions?: number;
}

export interface EntityStockoutRisk {
  id: string;
  name: string;
  type: 'Store' | 'Category';
  region?: string;
  stockoutCount: number;
  totalRecords: number;
  stockoutRatePct: number;
  transactions?: number;
  riskLevel: RiskLevel;
  unitsLost?: number;
}

export interface ExecutiveInsights {
  bestRegion: { name: string; sales: number; achievement: number } | null;
  worstRegion: { name: string; sales: number; achievement: number } | null;
  underperformingStores: Array<{
    storeId: string;
    storeName: string;
    region: string;
    achievement: number;
    gapAmount: number;
  }>;
  highReturnCategories: Array<{
    category: string;
    returnRate: number;
    returnAmount: number;
    totalSales: number;
  }>;
  stockoutAlerts: {
    overallRate: number;
    overallLevel: RiskLevel;
    highRiskStores: EntityStockoutRisk[];
    moderateRiskStores: EntityStockoutRisk[];
    lowRiskStores: EntityStockoutRisk[];
    highRiskCategories: EntityStockoutRisk[];
    moderateRiskCategories: EntityStockoutRisk[];
    lowRiskCategories: EntityStockoutRisk[];
  };
  summaryNarrative: string;
}
