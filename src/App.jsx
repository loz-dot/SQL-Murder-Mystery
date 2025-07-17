import React from 'react';
import QueryBox from './components/QueryBox';
import FinalBox from './components/FinalBox';
import './style.css'; // optional global styles

function App() {
  return (
    <div className="container">
      <h1>🕵️ SQL Murder Mystery</h1>

      <section>
        <h2>🔍 Query Console</h2>
        <p>Run SELECT queries to investigate the case.</p>
        <QueryBox />
      </section>

      <hr />

      <section>
        <h2>🎯 Final Guess</h2>
        <p>You only get one chance. Enter the full name of the culprit.</p>
        <FinalBox />
      </section>
    </div>
  );
}

export default App;
