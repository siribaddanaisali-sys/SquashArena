import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateDBViewer() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  console.log('Connected to database...');

  const [tables] = await conn.query('SHOW TABLES');
  const dbName = process.env.DB_NAME;
  const tableKey = Object.keys(tables[0])[0];
  const tableNames = tables.map(t => t[tableKey]);

  const tablesData = {};
  for (const name of tableNames) {
    const [columns] = await conn.query(`SHOW COLUMNS FROM \`${name}\``);
    const [rows] = await conn.query(`SELECT * FROM \`${name}\` LIMIT 200`);
    const [countResult] = await conn.query(`SELECT COUNT(*) as total FROM \`${name}\``);
    tablesData[name] = {
      columns: columns.map(c => ({ field: c.Field, type: c.Type, key: c.Key, nullable: c.Null, default: c.Default })),
      rows,
      total: countResult[0].total,
    };
  }

  await conn.end();
  console.log(`Fetched ${tableNames.length} tables`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${dbName} — Database Viewer</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; min-height: 100vh; }
  .sidebar { width: 260px; background: #1e293b; border-right: 1px solid #334155; overflow-y: auto; position: fixed; top: 0; left: 0; bottom: 0; }
  .sidebar-header { padding: 20px; border-bottom: 1px solid #334155; }
  .sidebar-header h2 { font-size: 16px; color: #f59e0b; letter-spacing: 0.5px; }
  .sidebar-header p { font-size: 12px; color: #94a3b8; margin-top: 4px; }
  .sidebar-search { padding: 12px 16px; }
  .sidebar-search input { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 13px; outline: none; }
  .sidebar-search input:focus { border-color: #f59e0b; }
  .table-list { list-style: none; }
  .table-list li { padding: 10px 20px; cursor: pointer; font-size: 13px; border-left: 3px solid transparent; transition: all 0.15s; display: flex; justify-content: space-between; align-items: center; }
  .table-list li:hover { background: #334155; }
  .table-list li.active { background: #1a2744; border-left-color: #f59e0b; color: #f59e0b; }
  .table-list .badge { background: #334155; color: #94a3b8; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
  .table-list li.active .badge { background: #f59e0b22; color: #f59e0b; }
  .main { margin-left: 260px; flex: 1; padding: 24px; overflow-x: auto; }
  .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
  .table-header h1 { font-size: 22px; color: #f8fafc; }
  .table-header h1 span { color: #f59e0b; }
  .stats { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
  .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 14px 20px; min-width: 120px; }
  .stat-card .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-card .value { font-size: 20px; font-weight: 700; color: #f59e0b; margin-top: 4px; }
  .schema-toggle { background: #334155; color: #e2e8f0; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
  .schema-toggle:hover { background: #475569; }
  .schema-section { background: #1e293b; border: 1px solid #334155; border-radius: 8px; margin-bottom: 20px; overflow: hidden; display: none; }
  .schema-section.show { display: block; }
  .schema-section table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .schema-section th { background: #0f172a; padding: 10px 14px; text-align: left; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
  .schema-section td { padding: 8px 14px; border-top: 1px solid #1a2235; }
  .key-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
  .key-badge.pri { background: #f59e0b22; color: #f59e0b; }
  .key-badge.mul { background: #3b82f622; color: #60a5fa; }
  .key-badge.uni { background: #10b98122; color: #34d399; }
  .data-section { background: #1e293b; border: 1px solid #334155; border-radius: 8px; overflow: hidden; }
  .data-section .search-row { padding: 12px 16px; border-bottom: 1px solid #334155; display: flex; gap: 12px; align-items: center; }
  .data-section .search-row input { flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 13px; outline: none; }
  .data-section .search-row input:focus { border-color: #f59e0b; }
  .data-table-wrap { overflow-x: auto; }
  .data-table { width: 100%; border-collapse: collapse; font-size: 13px; white-space: nowrap; }
  .data-table th { background: #0f172a; padding: 10px 14px; text-align: left; color: #94a3b8; font-weight: 600; position: sticky; top: 0; cursor: pointer; user-select: none; }
  .data-table th:hover { color: #f59e0b; }
  .data-table th .sort-icon { margin-left: 4px; font-size: 10px; }
  .data-table td { padding: 8px 14px; border-top: 1px solid #1a2235; max-width: 300px; overflow: hidden; text-overflow: ellipsis; }
  .data-table tr:hover td { background: #1a2744; }
  .null-val { color: #64748b; font-style: italic; }
  .uuid-val { color: #94a3b8; font-size: 11px; font-family: monospace; }
  .bool-true { color: #34d399; }
  .bool-false { color: #f87171; }
  .empty-state { text-align: center; padding: 40px; color: #64748b; }
  .showing-info { padding: 12px 16px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; }
</style>
</head>
<body>

<div class="sidebar">
  <div class="sidebar-header">
    <h2>🏸 ${dbName}</h2>
    <p>${tableNames.length} tables</p>
  </div>
  <div class="sidebar-search">
    <input type="text" id="tableSearch" placeholder="Filter tables..." oninput="filterTables()">
  </div>
  <ul class="table-list" id="tableList">
    ${tableNames.map((name, i) => `<li onclick="showTable('${name}')" data-table="${name}" class="${i === 0 ? 'active' : ''}">
      <span>${name}</span><span class="badge">${tablesData[name].total}</span>
    </li>`).join('')}
  </ul>
</div>

<div class="main" id="mainContent"></div>

<script>
const DB = ${JSON.stringify(tablesData, (key, val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'bigint') return val.toString();
    return val;
  })};

let currentSort = { col: null, asc: true };

function filterTables() {
  const q = document.getElementById('tableSearch').value.toLowerCase();
  document.querySelectorAll('.table-list li').forEach(li => {
    li.style.display = li.dataset.table.toLowerCase().includes(q) ? '' : 'none';
  });
}

function formatCell(val) {
  if (val === null || val === undefined) return '<span class="null-val">NULL</span>';
  if (typeof val === 'boolean' || val === 0 || val === 1) {
    if (val === true || val === 1) return '<span class="bool-true">true</span>';
    if (val === false || val === 0) return '<span class="bool-false">false</span>';
  }
  const s = String(val);
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s))
    return '<span class="uuid-val" title="' + s + '">' + s.substring(0, 8) + '…</span>';
  if (s.length > 80) return '<span title="' + s.replace(/"/g, '&quot;') + '">' + s.substring(0, 80) + '…</span>';
  return s;
}

function showTable(name) {
  document.querySelectorAll('.table-list li').forEach(li => li.classList.toggle('active', li.dataset.table === name));
  currentSort = { col: null, asc: true };
  renderTable(name);
}

function renderTable(name, filterText = '', sortCol = null, sortAsc = true) {
  const t = DB[name];
  const colNames = t.columns.map(c => c.field);

  let rows = [...t.rows];
  if (filterText) {
    const q = filterText.toLowerCase();
    rows = rows.filter(r => colNames.some(c => String(r[c] ?? '').toLowerCase().includes(q)));
  }
  if (sortCol !== null) {
    rows.sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      if (va === null) return 1; if (vb === null) return -1;
      if (typeof va === 'number') return sortAsc ? va - vb : vb - va;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }

  document.getElementById('mainContent').innerHTML = \`
    <div class="table-header">
      <h1><span>\${name}</span></h1>
      <button class="schema-toggle" onclick="document.getElementById('schema').classList.toggle('show')">Show Schema</button>
    </div>
    <div class="stats">
      <div class="stat-card"><div class="label">Total Rows</div><div class="value">\${t.total}</div></div>
      <div class="stat-card"><div class="label">Columns</div><div class="value">\${t.columns.length}</div></div>
      <div class="stat-card"><div class="label">Showing</div><div class="value">\${rows.length}</div></div>
    </div>
    <div class="schema-section" id="schema">
      <table>
        <thead><tr><th>Column</th><th>Type</th><th>Key</th><th>Nullable</th><th>Default</th></tr></thead>
        <tbody>\${t.columns.map(c => \`<tr>
          <td><strong>\${c.field}</strong></td>
          <td>\${c.type}</td>
          <td>\${c.key === 'PRI' ? '<span class="key-badge pri">PK</span>' : c.key === 'MUL' ? '<span class="key-badge mul">FK</span>' : c.key === 'UNI' ? '<span class="key-badge uni">UNI</span>' : ''}</td>
          <td>\${c.nullable}</td>
          <td>\${c.default ?? '<span class="null-val">NULL</span>'}</td>
        </tr>\`).join('')}</tbody>
      </table>
    </div>
    <div class="data-section">
      <div class="search-row">
        <input type="text" placeholder="Search rows..." id="rowSearch" oninput="onRowSearch('\${name}')" value="\${filterText}">
      </div>
      <div class="data-table-wrap">
        \${rows.length === 0 ? '<div class="empty-state">No data</div>' : \`<table class="data-table">
          <thead><tr>\${colNames.map(c => \`<th onclick="onSort('\${name}', '\${c}')">\${c}<span class="sort-icon">\${currentSort.col === c ? (currentSort.asc ? '▲' : '▼') : ''}</span></th>\`).join('')}</tr></thead>
          <tbody>\${rows.map(r => \`<tr>\${colNames.map(c => \`<td>\${formatCell(r[c])}</td>\`).join('')}</tr>\`).join('')}</tbody>
        </table>\`}
      </div>
      <div class="showing-info">Showing \${rows.length} of \${t.total} rows (max 200 loaded)</div>
    </div>
  \`;
}

function onRowSearch(name) {
  const q = document.getElementById('rowSearch').value;
  renderTable(name, q, currentSort.col, currentSort.asc);
}

function onSort(name, col) {
  if (currentSort.col === col) currentSort.asc = !currentSort.asc;
  else { currentSort.col = col; currentSort.asc = true; }
  const q = document.getElementById('rowSearch')?.value || '';
  renderTable(name, q, currentSort.col, currentSort.asc);
}

showTable('${tableNames[0]}');
</script>
</body>
</html>`;

  const outPath = path.join(__dirname, 'db-viewer.html');
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`\\nGenerated: ${outPath}`);
  return outPath;
}

generateDBViewer().then(p => {
  console.log('Opening in browser...');
  import('child_process').then(cp => {
    cp.exec(`start "" "${p}"`);
    process.exit(0);
  });
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
