# JSX Format Reference

## Files
- **JSX source** (source of truth): `health_evolution.jsx`
- **HTML output**: `index.html` — single file, overwritten each month, deployed to Vercel

The JSX is never uploaded anywhere. The HTML is the public deliverable.

---

## How to update each month

### Step A: Update the JSX

Read the JSX from the path above. Update these objects:

**1. `MONTHS` — add new month label**
```javascript
const MONTHS = ["Ene 2026", "Feb 2026", "Mar 2026", "Abr 2026"];
// Add the new Spanish month label at the end
```

**2. `CURRENT_MONTH_IDX` — increment by 1**
```javascript
const CURRENT_MONTH_IDX = 3; // 0-based index of the current month
```

**3. `RAW` — append this month's total events per feature per company**
```javascript
const RAW = {
  "Nombre Empresa": {
    insights:        [ene_ev, feb_ev, mar_ev, abr_ev],
    dashboards:      [ene_ev, feb_ev, mar_ev, abr_ev],
    legacy_reports:  [ene_ev, feb_ev, mar_ev, abr_ev],
    content_report:  [ene_ev, feb_ev, mar_ev, abr_ev],
    content_views:   [ene_ev, feb_ev, mar_ev, abr_ev],
    content_filters: [ene_ev, feb_ev, mar_ev, abr_ev],
    export_csv:      [ene_ev, feb_ev, mar_ev, abr_ev],
    goals:           [ene_ev, feb_ev, mar_ev, abr_ev],
  },
  ...
}
```
Rules:
- Append the new month's value to the end of each array
- If a company had 0 events for a feature this month → append `0`
- If a company is new this month → add entry with `0` for all prior months
- If a company churned → append `0` to all arrays
- Features with all-zero history across all months can be omitted from the object

**4. `USERS_RAW` — append global active users per company**
```javascript
const USERS_RAW = {
  "Nombre Empresa": [ene_uu, feb_uu, mar_uu, abr_uu],
  ...
}
// Value = active_users (global unique users this month, from the combined query)
// Append the new month's value at the end
```

**5. `STATUS` — replace with current month's status per company**
```javascript
const STATUS = {
  "Nombre Empresa": "🟢",  // "🟢" | "🟡" | "🔴" | "⚫"
  ...
}
// Not an array — always reflects the current month only. Replace all values.
```

Save the updated JSX back to the same path (overwrites).

---

### Step B: Compile to HTML

> **IMPORTANTE:** El HTML usa vanilla JS + Chart.js. NO uses React ni Recharts — Recharts UMD no funciona en HTML estático y produce página en blanco.

**Dashboard features:**
- Tarjetas por empresa con status badge, eventos del mes, delta vs mes anterior, usuarios activos, features activas
- Botón "Ver evolución" abre un **modal** (no un desplegable) con dos gráficas: total eventos y por feature
- Filtros por status (Todas / Healthy / Needs Attention / At Risk) + búsqueda por nombre
- Companies con 0 eventos en todos los meses igual aparecen en el dashboard (con "Sin actividad")
- Badge ⬆️ Recuperación en tarjetas donde `RECOVERY == true`

El script extrae los bloques de datos del JSX e inyecta el template vanilla:

> ⚠️ **IMPORTANTE:** El HTML contiene CSS/JS con llaves `{}`. Para evitar `SyntaxError` en f-strings de Python, usa **concatenación de strings** en lugar de un f-string para el bloque HTML completo. El patrón recomendado es `html_parts = []; html_parts.append(...); html = "".join(html_parts)`.

```python
import re, pathlib

JSX_PATH  = "health_evolution.jsx"   # read from GitHub repo larabre/customer-health
HTML_PATH = "index.html"                   # write here, then push to GitHub (Vercel auto-deploys)

jsx = pathlib.Path(JSX_PATH).read_text()

# Extract data blocks from JSX
months_val   = re.search(r'const MONTHS\s*=\s*(\[.*?\]);', jsx, re.DOTALL).group(1)
cidx_val     = re.search(r'const CURRENT_MONTH_IDX\s*=\s*(\d+);', jsx).group(1)
raw_val      = re.search(r'const RAW\s*=\s*(\{.*?\n\});', jsx, re.DOTALL).group(1)
users_val    = re.search(r'const USERS_RAW\s*=\s*(\{.*?\n\});', jsx, re.DOTALL).group(1)
status_val   = re.search(r'const STATUS\s*=\s*(\{.*?\n\});', jsx, re.DOTALL).group(1)
recovery_val = re.search(r'const RECOVERY\s*=\s*(\{.*?\n\});', jsx, re.DOTALL).group(1)

# Build HTML via concatenation (avoids f-string issues with CSS/JS curly braces)
parts = []
parts.append("""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Customer Health Dashboard</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',system-ui,sans-serif;background:#F7F4FF;color:#1A0033;min-height:100vh}
  header{background:#3B0070;color:#fff;padding:20px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
  header h1{font-size:1.3rem;font-weight:700}
  .meta{font-size:.85rem;opacity:.75}
  .stats{display:flex;gap:16px;flex-wrap:wrap;padding:24px 32px 0}
  .stat-card{background:#fff;border-radius:12px;padding:16px 22px;border:1px solid #E8DFF5;min-width:140px}
  .stat-card .label{font-size:.75rem;color:#5C4878;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
  .stat-card .value{font-size:1.6rem;font-weight:700;color:#3B0070}
  .stat-card .sub{font-size:.78rem;color:#9B84B8;margin-top:2px}
  .controls{padding:20px 32px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .filter-btn{padding:7px 16px;border-radius:20px;border:1.5px solid #E8DFF5;background:#fff;cursor:pointer;font-size:.85rem;color:#5C4878;transition:all .15s}
  .filter-btn.active,.filter-btn:hover{background:#3B0070;color:#fff;border-color:#3B0070}
  input[type=search]{padding:7px 14px;border-radius:20px;border:1.5px solid #E8DFF5;font-size:.85rem;outline:none;min-width:200px;color:#1A0033}
  input[type=search]:focus{border-color:#7B00C2}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;padding:0 32px 40px}
  .card{background:#fff;border-radius:14px;border:1.5px solid #E8DFF5;overflow:hidden;transition:box-shadow .15s}
  .card:hover{box-shadow:0 4px 20px rgba(59,0,112,.1)}
  .card-header{padding:14px 18px;display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
  .card-header .name{font-weight:600;font-size:.95rem;color:#1A0033;flex:1}
  .status-badge{padding:3px 10px;border-radius:10px;font-size:.78rem;font-weight:600;white-space:nowrap}
  .recovery-tag{font-size:.72rem;background:#E8F5E9;color:#2E7D32;border-radius:8px;padding:2px 7px;margin-left:6px}
  .card-body{padding:0 18px 14px}
  .metrics-row{display:flex;gap:16px;flex-wrap:wrap;margin:10px 0}
  .metric{text-align:center}
  .metric .m-val{font-size:1.1rem;font-weight:700;color:#3B0070}
  .metric .m-label{font-size:.68rem;color:#9B84B8}
  .features{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
  .feat-tag{font-size:.7rem;background:#F7F4FF;color:#5C4878;border-radius:6px;padding:2px 7px;border:1px solid #E8DFF5}
  .evo-link{font-size:.78rem;color:#7B00C2;cursor:pointer;display:inline-flex;align-items:center;gap:4px;text-decoration:none;background:none;border:none;padding:0}
  .evo-link:hover{text-decoration:underline}
  .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center}
  .modal-overlay.open{display:flex}
  .modal{background:#fff;border-radius:16px;padding:28px;width:90%;max-width:780px;max-height:90vh;overflow-y:auto;position:relative}
  .modal-title{font-size:1.1rem;font-weight:700;color:#1A0033;margin-bottom:4px}
  .modal-sub{font-size:.82rem;color:#9B84B8;margin-bottom:20px}
  .modal-close{position:absolute;top:16px;right:18px;background:none;border:none;font-size:1.4rem;cursor:pointer;color:#5C4878}
  .chart-section{margin-bottom:28px}
  .chart-section h3{font-size:.82rem;text-transform:uppercase;letter-spacing:.5px;color:#5C4878;margin-bottom:10px}
  .chart-section canvas{max-height:220px}
</style>
</head>
<body>
<header>
  <div>
    <h1>🏥 Customer Health Dashboard</h1>
    <div class="meta" id="headerMeta"></div>
  </div>
</header>
<div class="stats" id="statsRow"></div>
<div class="controls">
  <button class="filter-btn active" onclick="setFilter('all',this)">Todas</button>
  <button class="filter-btn" onclick="setFilter('🟢',this)">🟢 Healthy</button>
  <button class="filter-btn" onclick="setFilter('🟡',this)">🟡 Needs Attention</button>
  <button class="filter-btn" onclick="setFilter('🔴',this)">🔴 At Risk</button>
  <input type="search" id="searchBox" placeholder="Buscar empresa..." oninput="renderCards()">
</div>
<div id="cardGrid" class="grid"></div>
<div class="modal-overlay" id="modalOverlay" onclick="closeModal(event)">
  <div class="modal">
    <button class="modal-close" onclick="closeModalDirect()">&#x2715;</button>
    <div class="modal-title" id="modalTitle"></div>
    <div class="modal-sub" id="modalSub"></div>
    <div class="chart-section">
      <h3>Total eventos</h3>
      <canvas id="chartTotal"></canvas>
    </div>
    <div class="chart-section">
      <h3>Por feature</h3>
      <canvas id="chartFeatures"></canvas>
    </div>
  </div>
</div>
<script>
""")
parts.append("const MONTHS = " + months_val + ";\n")
parts.append("const CURRENT_MONTH_IDX = " + cidx_val + ";\n")
parts.append("const FEATURE_LABELS = {insights:'Insights',dashboards:'Dashboards',legacy_reports:'Legacy Reports',content_report:'Content Report',content_views:'Content Views',content_filters:'Content Filters',export_csv:'Export CSV',goals:'Goals'};\n")
parts.append("const ALL_FEATURES = Object.keys(FEATURE_LABELS);\n")
parts.append("const STATUS_COLOR = {'🟢':{bg:'#E8F5E9',text:'#2E7D32',border:'#A5D6A7',label:'Healthy'},'🟡':{bg:'#FFF8E1',text:'#B07D00',border:'#FFE082',label:'Needs Attention'},'🔴':{bg:'#FDECEA',text:'#C0392B',border:'#F5C6C2',label:'At Risk'},'⚫':{bg:'#F5F5F5',text:'#757575',border:'#BDBDBD',label:'Churned'}};\n")
parts.append("const RAW = " + raw_val + "\n")
parts.append("const USERS_RAW = " + users_val + "\n")
parts.append("const STATUS = " + status_val + "\n")
parts.append("const RECOVERY = " + recovery_val + "\n")
parts.append("""
let modalChartTotal = null, modalChartFeatures = null;
let currentFilter = 'all';

function totalEv(co, idx) {
  return ALL_FEATURES.reduce((s,f) => s + ((RAW[co]&&RAW[co][f]) ? RAW[co][f][idx] : 0), 0);
}
function activeFeatures(co) {
  return ALL_FEATURES.filter(f => RAW[co]&&RAW[co][f]&&RAW[co][f][CURRENT_MONTH_IDX]>0).map(f=>FEATURE_LABELS[f]);
}
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCards();
}
function renderCards() {
  const search = document.getElementById('searchBox').value.toLowerCase();
  const grid = document.getElementById('cardGrid');
  grid.innerHTML = '';
  const cos = Object.keys(STATUS).sort();
  const filtered = cos.filter(co => {
    if (currentFilter !== 'all' && STATUS[co] !== currentFilter) return false;
    if (search && !co.toLowerCase().includes(search)) return false;
    return true;
  });
  filtered.forEach(co => {
    const sc = STATUS_COLOR[STATUS[co]] || {bg:'#F5F5F5',text:'#757575',border:'#BDBDBD',label:'Churned'};
    const ev_cur = totalEv(co, CURRENT_MONTH_IDX);
    const ev_prev = totalEv(co, CURRENT_MONTH_IDX-1);
    const delta = ev_prev > 0 ? Math.round((ev_cur-ev_prev)/ev_prev*100) : null;
    const uu = (USERS_RAW[co]||[])[CURRENT_MONTH_IDX] || 0;
    const feats = activeFeatures(co);
    const isRecovery = RECOVERY[co];
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-header" style="border-bottom:2px solid ${sc.border}">
        <div class="name">${co}${isRecovery ? '<span class="recovery-tag">⬆️ Recuperación</span>' : ''}</div>
        <span class="status-badge" style="background:${sc.bg};color:${sc.text};border:1px solid ${sc.border}">${STATUS[co]} ${sc.label}</span>
      </div>
      <div class="card-body">
        <div class="metrics-row">
          <div class="metric"><div class="m-val">${ev_cur.toLocaleString()}</div><div class="m-label">Eventos ${MONTHS[CURRENT_MONTH_IDX]}</div></div>
          <div class="metric"><div class="m-val" style="color:${delta===null?'#9B84B8':delta>=0?'#2E7D32':'#C0392B'}">${delta===null?'—':(delta>=0?'+':'')+delta+'%'}</div><div class="m-label">vs ${MONTHS[CURRENT_MONTH_IDX-1]}</div></div>
          <div class="metric"><div class="m-val">${uu}</div><div class="m-label">Usuarios activos</div></div>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div class="features" style="margin-bottom:0">${feats.map(f=>`<span class="feat-tag">${f}</span>`).join('') || '<span class="feat-tag" style="color:#C0392B">Sin actividad</span>'}</div>
          <button class="evo-link" onclick="openModal('${co.replace(/'/g,"\\'")}')">Ver evolución <i class="ti ti-chevron-down" style="font-size:13px" aria-hidden="true"></i></button>
        </div>
      </div>`;
    grid.appendChild(div);
  });
  updateStats(cos);
}
function openModal(co) {
  document.getElementById('modalTitle').textContent = co;
  const sc = STATUS_COLOR[STATUS[co]] || {};
  document.getElementById('modalSub').textContent = (STATUS[co]||'') + ' ' + (sc.label||'') + (RECOVERY[co] ? '  ⬆️ Recuperación' : '');
  if (modalChartTotal) { modalChartTotal.destroy(); modalChartTotal = null; }
  if (modalChartFeatures) { modalChartFeatures.destroy(); modalChartFeatures = null; }
  const totals = MONTHS.map((_,i) => totalEv(co, i));
  const ctxT = document.getElementById('chartTotal').getContext('2d');
  modalChartTotal = new Chart(ctxT, {
    type: 'line',
    data: { labels: MONTHS, datasets: [{label:'Total eventos',data:totals,borderColor:'#3B0070',backgroundColor:'#3B007022',tension:.3,pointRadius:5,borderWidth:2.5,fill:true}] },
    options: { responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true},x:{}} }
  });
  const feats = RAW[co] || {};
  const colors = ['#3B0070','#E8503A','#00897B','#F57F17','#1565C0','#6A1B9A','#2E7D32','#D84315'];
  let ci = 0; const datasets = [];
  ALL_FEATURES.forEach(f => {
    if (feats[f] && feats[f].some(v=>v>0)) {
      datasets.push({label:FEATURE_LABELS[f],data:feats[f],borderColor:colors[ci%colors.length],backgroundColor:colors[ci%colors.length]+'22',tension:.3,pointRadius:4,borderWidth:2,fill:false});
      ci++;
    }
  });
  const ctxF = document.getElementById('chartFeatures').getContext('2d');
  modalChartFeatures = new Chart(ctxF, {
    type: 'line',
    data: { labels: MONTHS, datasets },
    options: { responsive:true, plugins:{legend:{position:'bottom',labels:{font:{size:11},boxWidth:12}}}, scales:{y:{beginAtZero:true},x:{}} }
  });
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(e) { if (e.target===document.getElementById('modalOverlay')) closeModalDirect(); }
function closeModalDirect() { document.getElementById('modalOverlay').classList.remove('open'); }
function updateStats(companies) {
  const green = companies.filter(co=>STATUS[co]==='🟢').length;
  const yellow = companies.filter(co=>STATUS[co]==='🟡').length;
  const red = companies.filter(co=>STATUS[co]==='🔴').length;
  const total = companies.length;
  const uu_cur = Object.values(USERS_RAW).reduce((s,v)=>s+(v[CURRENT_MONTH_IDX]||0),0);
  const uu_prev = Object.values(USERS_RAW).reduce((s,v)=>s+(v[CURRENT_MONTH_IDX-1]||0),0);
  document.getElementById('headerMeta').textContent = MONTHS[CURRENT_MONTH_IDX]+' · '+total+' cuentas PAYMENT';
  document.getElementById('statsRow').innerHTML = `
    <div class="stat-card"><div class="label">Total cuentas</div><div class="value">${total}</div></div>
    <div class="stat-card"><div class="label">🟢 Healthy</div><div class="value" style="color:#2E7D32">${green}</div><div class="sub">${Math.round(green/total*100)}%</div></div>
    <div class="stat-card"><div class="label">🟡 Needs Attention</div><div class="value" style="color:#B07D00">${yellow}</div><div class="sub">${Math.round(yellow/total*100)}%</div></div>
    <div class="stat-card"><div class="label">🔴 At Risk</div><div class="value" style="color:#C0392B">${red}</div><div class="sub">${Math.round(red/total*100)}%</div></div>
    <div class="stat-card"><div class="label">Usuarios activos</div><div class="value">${uu_cur}</div><div class="sub">vs ${uu_prev} mes ant.</div></div>
  `;
}
renderCards();
</script>
</body>
</html>""")

html = "".join(parts)
pathlib.Path(HTML_PATH).write_text(html, encoding="utf-8")
print(f"HTML generado: {HTML_PATH}")
```

---

## Data structure summary

| Object | Type | Updated how |
|---|---|---|
| `MONTHS` | array of strings | append new label |
| `CURRENT_MONTH_IDX` | integer | increment by 1 |
| `RAW` | dict: company → feature → array of ev | append new month |
| `USERS_RAW` | dict: company → array of uu | append new month |
| `STATUS` | dict: company → emoji string | replace all values |
| `RECOVERY` | dict: company → boolean | replace all values |

**44 companies rule:** All PAYMENT accounts must appear in the dashboard, even those with 0 events. Companies with no Mixpanel activity (e.g. Balearia, Minimum) must be added explicitly with `RAW[co] = {}` and `USERS_RAW[co] = [0, 0, ..., 0]` (one 0 per month). Their STATUS is `"🔴"` and RECOVERY is `false`.

**"Ver evolución" button:** Opens a modal (not a dropdown). Do NOT add a ▼ icon. Button label is simply `Ver evolución`.

---

## Feature keys in RAW

| Key | Feature name | Mixpanel events |
|---|---|---|
| `insights` | Insights | Create/Show content navigator insight + Opened email gpt insight notification |
| `dashboards` | Dashboards | Show/Create dashboard + Update range dashboard |
| `legacy_reports` | Legacy Reports | Download report/by token/informes |
| `content_report` | Content Report | Public view ai report |
| `content_views` | Content Views | Create/Update content navigator + Public view content navigator |
| `content_filters` | Content Filters | Create/Update application content analytic |
| `export_csv` | Export CSV | Export content navigator + Export application content analytic |
| `goals` | Goals | Create/Update campaign + Update goals campaign |

`nuevos_registros` and `nuevos_perfiles` are NOT stored in RAW — they are signal-only (used in Slack, not in history).

---

## Colors (do not modify)
```javascript
const B = {
  purple: "#3B0070", purpleMid: "#5A0094", purpleLight: "#7B00C2",
  coral: "#E8503A", white: "#FFFFFF", bg: "#F7F4FF", bgCard: "#FFFFFF",
  border: "#E8DFF5", text: "#1A0033", textMid: "#5C4878", textSoft: "#9B84B8",
  ink: "#2D0055",
};
const STATUS_COLOR = {
  "🟢": { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7", label: "Healthy" },
  "🟡": { bg: "#FFF8E1", text: "#B07D00", border: "#FFE082", label: "Needs Attention" },
  "🔴": { bg: "#FDECEA", text: "#C0392B", border: "#F5C6C2", label: "At Risk" },
  "⚫": { bg: "#F5F5F5", text: "#757575", border: "#BDBDBD", label: "Churned" },
};
```
