import React from 'react';
import QueryBox from './components/QueryBox';
import FinalBox from './components/FinalBox';
import './style.css'; // optional global styles

function App() {
  return (
    <div className="container">
      <h1>🕵️ SQL Murder Mystery</h1>
      <h3>You are a detective assigned to this case. It’s up to you to figure out who did it.</h3>

        <p><strong>The Crime</strong></p>

        <p>Two seemingly unrelated deaths. One common thread: both victims consumed tampered Panadol capsules purchased from the same pharmacy.</p>

        <p><strong>Victim 1:</strong> John Snow — died on April 3rd after taking a single capsule for a headache.</p>
        <p><strong>Victim 2:</strong> Halle Church — died on April 12th after taking two capsules for a toothache.</p>

        <p>Autopsies confirmed both victims were killed by cyanide poisoning. The capsules were bought on different days, but from the same store. The tampering was subtle, methodical, and lethal.</p>

        <p>Police believe the poisoning was premeditated, and the capsules were altered before being sold. This wasn’t random — someone planned this. Someone with access. Someone with motive.</p>

        <p>Your task is to use the tools at your disposal — SQL queries, interviews, surveillance, shifts, purchases, and digital records — to unravel the mystery.</p>

        <p>Good luck, detective.</p>

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
