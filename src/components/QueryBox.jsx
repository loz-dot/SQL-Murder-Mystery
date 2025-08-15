import { useState } from 'react';
import supabase from '../supabaseClient';

function QueryBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleRun = async () => {
    setError(null);
    setResults(null);

    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery.startsWith('select')) {
      setError('Only SELECT statements are allowed.');
      return;
    }

    try {
      // This only works if you've created a Supabase SQL function to run raw queries,
      // otherwise you'd restrict to fixed logic here.
      const { data, error } = await supabase.rpc('run_custom_query', { query }); 

      if (error) throw error;
      setResults(data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="query-box">
      <label htmlFor="sql-input"><strong>Run a SQL SELECT query:</strong></label>
      <textarea
        id="sql-input"
        value={query}
        onChange={handleChange}
        placeholder="SELECT * FROM persons;"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Allows expanding with Enter
            setQuery(query + '\n');
          }
        }}
        className="query-textarea"
      />
      <button onClick={handleRun}>Run Query</button>

      {error && <p className="error">{error}</p>}
      {results && results.length > 0 && (
        <table className="results-table">
            <thead>
            <tr>
                {Object.keys(results[0]).map((col) => (
                <th key={col}>{col}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {results.map((row, idx) => (
                <tr key={idx}>
                {Object.values(row).map((val, i) => (
                    <td key={i}>{String(val)}</td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
    )}
    {results && results.length === 0 && (
    <p>No results found.</p>
    )}
    </div>
  );
}

export default QueryBox;
