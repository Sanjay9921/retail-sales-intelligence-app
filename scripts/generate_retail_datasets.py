"""
Retail Dataset Generator
------------------------
Generates the two benchmark Excel files required by the Retail Sales Intelligence App:
1. `retail_weekly_sales.xlsx`: 1,920 rows and 19 columns
2. `store_master.xlsx`: 20 rows and 5 columns
"""

import os
import random
import numpy as np
import pandas as pd

STORES = [
    {"Store_ID": "STR-101", "Store_Name": "Manhattan 5th Ave Flagship", "Region": "East", "City": "New York", "Store_Format": "Flagship"},
    {"Store_ID": "STR-102", "Store_Name": "SoHo Broadway Boutique", "Region": "East", "City": "New York", "Store_Format": "Boutique"},
    {"Store_ID": "STR-103", "Store_Name": "Boston Back Bay", "Region": "East", "City": "Boston", "Store_Format": "Standard"},
    {"Store_ID": "STR-104", "Store_Name": "Philadelphia Center City", "Region": "East", "City": "Philadelphia", "Store_Format": "Standard"},
    {"Store_ID": "STR-201", "Store_Name": "Chicago Michigan Ave", "Region": "Central", "City": "Chicago", "Store_Format": "Flagship"},
    {"Store_ID": "STR-202", "Store_Name": "Minneapolis Nicollet Mall", "Region": "Central", "City": "Minneapolis", "Store_Format": "Standard"},
    {"Store_ID": "STR-203", "Store_Name": "Detroit Somerset Center", "Region": "Central", "City": "Detroit", "Store_Format": "Mall Store"},
    {"Store_ID": "STR-204", "Store_Name": "Cleveland Galleria", "Region": "Central", "City": "Cleveland", "Store_Format": "Outlet"},
    {"Store_ID": "STR-301", "Store_Name": "San Francisco Union Square", "Region": "West", "City": "San Francisco", "Store_Format": "Flagship"},
    {"Store_ID": "STR-302", "Store_Name": "Seattle Downtown Pine", "Region": "West", "City": "Seattle", "Store_Format": "Standard"},
    {"Store_ID": "STR-303", "Store_Name": "Los Angeles Century City", "Region": "West", "City": "Los Angeles", "Store_Format": "Mall Store"},
    {"Store_ID": "STR-304", "Store_Name": "San Diego Fashion Valley", "Region": "West", "City": "San Diego", "Store_Format": "Mall Store"},
    {"Store_ID": "STR-401", "Store_Name": "Atlanta Buckhead Grand", "Region": "South", "City": "Atlanta", "Store_Format": "Flagship"},
    {"Store_ID": "STR-402", "Store_Name": "Miami Lincoln Road", "Region": "South", "City": "Miami", "Store_Format": "Boutique"},
    {"Store_ID": "STR-403", "Store_Name": "Dallas NorthPark Center", "Region": "South", "City": "Dallas", "Store_Format": "Mall Store"},
    {"Store_ID": "STR-404", "Store_Name": "Houston Galleria Plaza", "Region": "South", "City": "Houston", "Store_Format": "Mall Store"},
    {"Store_ID": "STR-501", "Store_Name": "Denver Cherry Creek", "Region": "North", "City": "Denver", "Store_Format": "Standard"},
    {"Store_ID": "STR-502", "Store_Name": "Salt Lake City City Creek", "Region": "North", "City": "Salt Lake City", "Store_Format": "Mall Store"},
    {"Store_ID": "STR-503", "Store_Name": "Portland Pioneer Square", "Region": "North", "City": "Portland", "Store_Format": "Standard"},
    {"Store_ID": "STR-504", "Store_Name": "Boise Towne Square", "Region": "North", "City": "Boise", "Store_Format": "Outlet"},
]

CATEGORIES = [
    "Apparel & Fashion",
    "Footwear & Athletic",
    "Beauty & Personal Care",
    "Home & Living",
    "Consumer Electronics",
    "Accessories & Leather"
]

TOTAL_WEEKS = 16  # 20 stores * 16 weeks * 6 categories = 1,920 rows

def generate_datasets(output_dir="."):
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Generate store_master.xlsx (20 rows, 5 columns)
    df_stores = pd.DataFrame(STORES)
    store_file = os.path.join(output_dir, "store_master.xlsx")
    df_stores.to_excel(store_file, index=False)
    print(f"Generated {store_file} ({len(df_stores)} rows, {len(df_stores.columns)} cols)")

    # 2. Generate retail_weekly_sales.xlsx (1,920 rows, 19 columns)
    random.seed(42)
    np.random.seed(42)

    rows = []
    for week in range(1, TOTAL_WEEKS + 1):
        for store in STORES:
            store_id = store["Store_ID"]
            for category in CATEGORIES:
                base_target = 18000 + random.randint(-4000, 7000)
                perf_factor = random.uniform(0.82, 1.18)
                net_sales = round(base_target * perf_factor, 2)
                
                discount_rate = random.uniform(0.04, 0.16)
                discount_amount = round(net_sales * discount_rate, 2)
                gross_sales = round(net_sales + discount_amount, 2)
                
                # Higher returns in Fashion and Electronics
                if category in ["Apparel & Fashion", "Consumer Electronics"]:
                    return_rate = random.uniform(0.05, 0.12)
                else:
                    return_rate = random.uniform(0.01, 0.05)
                return_amount = round(net_sales * return_rate, 2)
                
                atv = round(random.uniform(55.0, 145.0), 2)
                transactions = max(1, int(round(net_sales / atv)))
                visitors = int(transactions * random.uniform(2.5, 4.5))
                conversion_rate = round((transactions / visitors) * 100, 2) if visitors > 0 else 0
                
                units_sold = int(transactions * random.uniform(1.2, 2.4))
                stockout_chance = 0.12 if category in ["Consumer Electronics", "Footwear & Athletic"] else 0.06
                stockout_flag = random.random() < stockout_chance
                stockout = 1 if stockout_flag else 0
                units_lost = random.randint(15, 60) if stockout_flag else 0

                row = {
                    "Store_ID": store_id,
                    "Week_Number": week,
                    "Product_Category": category,
                    "Gross_Sales": gross_sales,
                    "Net_Sales": net_sales,
                    "Target_Sales": base_target,
                    "Transactions": transactions,
                    "Return_Amount": return_amount,
                    "Discount_Amount": discount_amount,
                    "Stockout_Flag": stockout_flag,
                    "Stockout": stockout,
                    "Visitors": visitors,
                    "Conversion_Rate": conversion_rate,
                    "Units_Sold": units_sold,
                    "Units_Lost": units_lost,
                    "Inventory_Count": random.randint(120, 800),
                    "Promotion_Active": random.choice([True, False]),
                    "Staff_Hours": random.randint(80, 220),
                    "Customer_Satisfaction": round(random.uniform(3.8, 4.9), 1),
                }
                rows.append(row)

    df_sales = pd.DataFrame(rows)
    sales_file = os.path.join(output_dir, "retail_weekly_sales.xlsx")
    df_sales.to_excel(sales_file, index=False)
    print(f"Generated {sales_file} ({len(df_sales)} rows, {len(df_sales.columns)} cols)")

if __name__ == "__main__":
    generate_datasets()
