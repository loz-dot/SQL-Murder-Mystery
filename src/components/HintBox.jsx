// src/components/HintBox.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import supabase from '../supabaseClient';

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
      if (va == null) return 1;
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
 * HintBox with persistence
 * Props:
 * - hintId: string | number  (required, used for localStorage key)
 * - boxTitle?: string
 * - hint: string
 * - placeholder?: string
 * - answer: array of row objects
 * - requiredColumns?: string[]
 * - orderBy?: string (e.g., "id asc")
 * - onSolved?: () => void
 * - lockOnSolve?: boolean (default true) - make input read-only after solve
 */
export default function HintBox({
  hintId,
  boxTitle = 'Hint',
  hint,
  placeholder = 'SELECT * FROM persons;',
  answer = [],
  requiredColumns = [],
  orderBy = '',
  onSolved,
  lockOnSolve = true,
}) {
  if (hintId == null) {
    throw new Error('HintBox requires a unique hintId prop for persistence.');
  }

  const storageKey = `hintbox:${hintId}`;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [solved, setSolved] = useState(false);

  // Load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.query === 'string') setQuery(parsed.query);
        if (Array.isArray(parsed.results)) setResults(parsed.results);
        if (typeof parsed.feedback === 'string') setFeedback(parsed.feedback);
        if (typeof parsed.solved === 'boolean') setSolved(parsed.solved);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist on changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ query, results, feedback, solved }));
    } catch {}
  }, [storageKey, query, results, feedback, solved]);

  const expected = useMemo(
    () => normalizeRows(answer, requiredColumns, orderBy),
    [answer, requiredColumns, orderBy]
  );

  const runQuery = useCallback(async () => {
    setError('');
    setFeedback('');

    const q = (query || '').trim();
    if (!q.toLowerCase().startsWith('select')) {
      setError('Only SELECT statements are allowed for hints.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('run_custom_query', { query: q });
      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      setResults(rows);

      const actual = normalizeRows(rows, requiredColumns, orderBy);
      const isSolved = deepEqual(actual, expected);
      setSolved(isSolved);

      if (isSolved) {
        setFeedback('✅ Correct! The next hint is unlocked.');
        if (typeof onSolved === 'function') onSolved();
      } else {
        setFeedback('❌ Not quite. Check your columns, rows, and ordering.');
      }
      // NOTE: We DO NOT clear query/results — they persist in the box.
    } catch (e) {
      setError(e?.message || 'Something went wrong while running the query.');
    } finally {
      setLoading(false);
    }
  }, [query, requiredColumns, orderBy, expected, onSolved]);

  return (
    <div className={`hint-box ${solved ? 'hint-solved' : ''}`}>
      <div className="hint-header">
        <h3>{boxTitle}</h3>
        {solved && <span className="badge-solved">Solved</span>}
      </div>

      <div className="hint-body">
        <p className="hint-text" style={{ whiteSpace: 'pre-wrap' }}>{hint}</p>

        <label htmlFor={`sql-input-${hintId}`} className="sr-only">SQL</label>
        <textarea
          id={`sql-input-${hintId}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="query-textarea"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              if (!(lockOnSolve && solved)) runQuery();
            }
          }}
          readOnly={lockOnSolve && solved}
        />

        <div className="hint-actions">
          <button onClick={runQuery} disabled={loading || (lockOnSolve && solved)}>
            {loading ? 'Running…' : (solved && lockOnSolve ? 'Solved' : 'Run Query')}
          </button>
          {!solved && <span className="hint-kbd">Tip: Cmd/Ctrl + Enter to run</span>}
        </div>

        {error && <p className="error">{error}</p>}
        {feedback && <p className={`feedback ${solved ? 'ok' : ''}`}>{feedback}</p>}

        {Array.isArray(results) && (
          <ResultsTable rows={results} />
        )}
      </div>
    </div>
  );
}
