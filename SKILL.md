# Monthly Customer Health Report

This skill automates the full monthly pipeline:
Mixpanel data → health status (🟢/🟡/🔴) → HTML dashboard (Vercel) → Notion update → Slack notification.

## Key paths

All source files live in the GitHub repo **`larabre/customer-health`** (branch `main`).

- JSX source (historical data): `health_evolution.jsx`
- HTML output (deployed to Vercel): `health-dashboard.html`
- Reference files: `references/` folder
- Notion database: `example` (Customer Retention, in Retention actions page)
- Dashboard URL: `https://<your-project>.vercel.app/` (auto-updates on every push to main)

---

## Step 1: Determine the report month

The report covers the **previous calendar month** relative to today. If today is June 2, 2026, the report is for May 2026. Date range: first to last day of the previous month.

---

## Step 2: Query Mixpanel

Read `references/mixpanel-queries.md` for the full event list.

**TOKEN MANAGEMENT — required:**
After EACH Mixpanel query, write the raw result to `/tmp/mx_{feature}.json`
and do not retain the raw response in context. Always work from files between
queries, never accumulating Mixpanel responses in memory. When compiling the
final dict, read each /tmp/mx_*.json file one at a time and discard after processing.

**Connection:**
- Project ID: `<MIXPANEL_PROJECT_ID>`
- Filter: `user["Account status"] == "PAYMENT"` AND `user["$email"] does not contain "<company-domain>"`
- Breakdown: `user["Company"]`

Run one separate query per feature in this order:
1. active_users → `/tmp/mx_active_users.json`
2. insights → `/tmp/mx_insights.json`
3. dashboards → `/tmp/mx_dashboards.json`
4. legacy_reports → `/tmp/mx_legacy_reports.json`
5. content_report → `/tmp/mx_content_report.json`
6. content_views → `/tmp/mx_content_views.json`
7. content_filters → `/tmp/mx_content_filters.json`
8. export_csv → `/tmp/mx_export_csv.json`
9. goals → `/tmp/mx_goals.json`
10. nuevos_registros → `/tmp/mx_nuevos_registros.json`
11. nuevos_perfiles → `/tmp/mx_nuevos_perfiles.json`

After all 11 queries, read the /tmp/mx_*.json files, compile the final dict,
write it to `/tmp/mx_compiled.json`, and delete the intermediate files.

For **all features**: extract **total events (ev) only** — no per-feature unique users needed.
For **Nuevos registros** and **Nuevos perfiles**: total events only, used for Slack signals, not stored historically.

**Additional query — active users:** unique users who fired any feature event (excluding Nuevos registros/perfiles). Informative only — stored in `USERS_RAW`, shown in the dashboard but NOT used for health status calculation.

**STOP condition:** if any query fails after verifying the event name with `Get-Events` → stop the entire pipeline. Do not generate files, do not update Notion, do not send Slack. Notify the report owner directly via Slack DM explaining which query failed and why.

After querying, build per company:
```python
{
  company: {
    "ev": {  # total events — used for health status and stored in RAW
      "insights": 0, "dashboards": 0, "legacy_reports": 0,
      "content_report": 0, "content_views": 0, "content_filters": 0,
      "export_csv": 0, "goals": 0
    },
    "active_users": 0,   # global unique users — informative, stored in USERS_RAW
    "nuevos_registros": 0,  # Slack signal only, not stored historically
    "nuevos_perfiles": 0    # Slack signal only, not stored historically
  }
}
```
Once compiled, save to `/tmp/mx_compiled.json` and reference only that file
in subsequent steps. Do not keep the full dict in context.

Filter results to PAYMENT accounts only. See `references/company-mapping.md` for name normalization.

---

## Step 3: Get historical data

Read the JSX from the path in Key paths above. It contains `MONTHS`, `CURRENT_MONTH_IDX`, `RAW`, `USERS_RAW`, `STATUS`, and `RECOVERY` with data for all previous months.

**First run only:** if the JSX doesn't exist, create it from scratch with the current month's data and zeros for all prior months.

Rules:
- Companies in JSX with zero activity this month → keep, append `0`
- Companies new in Mixpanel this month → add to JSX with data from the current month
- Companies in JSX no longer in Mixpanel as PAYMENT → mark as churned (see Step 6b)

---

## Step 4: Assign health status

Status is assigned per company based on comparing this month's **total events** (sum of all features) vs the previous month and the annual median (last 12 months, or all available if fewer).

The **median** is used instead of the mean to avoid distortion from seasonal spikes (e.g. January is always high due to year-end reporting). A single atypical month does not affect the median.

```python
total_ev_current  = sum of all feature ev this month
total_ev_previous = sum of all feature ev last month

# Robust median: exclude the max value from history if it is an outlier
# Only exclude if >= 2 months with activity AND max > 2x the median of the rest
# This prevents a single January spike from distorting the baseline
def robust_median(history):
    if not history or all(v == 0 for v in history):
        return 0
    active_months = sum(1 for v in history if v > 0)
    if active_months < 2:
        return median(history)  # not enough data — don't exclude anything
    max_val = max(history)
    max_idx = history.index(max_val)
    rest = [v for i, v in enumerate(history) if i != max_idx]
    med_rest = median(rest)
    if med_rest > 0 and max_val > 2 * med_rest:
        return med_rest  # exclude the outlier
    return median(history)

annual_median = robust_median(total_ev across all available months excluding current)

# For companies with 0 events 2 consecutive months: always 🔴

def assign_status(total_ev_current, total_ev_previous, annual_median):
    if total_ev_current == 0 and total_ev_previous == 0:
        return "🔴"  # At Risk — 2 months dark

    if annual_median == 0:
        # No usable history — fallback to vs previous month
        delta = (total_ev_current - total_ev_previous) / max(total_ev_previous, 1)
        if delta >= -0.20:  return "🟢"
        if delta >= -0.50:  return "🟡"
        return "🔴"

    delta_annual = (total_ev_current - annual_median) / annual_median
    if delta_annual >= -0.20:  return "🟢"   # within ±20% of annual median or above
    if delta_annual >= -0.50:  return "🟡"   # between -20% and -50%
    return "🔴"                               # more than -50% below annual median
```

**Recovery flag:**
After assigning status, check if the company shows a recovery pattern — a notably low previous month followed by a clear rebound this month:

```python
# Only applies to companies with >= 3 months of history
recovery = (
    annual_median > 0
    and total_ev_previous < annual_median * 0.50   # prev month was notably low (< 50% of median)
    and total_ev_current >= annual_median * 0.70   # this month rebounded (>= 70% of median)
)
```

Store as `RECOVERY[company] = True/False`. A company can be 🟢 + recovery, or 🟡 + recovery — never 🔴 + recovery.

**Contextual note — low feature diversity:**
After assigning status, check if the company has used only 1 feature consistently (all other features = 0 for the last 3 months). If so, add a note: "Cliente concentrado en [Feature] — oportunidad de ampliar adopción."

**Active features list:** for each company, collect the names of features with ev > 0 this month. This is used in Notion and the HTML.

---

## Step 5: Detect signals for Slack

Scan all companies and collect:

- **New registration:** companies with `nuevos_registros ev > 0` this month
- **New social profiles:** companies with `nuevos_perfiles ev > 0` this month
- **Content Report new adopters:** companies with `content_report ev > 0` this month that had `content_report ev = 0` for the previous 2 months → flag with 🆕
- **Status changes:** companies whose status changed vs last month (🟢→🟡, 🟡→🔴, 🔴→🟡, etc.)
- **Active users per company:** `active_users` count this month vs previous month
- **Recovering accounts:** companies where `RECOVERY == True` → flag with ⬆️

---

## Step 6: Update JSX and generate HTML

Read `references/jsx-format.md` for the full update procedure.

**6a. Update JSX:**
1. Add new month label to `MONTHS`
2. Increment `CURRENT_MONTH_IDX`
3. Append this month's ev values to `RAW` for each company and feature
4. Append `active_users` to `USERS_RAW` for each company
5. Replace `STATUS` values with this month's 🟢/🟡/🔴 per company
6. Replace `RECOVERY` values with this month's True/False per company
7. Save JSX back to the same path (overwrites previous version)

**6b. Churned companies:**
If a company was in the JSX but is no longer PAYMENT in Mixpanel:
- Append `0` to all their RAW arrays
- Set their STATUS to `"⚫"` and RECOVERY to `false`
- Flag them in Step 7 (Notion) as churned

**6c. Compile to HTML:**
Use the Python script in `jsx-format.md` to compile the JSX into a single self-contained `index.html`. This file accumulates all months — it is always the full history, not a snapshot.

---

## Step 7: Update Notion

Notion database: `example`

Use `notion-search` or query the database to get existing pages (one per company).

**For each company in this month's data:**
- If the company already has a page → update: Estado, Mes reporte, Features activas, Usuarios activos, Insight del mes
- If the company is new (no page yet) → create a new page with all fields
- Do NOT overwrite: Fecha último contacto, Notas de contacto, Acción tomada, Próximo follow-up, CSM responsable

**For each company that churned this month:**
Churned companies have no longer user["Account status"] == "PAYMENT"
- Update Estado → `⚫ Churned`
- Update Mes reporte 

**Field values to set:**
```
Estado:           🟢 Healthy | 🟡 Needs Attention | 🔴 At Risk | ⚫ Churned
Mes reporte:      "Mayo 2026" (Spanish month name)
Features activas: comma-separated list of active feature names, e.g. "Legacy Reports, Dashboards, Insights"
Usuarios activos: "12 uu (vs 10 mes ant.)" — format as string
Insight del mes:  1–2 sentences of context for the CSM. Include contextual note if low diversity.
                  If RECOVERY == True, add: "⬆️ Recuperación — la cuenta rebotó tras un mes bajo."
```

---

## Step 8: Push HTML to GitHub

The repo `larabre/customer-health` is connected to Vercel. Pushing `index.html` to the `main` branch triggers an automatic Vercel deployment — no manual deploy needed.

1. Write the compiled `index.html` to the workspace folder
2. Use the GitHub MCP (or Claude in Chrome if unavailable) to commit and push `index.html` to `larabre/customer-health` on branch `main`
3. Vercel picks it up automatically and deploys within ~30 seconds
4. The public URL is fixed: `https://<your-project>.vercel.app/`

**If the push fails:** stop pipeline, do not send Slack, notify the report owner directly.

---

## Step 9: Send Slack message to Slack

Channel ID: `channel`

Draft first with `slack_send_message_draft`, then send.

**Message format:**

```
@sop
📊 *Health Report — [Mes Año]* · [total companies] cuentas PAYMENT

👥 *Usuarios activos:* [total uu este mes] (vs [total uu mes ant.])

🆕 *Nuevos usuarios registrados:* [N empresas] — [Company A, Company B, ...]
🔌 *Nuevos perfiles instalados:* [N empresas] — [Company A, ...]
📈 *Usan Content Report:* [N empresas] — [Company A 🆕, Company B, ...]
⬆️ *En recuperación:* [N empresas] — [Company A, Company B, ...]

*Estado de cuentas:*
🟢 Healthy: [N] · 🟡 Needs Attention: [N] · 🔴 At Risk: [N]
🟡 [Company A, Company B, ...]
🔴 [Company C, ...]

🔗 [Ver dashboard completo](https://<your-project>.vercel.app/)
```

Omit any section where N = 0.

---

## Error handling

- **Mixpanel query fails after event name verification:** stop pipeline. No files, no Notion, no Slack. DM the report owner (<SLACK_DM_ID>).
- **Company in JSX but not in Mixpanel this month:** append `0`, continue. If also 0 last month → 🔴.
- **Company new in Mixpanel (not in JSX):** add with `0` for all prior months. Create Notion page.
- **Company no longer PAYMENT:** mark ⚫ Churned in JSX and Notion.
- **Vercel fails:** stop pipeline. No Slack. DM the report owner.
- **Notion update fails for one company:** log the error, continue with the rest, mention it at the end of the Slack message.
- **JSX not found:** create from scratch. This only happens on the very first run.

---

## References

All in the `references/` folder of `larabre/customer-health`:

- `references/mixpanel-queries.md` — Full event list and query examples
- `references/jsx-format.md` — JSX data structure and HTML compilation script
- `references/company-mapping.md` — Name normalization between Mixpanel and JSX/Notion
