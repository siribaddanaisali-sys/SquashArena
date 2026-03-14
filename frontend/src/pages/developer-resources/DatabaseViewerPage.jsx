import React, { useState, useEffect } from 'react';
import DeveloperLayout from '../../components/developer/DeveloperLayout';
import { api } from '../../services/api';

export default function DatabaseViewerPage() {
  const [tables, setTables] = useState({});
  const [tableNames, setTableNames] = useState([]);
  const [activeTable, setActiveTable] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [rowFilter, setRowFilter] = useState('');
  const [showSchema, setShowSchema] = useState(false);
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/database-viewer');
      setTables(data.tables);
      const names = Object.keys(data.tables).sort();
      setTableNames(names);
      if (names.length > 0) setActiveTable(names[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTableNames = tableNames.filter(n => n.toLowerCase().includes(search.toLowerCase()));

  const currentTable = tables[activeTable];
  const colNames = currentTable?.columns?.map(c => c.field) || [];

  let displayRows = currentTable?.rows || [];
  if (rowFilter) {
    const q = rowFilter.toLowerCase();
    displayRows = displayRows.filter(r => colNames.some(c => String(r[c] ?? '').toLowerCase().includes(q)));
  }
  if (sortCol) {
    displayRows = [...displayRows].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (typeof va === 'number') return sortAsc ? va - vb : vb - va;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  const formatCell = (val) => {
    if (val === null || val === undefined) return <span className="text-gray-400 italic">NULL</span>;
    const s = String(val);
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s))
      return <span className="text-gray-400 font-mono text-xs" title={s}>{s.substring(0, 8)}…</span>;
    if (val === true || val === 1) return <span className="text-green-500 font-semibold">true</span>;
    if (val === false || val === 0) return <span className="text-red-400 font-semibold">false</span>;
    if (s.length > 60) return <span title={s}>{s.substring(0, 60)}…</span>;
    return s;
  };

  if (loading) return <DeveloperLayout><div className="text-center py-16 text-lg">Loading database...</div></DeveloperLayout>;
  if (error) return <DeveloperLayout><div className="text-center py-16 text-red-600">Error: {error}</div></DeveloperLayout>;

  return (
    <DeveloperLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-squash-dark mb-2">Database Viewer</h1>
        <p className="text-gray-600">Browse all {tableNames.length} tables and their data in the Squash Arena database.</p>
      </div>

      <div className="flex gap-6">
        {/* Table List Sidebar */}
        <div className="w-56 shrink-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter tables..."
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-squash-primary"
          />
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {filteredTableNames.map(name => (
              <button
                key={name}
                onClick={() => { setActiveTable(name); setRowFilter(''); setSortCol(null); setShowSchema(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition ${
                  activeTable === name
                    ? 'bg-squash-primary text-white font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="truncate">{name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTable === name ? 'bg-white bg-opacity-25 text-white' : 'bg-gray-200 text-gray-600'
                }`}>{tables[name]?.total}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 min-w-0">
          {currentTable && (
            <>
              {/* Stats Row */}
              <div className="flex gap-4 mb-4 flex-wrap">
                <div className="bg-white rounded-lg shadow px-5 py-3">
                  <div className="text-xs text-gray-500 uppercase">Rows</div>
                  <div className="text-2xl font-bold text-squash-primary">{currentTable.total}</div>
                </div>
                <div className="bg-white rounded-lg shadow px-5 py-3">
                  <div className="text-xs text-gray-500 uppercase">Columns</div>
                  <div className="text-2xl font-bold text-squash-primary">{currentTable.columns.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow px-5 py-3">
                  <div className="text-xs text-gray-500 uppercase">Showing</div>
                  <div className="text-2xl font-bold text-squash-primary">{displayRows.length}</div>
                </div>
                <button
                  onClick={() => setShowSchema(!showSchema)}
                  className="bg-white rounded-lg shadow px-5 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-700 self-center"
                >
                  {showSchema ? 'Hide' : 'Show'} Schema
                </button>
              </div>

              {/* Schema */}
              {showSchema && (
                <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2 font-semibold text-gray-500">Column</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-500">Type</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-500">Key</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-500">Nullable</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-500">Default</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentTable.columns.map(col => (
                        <tr key={col.field}>
                          <td className="px-4 py-2 font-semibold">{col.field}</td>
                          <td className="px-4 py-2 text-gray-600">{col.type}</td>
                          <td className="px-4 py-2">
                            {col.key === 'PRI' && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-semibold">PK</span>}
                            {col.key === 'MUL' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold">FK</span>}
                            {col.key === 'UNI' && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-semibold">UNI</span>}
                          </td>
                          <td className="px-4 py-2 text-gray-600">{col.nullable}</td>
                          <td className="px-4 py-2 text-gray-500">{col.default ?? <span className="italic text-gray-400">NULL</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Data Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <input
                    type="text"
                    value={rowFilter}
                    onChange={e => setRowFilter(e.target.value)}
                    placeholder="Search rows..."
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-squash-primary"
                  />
                </div>
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                  {displayRows.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No data</div>
                  ) : (
                    <table className="w-full text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-gray-50 sticky top-0">
                          {colNames.map(col => (
                            <th
                              key={col}
                              onClick={() => handleSort(col)}
                              className="text-left px-4 py-2 font-semibold text-gray-500 cursor-pointer hover:text-squash-primary select-none"
                            >
                              {col}
                              {sortCol === col && <span className="ml-1 text-xs">{sortAsc ? '▲' : '▼'}</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {displayRows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {colNames.map(col => (
                              <td key={col} className="px-4 py-2 max-w-xs overflow-hidden text-ellipsis">{formatCell(row[col])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="px-4 py-2 border-t text-xs text-gray-500">
                  Showing {displayRows.length} of {currentTable.total} rows (max 200 loaded)
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DeveloperLayout>
  );
}
