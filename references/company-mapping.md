## Internal / excluded accounts

These accounts appear in Mixpanel data but are **internal or old accounts** — exclude them from all RAW data, USERS_RAW, STATUS, and Notion:

- `<internal-account-1>`
- `<internal-account-2>`
- `<internal-account-3>`
- `<internal-account-4>`
- `<internal-account-5>`
- `<internal-account-6>`
- `<internal-account-7>`
- `<internal-account-8>`
- `<internal-account-9>`
- `<internal-account-10>`
- `<internal-account-11>`
- `<internal-account-12>`
- `<internal-account-13>`

Regla de email: excluir también cualquier usuario cuyo email contenga @<company-domain> — pueden aparecer bajo cualquier company name.

## New companies (in Mixpanel, not yet in JSX)

Add to JSX with `0` for all prior months. Create a new Notion page.

## Companies in JSX but absent from Mixpanel this month

Append `0` to all their RAW arrays. If also `0` last month → status `🔴`.
If no longer PAYMENT in Mixpanel → set status to `⚫` Churned.
