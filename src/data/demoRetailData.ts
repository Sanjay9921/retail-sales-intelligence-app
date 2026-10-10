import { SalesRecord, StoreRecord } from '../types/retail';

export const DEMO_STORES: StoreRecord[] = [
  { Store_ID: 'STR-101', Store_Name: 'Manhattan 5th Ave Flagship', Region: 'East', City: 'New York', Store_Format: 'Flagship' },
  { Store_ID: 'STR-102', Store_Name: 'Boston Back Bay Pavilion', Region: 'East', City: 'Boston', Store_Format: 'Mall Store' },
  { Store_ID: 'STR-103', Store_Name: 'Philadelphia Center City', Region: 'East', City: 'Philadelphia', Store_Format: 'Standard' },
  { Store_ID: 'STR-104', Store_Name: 'Woodbury Commons Premium', Region: 'East', City: 'Central Valley', Store_Format: 'Outlet' },
  
  { Store_ID: 'STR-201', Store_Name: 'Chicago Michigan Ave Flagship', Region: 'Central', City: 'Chicago', Store_Format: 'Flagship' },
  { Store_ID: 'STR-202', Store_Name: 'Minneapolis Mall of America', Region: 'Central', City: 'Bloomington', Store_Format: 'Mall Store' },
  { Store_ID: 'STR-203', Store_Name: 'Indianapolis Downtown Plaza', Region: 'Central', City: 'Indianapolis', Store_Format: 'Standard' },
  { Store_ID: 'STR-204', Store_Name: 'Gurnee Mills Value Outlet', Region: 'Central', City: 'Gurnee', Store_Format: 'Outlet' },
  
  { Store_ID: 'STR-301', Store_Name: 'Atlanta Lenox Square Flagship', Region: 'South', City: 'Atlanta', Store_Format: 'Flagship' },
  { Store_ID: 'STR-302', Store_Name: 'Miami Aventura Luxury Mall', Region: 'South', City: 'Miami', Store_Format: 'Mall Store' },
  { Store_ID: 'STR-303', Store_Name: 'Charlotte SouthPark Center', Region: 'South', City: 'Charlotte', Store_Format: 'Standard' },
  { Store_ID: 'STR-304', Store_Name: 'Orlando International Outlets', Region: 'South', City: 'Orlando', Store_Format: 'Outlet' },
  
  { Store_ID: 'STR-401', Store_Name: 'Seattle Downtown Flagship', Region: 'North', City: 'Seattle', Store_Format: 'Flagship' },
  { Store_ID: 'STR-402', Store_Name: 'Portland Washington Square', Region: 'North', City: 'Portland', Store_Format: 'Mall Store' },
  { Store_ID: 'STR-403', Store_Name: 'Bellevue Square Promenade', Region: 'North', City: 'Bellevue', Store_Format: 'Standard' },
  { Store_ID: 'STR-404', Store_Name: 'Centralia Factory Outlets', Region: 'North', City: 'Centralia', Store_Format: 'Outlet' },
  
  { Store_ID: 'STR-501', Store_Name: 'San Francisco Union Square Flagship', Region: 'West', City: 'San Francisco', Store_Format: 'Flagship' },
  { Store_ID: 'STR-502', Store_Name: 'Los Angeles Century City Mall', Region: 'West', City: 'Los Angeles', Store_Format: 'Mall Store' },
  { Store_ID: 'STR-503', Store_Name: 'San Diego Fashion Valley', Region: 'West', City: 'San Diego', Store_Format: 'Standard' },
  { Store_ID: 'STR-504', Store_Name: 'Desert Hills Premium Outlets', Region: 'West', City: 'Cabazon', Store_Format: 'Outlet' }
];

export const PRODUCT_CATEGORIES = [
  'Apparel & Fashion',
  'Footwear & Athletic',
  'Beauty & Personal Care',
  'Home & Living',
  'Consumer Electronics',
  'Accessories & Leather'
];

/**
 * Deterministic pseudo-random number generator to ensure stable, realistic numbers
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates the full 1,920 rows (20 stores x 16 weeks x 6 categories)
 * with realistic 19-column retail data.
 */
export function generateDemoSalesDataset(): SalesRecord[] {
  const sales: SalesRecord[] = [];
  const WEEKS = 16;
  let rowId = 1;

  for (let w = 1; w <= WEEKS; w++) {
    const weekStr = `Week ${w.toString().padStart(2, '0')}`;
    const weekStartDate = new Date(2026, 0, 5 + (w - 1) * 7).toISOString().split('T')[0];

    for (const store of DEMO_STORES) {
      for (const cat of PRODUCT_CATEGORIES) {
        const seed = rowId * 31 + w * 17;
        const rand1 = seededRandom(seed);
        const rand2 = seededRandom(seed + 1);
        const rand3 = seededRandom(seed + 2);
        const rand4 = seededRandom(seed + 3);
        const rand5 = seededRandom(seed + 4);

        // Base volume based on store format and category
        let formatMultiplier = 1.0;
        if (store.Store_Format === 'Flagship') formatMultiplier = 1.75;
        else if (store.Store_Format === 'Mall Store') formatMultiplier = 1.25;
        else if (store.Store_Format === 'Outlet') formatMultiplier = 1.1;
        else if (store.Store_Format === 'Standard') formatMultiplier = 0.95;

        let catBaseSales = 12000;
        let baseReturnRate = 0.05; // 5%
        let baseDiscountRate = 0.08; // 8%

        if (cat === 'Apparel & Fashion') {
          catBaseSales = 18500;
          baseReturnRate = 0.145; // High return rate (industry standard for apparel)
          baseDiscountRate = 0.12;
        } else if (cat === 'Footwear & Athletic') {
          catBaseSales = 14200;
          baseReturnRate = 0.11;
          baseDiscountRate = 0.09;
        } else if (cat === 'Consumer Electronics') {
          catBaseSales = 22000;
          baseReturnRate = 0.04;
          baseDiscountRate = 0.05;
        } else if (cat === 'Beauty & Personal Care') {
          catBaseSales = 9500;
          baseReturnRate = 0.025; // Very low returns
          baseDiscountRate = 0.06;
        } else if (cat === 'Home & Living') {
          catBaseSales = 11000;
          baseReturnRate = 0.07;
          baseDiscountRate = 0.10;
        } else if (cat === 'Accessories & Leather') {
          catBaseSales = 8800;
          baseReturnRate = 0.045;
          baseDiscountRate = 0.07;
        }

        // Store performance variance
        // Make STR-203 (Indianapolis) and STR-404 (Centralia) underperform targets to provide rich business insights
        let storeMultiplier = 1.0 + (rand1 - 0.48) * 0.35;
        if (store.Store_ID === 'STR-203') storeMultiplier *= 0.78; // Missing target
        if (store.Store_ID === 'STR-404') storeMultiplier *= 0.81; // Missing target
        if (store.Store_ID === 'STR-101') storeMultiplier *= 1.18; // Top performer
        if (store.Store_ID === 'STR-502') storeMultiplier *= 1.15; // Top performer

        // Seasonality wave across weeks
        const seasonality = 1.0 + Math.sin((w / 16) * Math.PI) * 0.22;

        const grossSales = Math.round(catBaseSales * formatMultiplier * storeMultiplier * seasonality * (0.9 + rand2 * 0.2));
        const discountAmount = Math.round(grossSales * (baseDiscountRate + (rand3 - 0.5) * 0.03));
        const returnAmount = Math.round((grossSales - discountAmount) * (baseReturnRate + (rand4 - 0.5) * 0.04));
        const netSales = Math.max(1000, grossSales - discountAmount);

        // Target sales - targets set at corporate expectation
        const targetSales = Math.round(catBaseSales * formatMultiplier * seasonality * 1.05);

        // Transactions & ATV
        const avgItemPrice = cat === 'Consumer Electronics' ? 180 : cat === 'Accessories & Leather' ? 95 : 45;
        const transactions = Math.max(20, Math.round(netSales / (avgItemPrice * (0.85 + rand5 * 0.3))));
        const unitsSold = Math.round(transactions * (1.3 + rand1 * 0.8));

        // Margin calculation
        const marginPct = cat === 'Beauty & Personal Care' ? 0.62 : cat === 'Consumer Electronics' ? 0.28 : 0.48;
        const marginAmount = Math.round(netSales * marginPct);

        // Stockout status logic
        let stockoutStatus = 'In Stock';
        let stockoutUnits = 0;
        // Introduce stockouts on certain high-demand weeks/categories
        const stockoutRiskCondition = (rand1 > 0.82 && (cat === 'Apparel & Fashion' || cat === 'Consumer Electronics')) ||
                                      (store.Store_ID === 'STR-302' && w % 3 === 0);

        if (stockoutRiskCondition) {
          stockoutStatus = rand2 > 0.4 ? 'Stockout Risk' : 'Out of Stock';
          stockoutUnits = Math.round(15 + rand3 * 45);
        }

        const customerCount = Math.round(transactions * (1.1 + rand4 * 0.4));
        const returnTransactions = Math.round(transactions * (baseReturnRate * 0.8));
        const inventoryUnits = Math.round(unitsSold * (3.5 + rand5 * 2.0));
        const promoType = discountAmount > grossSales * 0.1 ? 'Promotional Sale' : 'Regular Price';
        const channel = 'Brick & Mortar';

        sales.push({
          Store_ID: store.Store_ID,
          Week_Number: w,
          Week_Start_Date: weekStartDate,
          Product_Category: cat,
          Gross_Sales: grossSales,
          Net_Sales: netSales,
          Target_Sales: targetSales,
          Transactions: transactions,
          Return_Amount: returnAmount,
          Discount_Amount: discountAmount,
          Stockout_Status: stockoutStatus,
          Stockout_Flag: stockoutRiskCondition,
          Stockout: stockoutRiskCondition ? 1 : 0,
          Stockout_Units: stockoutUnits,
          Units_Sold: unitsSold,
          Margin_Amount: marginAmount,
          Customer_Count: customerCount,
          Promotion_Type: promoType,
          Channel: channel,
          Return_Transactions: returnTransactions,
          Inventory_Units: inventoryUnits
        });

        rowId++;
      }
    }
  }

  return sales;
}
