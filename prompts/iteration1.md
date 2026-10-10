# Master Prompt for AI App-Building Tool

```text

# App Specification: Retail Sales Intelligence Dashboard

## Objective
Build an interactive, single-page web dashboard application titled "Retail Sales Intelligence App" that helps retail business managers analyze sales performance, evaluate store targets, track product metrics, and generate automated actionable insights.

---

## 1. Data Integration Requirements
The application must provide file upload controls to accept two spreadsheet files:
1. **Sales Dataset (`retail_weekly_sales.xlsx`)**: Contains 1,920 rows and 19 columns covering weekly sales transactions, product categories, net sales, target sales, return amounts, discount amounts, and stockout statuses.
2. **Store Reference Data (`store_master.xlsx`)**: Contains 20 rows and 5 columns detailing store metadata including store ID, store name, region, city, and store format.

*Data Joining Logic:* Join the sales dataset with the store master reference data on `Store_ID` (or equivalent store identifier) to enable regional, city-level, and store-format filtering across sales metrics.

---

## 2. Dynamic Filter Bar
Provide global filter controls that immediately update all KPI cards, charts, and insight summaries on the dashboard:
- **Week / Time Period**
- **Region** (covering 5 regions)
- **Store**
- **City**
- **Store Format**
- **Product Category**

Include a "Reset Filters" button.

---

## 3. Mandatory KPI Cards
Display five prominent KPI summary cards at the top of the dashboard:
1. **Net Sales**: Sum of total sales across the selected filters.
2. **Target Achievement (%)**: Calculated as `(Total Net Sales / Total Target Sales) * 100`.
3. **Average Transaction Value (ATV)**: Calculated as `Total Net Sales / Total Transactions`.
4. **Return Rate (%)**: Calculated strictly as `(Total Return Amount / Total Net Sales) * 100`.
5. **Discount Rate (%)**: Calculated as `(Total Discount Amount / Total Gross Sales) * 100`.

---

## 4. Visualizations & Charts
Incorporate five interactive charts:
1. **Weekly Trend Line Chart**: Displays Net Sales vs. Target Sales across weeks.
2. **Sales by Region Bar Chart**: Compares sales performance across the 5 regions.
3. **Category Performance Chart**: Displays sales breakdown by Product Category.
4. **Store Leaderboard**: Highlights top-performing and bottom-performing stores based on target achievement.
5. **Stockout Risk Chart/Indicator**: Visualizes inventory stockout counts or risk metrics by store or category.

---

## 5. Automated Business Insight Summary
Provide a dedicated panel that dynamically calculates and displays automated executive text summaries based on active filter selections:
- **Best & Worst Performing Regions**: Highlights top and lowest sales regions.
- **Stores Missing Targets**: Flags specific stores failing to reach target sales.
- **High Return Categories**: Identifies product categories with abnormally high return rates.

---

## 6. Utilities & Technical Guardrails
- **Data Export**: Add buttons to export/download the filtered dataset as CSV and download the text insight summary.
- **Technical Restrictions**: Do not use features requiring Google Cloud API integration, Secrets, or external Publish workflows. Ensure the app runs entirely within the browser using uploaded local synthetic datasets.

```