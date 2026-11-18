# Mixpanel Query Reference

## Connection
- Tool: `Run-Query` (Mixpanel MCP)
- Project ID: `<MIXPANEL_PROJECT_ID>`
- Filter (all queries): `user["Account status"] == "PAYMENT"` AND `user["$email"] does not contain "<company-domain>"`
- Breakdown: `user["Company"]`
- Date range: first to last day of the report month (e.g. `2026-04-01` to `2026-04-30`)

## What to query

### Feature queries (8 features → stored in RAW)
For each feature, query **total events (ev) only** — this is what drives health status calculation and the charts.
No per-feature unique users needed.

| Feature key | Events to sum |
|---|---|
| `insights` | `Create content navigator insight` + `Show content navigator insight` + `Opened email gpt insight notification` |
| `dashboards` | `Show dashboard` + `Create dashboard` + `Update range dashboard` |
| `legacy_reports` | `Download report` + `Download report by token` + `Download informes` + `Update report` + `Generate report` |
| `content_report` | `Public view ai report` |
| `content_views` | `Create content navigator` + `Update content navigator` + `Public view content navigator` |
| `content_filters` | `Create application content analytic` + `Update application content analytic` |
| `export_csv` | `Export content navigator` + `Export application content analytic` |
| `goals` | `Create campaign` + `Update campaign` + `Update goals campaign` |

### Active users query (1 query → stored in USERS_RAW)
**Informative only** — not used for health status. Stored as the user count shown in the dashboard header and per-company cards.

Query: unique users (`math: "unique"`) who fired **any** of the above feature events, broken down by Company.
This is a single query combining all events with `math: "unique"`.

### Signal-only queries (not stored in RAW or USERS_RAW)
Used only for the Slack message signals section. Not stored historically.

| Signal | Events |
|---|---|
| `nuevos_registros` | `Show confirmation` — total events |
| `nuevos_perfiles` | `Create provider account` + `Create benchmark` — total events |

---

## Query strategy with Mixpanel MCP

Use `Run-Query` with `report_type: "insights"`, `chartType: "table"`, and `math: "total"` for ev queries.

### Feature ev query (multi-event, total)
```json
{
  "name": "Dashboards ev May 2026",
  "metrics": [
    {"eventName": "Show dashboard", "measurement": {"type": "basic", "math": "total"}},
    {"eventName": "Create dashboard", "measurement": {"type": "basic", "math": "total"}},
    {"eventName": "Update range dashboard", "measurement": {"type": "basic", "math": "total"}}
  ],
  "filters": [
    {"type": "string", "propertyName": "Account status", "resource": "user", "operator": "equals", "value": "PAYMENT"},
    {"type": "string", "propertyName": "$email", "resource": "user", "operator": "does not contain", "value": "<company-domain>"}
  ],
  "breakdowns": [{"metric": {"type": "property", "propertyName": "Company", "resource": "user"}}],
  "chartType": "table",
  "dateRange": {"type": "absolute", "from": "2026-05-01", "to": "2026-05-31"}
}
```
Result: one row per company per sub-event. Sum all sub-events per company in Python to get the feature total.

### Active users query (unique, all events combined)
```json
{
  "name": "Active users May 2026",
  "metrics": [
    {"eventName": "Show dashboard", "measurement": {"type": "basic", "math": "unique"}},
    {"eventName": "Download report by token", "measurement": {"type": "basic", "math": "unique"}},
    {"eventName": "Public view ai report", "measurement": {"type": "basic", "math": "unique"}},
    {"eventName": "Update content navigator", "measurement": {"type": "basic", "math": "unique"}},
    {"eventName": "Create application content analytic", "measurement": {"type": "basic", "math": "unique"}},
    {"eventName": "Export content navigator", "measurement": {"type": "basic", "math": "unique"}},
    {"eventName": "Show content navigator insight", "measurement": {"type": "basic", "math": "unique"}},
    {"eventName": "Create campaign", "measurement": {"type": "basic", "math": "unique"}}
  ],
  "filters": [
    {"type": "string", "propertyName": "Account status", "resource": "user", "operator": "equals", "value": "PAYMENT"},
    {"type": "string", "propertyName": "$email", "resource": "user", "operator": "does not contain", "value": "<company-domain>"}
  ],
  "breakdowns": [{"metric": {"type": "property", "propertyName": "Company", "resource": "user"}}],
  "chartType": "table",
  "dateRange": {"type": "absolute", "from": "2026-05-01", "to": "2026-05-31"}
}
```
**Important:** the table returns one column per metric. Take the MAX across all columns per company (not the sum — unique users are not additive across events). This gives the best approximation of global active users per company.

---

## Python aggregation pattern

```python
# After running all feature queries:
feature_ev = {
    "insights": {},       # {company: total_ev}
    "dashboards": {},
    "legacy_reports": {},
    "content_report": {},
    "content_views": {},
    "content_filters": {},
    "export_csv": {},
    "goals": {},
}

# For each multi-event feature, sum sub-events per company:
# e.g. for dashboards (3 sub-events returned as columns A, B, C):
for row in dashboards_result:
    company = row["breakdown"]
    feature_ev["dashboards"][company] = feature_ev["dashboards"].get(company, 0) + row["value"]

# Active users: max across metric columns per company
active_users = {}
for row in active_users_result:
    company = row["breakdown"]
    active_users[company] = max(active_users.get(company, 0), row["value"])
```

---

## Troubleshooting

If a query returns empty or unexpected results:
1. Call `Get-Events` to verify the exact event name (names are Title Case)
2. Check date range format: `YYYY-MM-DD`
3. Verify filter: property `"Account status"`, value `"PAYMENT"` (exact string)
4. If confirmed empty after verification → stop pipeline, DM the report owner on Slack
