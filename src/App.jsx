import React, { useMemo, useState, useEffect } from 'react';
import QueryBox from './components/QueryBox';
import FinalBox from './components/FinalBox';
import HintBox from './components/HintBox';
import './style.css';

// --- Hints configuration (store all hints here) ---
const hintsConfig = [
  {
    id: 1,
    title: 'Hint 1: Panadol Purchase Dates',
    prompt: `
You're told that the two victims both purchased Panadol from the same chemist before dying.
Using the credit_card_statements table, write a query to find the dates on which these purchases occurred.
We know that John Snow’s wife bought the panadol he consumed, while Halle Church bought the panadol she consumed.

Return columns: id, date, products_purchased, shopname, card_owner
Order by: id ASC
Hint: Use a WHERE clause on card_owner and shopname
    `,
    answer: [
      { id: 225, date: '2025-04-01', products_purchased: 'toothpaste, panadol', shopname: 'Pharmacy Select', card_owner: 119 },
      { id: 275, date: '2025-04-06', products_purchased: 'zofran, vitamin b gummies, panadol, creatine', shopname: 'Pharmacy Select', card_owner: 396 }
    ],
    requiredColumns: ['id', 'date', 'products_purchased', 'shopname', 'card_owner'],
    orderBy: 'id asc',
    placeholder: `SELECT id, date, products_purchased, shopname, card_owner
FROM credit_card_statements
WHERE card_owner IN (/* ids */)
  AND shopname = 'Pharmacy Select'
ORDER BY id ASC;`
  },

  // Add more hints here as you build them:
  // {
  //   id: 2,
  //   title: 'Hint 2: Employees who worked both shifts',
  //   prompt: '...',
  //   answer: [...],
  //   requiredColumns: [...],
  //   orderBy: '...',
  //   placeholder: '...'
  // },
];

// --- helper to persist progress (optional) ---
const loadUnlocked = () => {
  const raw = localStorage.getItem('unlockedCount');
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const saveUnlocked = (n) => {
  localStorage.setItem('unlockedCount', String(n));
};

export default function App() {
  // unlockedCount = highest solved index; 0 means only Hint 1 is available to open
  const [unlockedCount, setUnlockedCount] = useState(loadUnlocked);
  // openIndex is which accordion panel is open; default to first available
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    saveUnlocked(unlockedCount);
  }, [unlockedCount]);

  const onSolved = (idx) => {
    // when hint idx is solved, unlock the next one
    if (idx === unlockedCount) {
      setUnlockedCount((c) => Math.min(c + 1, hintsConfig.length - 1));
      // optionally auto-open the next hint
      setOpenIndex((c) => Math.min(c + 1, hintsConfig.length - 1));
    }
  };

  return (
    <div className="container">
      <h1>🕵️ SQL Murder Mystery</h1>
      <h3>You are a detective assigned to this case. It’s up to you to figure out who did it.</h3>

      <p><strong>The Crime</strong></p>
      <p>Two seemingly unrelated deaths. One common thread: both victims consumed tampered Panadol capsules purchased from the same pharmacy.</p>
      <p><strong>Victim 1:</strong> John Snow — died on April 3rd after taking a single capsule for a headache.</p>
      <p><strong>Victim 2:</strong> Halle Church — died on April 12th after taking two capsules for a toothache.</p>
      <p>Autopsies confirmed both victims were killed by cyanide poisoning. The capsules were bought on different days, but from the same store.</p>

      <section>
        <h2>Database Schema</h2>
        <img src="/images/database.png" height="1000" width="1000" alt="Database schema" />
      </section>


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

      <hr />

      {/* --- Accordion Hints --- */}
      <section className="hints">
        <h2>🧩 Hints</h2>
        <div className="accordion">
          {hintsConfig.map((h, idx) => {
            const locked = idx > unlockedCount;
            const isOpen = openIndex === idx;
            return (
              <div key={h.id} className={`accordion-item ${locked ? 'locked' : ''}`}>
                <button
                  className="accordion-header"
                  disabled={locked}
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  {locked ? `🔒 ${h.title}` : `🔓 ${h.title}`}
                </button>

                {isOpen && (
                  <div className="accordion-panel">
                    <p className="hint-intro">{h.prompt}</p>
                    <HintBox
                      hint={h.prompt}
                      answer={h.answer}
                      requiredColumns={h.requiredColumns}
                      orderBy={h.orderBy}
                      boxTitle={h.title}
                      placeholder={h.placeholder}
                      onSolved={() => onSolved(idx)}
                    />
                    <p className="progress-note">
                      {idx < hintsConfig.length - 1
                        ? (idx < unlockedCount ? '✅ Solved.' : 'Solve this to unlock the next hint.')
                        : 'This is the final hint in the sequence.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
