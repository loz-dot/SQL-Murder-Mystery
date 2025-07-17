import React from 'react';
import { useState } from 'react';
import supabase from './supabaseClient';

function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runQuery = async () => {
    try {
      const { data, error } = await supabase
        .from('persons')
        .select('*')
        .ilike('first_name', `%${query}%`);  // example logic
      if (error) throw error;
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <div className="container">
      <h1>SQL Murder Mystery</h1>

      <input
        placeholder="Search suspects, locations, or clues..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={runQuery}>Search</button>

      {error && <p className="error">{error}</p>}
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}

      <h2>Challenge 1</h2>
      <input placeholder="Answer to challenge 1" />

      <h2>Final Guess</h2>
      <input placeholder="Who did it?" />
    </div>
  );
}

export default App;
