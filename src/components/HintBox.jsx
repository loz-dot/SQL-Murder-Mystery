// src/components/HintBox.jsx
import React, { useCallback, useMemo, useState } from 'react';
import supabase from '../supabaseClient';

// --- small utilities ---
const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function normalizeRows(rows, requiredColumns = [], orderBy = '') {
  if (!Array.isArray(rows)) return [];
  const cols = requiredColumns.length
    ? requiredColumns
    : (rows[0] ? Object.keys(rows[0]) : []);

  let normalized = rows.map(r => {
    const o = {};
    cols.forEach(c => { o[c] = r?.[c]; });
    return o;
  });

  if (orderBy) {
    const [col, dirRaw] = orderBy.split(/\s+/);
    const dir = (dirRaw || 'asc').toLowerCase();
    normalized = normalized.slice().sort((a, b) => {
      const va = a[col], vb = b[col];
      if (va === vb) return 0;
      if (va == null) return 1;      // nulls last
      if (vb == null) return -1;
      if (va < vb) return dir === 'desc' ? 1 : -1;
      return dir === 'desc' ? -1 : 1;
    });
  }

  return normalized;
}

function ResultsTable({ rows }) {
  if (!rows?.length) return <p>No results found.</p>;
  const columns = Object.keys(rows[0] || {});
  return (
    <div className="table-wrap">
      <table className="results-table">
        <thead>
          <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c, j) => <td key={j}>{String(r?.[c] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * HintBox
 * Props:
 * - boxTitle?: string
 * - hint: string (instructions shown above the input)
 * - placeholder?: string (textarea placeholder)
 * - answer: array of row objects (expected result)
 * - requiredColumns?: string[] (columns that must be present/compared)
 * - orderBy?: string (e.g. "id asc")
 * - onSolved?: () => void (called once when solved)
 */
export default function HintBox({
  boxTitle = 'Hint',
  hint,
  placeholder = 'SELECT * FROM persons;',
  answer = [],
  requiredColumns = [],
  orderBy = '',
  onSolved,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const expected = useMemo(
    () => normalizeRows(answer, requiredColumns, orderBy),
    [answer, requiredColumns, orderBy]
  );

  const runQuery = useCallback(async () => {
    setError('');
    setFeedback('');
    setResults(null);

    const q = (query || '').trim();
    if (!q.toLowerCase().startsWith('select')) {
      setError('Only SELECT statements are allowed for hints.');
      return;
    }

    setLoading(true);
    try {
      // Requires a Postgres function `run_custom_query(query text)` returning SETOF JSON or rows.
      const { data, error } = await supabase.rpc('run_custom_query', { query: q });
      if (error) throw error;

      // data should be an array of row objects; adjust here if your RPC returns a different shape
      const rows = Array.isArray(data) ? data : [];
      setResults(rows);

      // Compare with expected
      const actual = normalizeRows(rows, requiredColumns, orderBy);
      const solved = deepEqual(actual, expected);

      if (solved) {
        setFeedback('✅ Correct! The next hint is unlocked.');
        if (typeof onSolved === 'function') onSolved();
      } else {
        setFeedback('❌ Not quite. Check your columns, rows, and ordering.');
      }
    } catch (e) {
      setError(e?.message || 'Something went wrong while running the query.');
    } finally {
      setLoading(false);
    }
  }, [query, requiredColumns, orderBy, expected, onSolved]);

  return (
    <div className="hint-box">
      <div className="hint-header">
        <h3>{boxTitle}</h3>
      </div>

      <div className="hint-body">
        <p className="hint-text" style={{ whiteSpace: 'pre-wrap' }}>{hint}</p>

        <label htmlFor="sql-input" className="sr-only">SQL</label>
        <textarea
          id="sql-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="query-textarea"
          onKeyDown={(e) => {
            // let Enter insert a newline, but Cmd/Ctrl+Enter to run
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              runQuery();
            }
          }}
        />

        <div className="hint-actions">
          <button onClick={runQuery} disabled={loading}>
            {loading ? 'Running…' : 'Run Query'}
          </button>
          <span className="hint-kbd">Tip: Cmd/Ctrl + Enter to run</span>
        </div>

        {error && <p className="error">{error}</p>}
        {feedback && <p className="feedback">{feedback}</p>}

        {Array.isArray(results) && (
          <ResultsTable rows={results} />
        )}
      </div>
    </div>
  );
}
