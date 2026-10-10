# Add Business Logic & Utilities

## Stockout Risk & Category Risk Logic

```text

Add stockout indicator logic and risk flags to the app:

1. Calculate Stockout Count: Aggregate the total number of weeks or items where `Stockout_Flag == True` (or `Stockout == 1`).
2. Calculate Stockout Rate (%): (Total Stockout Events / Total Product-Week Records) * 100.
3. Display a Stockout Risk Alert:
   - High Risk (Red): Stores/Categories with Stockout Rate > 10%.
   - Moderate Risk (Yellow): Stockout Rate between 5% and 10%.
   - Low Risk (Green): Stockout Rate < 5%.

```

## Guardrails, Null Handling, and Zero-Division Safety

```text

Apply robust computational guardrails across all backend calculations:

1. Zero Division Prevention: If `Target_Sales`, `Net_Sales`, `Gross_Sales`, or `Visitors` equals 0, return 0 or "N/A" instead of `Infinity` or `NaN`.
2. Missing Data Handling: Treat missing/null values in numeric columns (`Return_Amount`, `Discount_Amount`) as 0 without dropping the corresponding sales records.
3. Filter Recalculation: Ensure every calculation dynamically re-executes whenever any global filter (Week, Region, Store, City, Format, Category) changes.

```

## Data & Insight Export Utilities

```text

Implement data download and export utilities:

1. Filtered Data CSV Export: Add a button labeled "Export Filtered Sales Data (CSV)" that triggers a download of the currently filtered dataset matching all active dropdown selections.
2. Summary Insights Text Export: Add a button labeled "Download Executive Insights" that extracts the dynamic text from the Business Insight Summary section and saves it as a `.txt` or `.md` file.

```

## UI Polish, Responsive Layout & Tooltips

```text

Polish the user interface and chart components:

1. Chart Layout: Ensure chart axes, category labels, and legend titles are fully legible and not clipped on smaller screens.
2. Tooltips: Configure hover tooltips on all 5 charts to display formatted currency (\$), percentages (%), and exact transaction counts.
3. Visual Contrast: Use color-coding across the Store Leaderboard and Stockout Risk charts (e.g., green for meeting targets, red for stockout risks > 10%).

```