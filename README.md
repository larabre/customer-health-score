# Customer Health Report

A Claude skill that automates a monthly customer health report for B2B SaaS teams.

**Pipeline:** product analytics (Mixpanel) → health status per account (🟢 Healthy · 🟡 Needs Attention · 🔴 At Risk · ⚫ Churned) → static HTML dashboard → CS tracker update → team notification.

> ⚠️ All customer names and numbers in this repo are **synthetic**. Identifiers (project IDs, URLs, Slack IDs) are placeholders.

## What's inside

| File | Purpose |
|---|---|
| `SKILL.md` | Skill instructions: the full monthly pipeline, step by step |
| `health_evolution.jsx` | Historical usage data per account and feature (source of truth) |
| `health-dashboard.html` | Generated dashboard: status filters, per-account evolution, feature adoption |
| `references/mixpanel-queries.md` | Event definitions and query templates per feature |
| `references/company-mapping.md` | Rules for excluding internal/old accounts and handling new or churned ones |
| `references/jsx-format.md` | Data format and dashboard template |

## How health status works

Each account is classified from month-over-month usage across key features (e.g. dashboards, reports, content views, exports):

- 🟢 **Healthy:** sustained or growing usage
- 🟡 **Needs Attention:** declining or narrowing feature usage
- 🔴 **At Risk:** little or no usage
- ⚫ **Churned:** no longer a paying account

The exact rules live in `SKILL.md`.

## Setup

1. Replace the placeholders with your own values (keep them out of version control):
   - `<MIXPANEL_PROJECT_ID>`
   - `<company-domain>` (internal email domain to exclude)
   - `<SLACK_CHANNEL_ID>` / `<SLACK_DM_ID>`
   - `https://<your-project>.vercel.app/`
2. Adapt the event names in `references/mixpanel-queries.md` to your product.
3. Load `SKILL.md` as a skill in Claude and run it once a month.
4. Connect the repo to Vercel (or any static host) so each push to `main` redeploys the dashboard.

## Notes

- Never commit tokens or credentials; use environment variables or your platform's secret store.
- Built as a reference for CX/CS ops teams: adapt the features, thresholds and tools to your stack.
