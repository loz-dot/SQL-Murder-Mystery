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
Hint: Use a WHERE clause 
    `,
    answer: [
      { id: 225, date: '2025-07-01', products_purchased: 'toothpaste, panadol', shopname: 'Pharmacy Select', card_owner: 119 },
      { id: 275, date: '2025-07-04', products_purchased: 'zofran, vitamin b gummies, panadol, creatine', shopname: 'Pharmacy Select', card_owner: 396 }
    ],
    requiredColumns: ['id', 'date', 'products_purchased', 'shopname', 'card_owner'],
    orderBy: 'id asc',
    placeholder: `SELECT * FROM credit_card_statements`
  },

  { id: 2, 
    title: 'Hint 2: Employee Shifts on Key Dates', 
    prompt: `
You're investigating which employees were working on the two key dates: July 1 and July 4, 2025.
Use the employee_shifts, employees, and persons tables to join shift info to employee names.

Return Columns: person_id, full_name, date
Order By the date and the last name of the person in reverse lexicographic order
Hint: Use WHERE on date to match the two dates of interest.`, 
    answer: [{ person_id: 660, full_name: 'Veronica Woods', date: '2025-07-01' },
    { person_id: 438, full_name: 'Kathryn West', date: '2025-07-01' },
    { person_id: 731, full_name: 'Curtis Ware', date: '2025-07-01' },
    { person_id: 410, full_name: 'Mark Villanueva', date: '2025-07-01' },
    { person_id: 501, full_name: 'Carmen Thompson', date: '2025-07-01' },
    { person_id: 11,  full_name: 'Kayla Taylor', date: '2025-07-01' },
    { person_id: 872, full_name: 'Nicole Solis', date: '2025-07-01' },
    { person_id: 349, full_name: 'Michelle Sellers', date: '2025-07-01' },
    { person_id: 411, full_name: 'Kendra Parsons', date: '2025-07-01' },
    { person_id: 216, full_name: 'Lori Oliver', date: '2025-07-01' },
    { person_id: 230, full_name: 'Elizabeth Luna', date: '2025-07-01' },
    { person_id: 631, full_name: 'Trevor Johnson', date: '2025-07-01' },
    { person_id: 975, full_name: 'Thomas Huang', date: '2025-07-01' },
    { person_id: 22,  full_name: 'Angela Herrera', date: '2025-07-01' },
    { person_id: 67,  full_name: 'Lauren Harper', date: '2025-07-01' },
    { person_id: 469, full_name: 'Jamie Gutierrez', date: '2025-07-01' },
    { person_id: 1001, full_name: 'Gavin Drew', date: '2025-07-01' },
    { person_id: 57,  full_name: 'Stephanie Clark', date: '2025-07-01' },
    { person_id: 670, full_name: 'Christopher Campbell', date: '2025-07-01' },
    { person_id: 998, full_name: 'Kathy Allen', date: '2025-07-01' },
    { person_id: 650, full_name: 'Denise Young', date: '2025-07-04' },
    { person_id: 722, full_name: 'Heather Williams', date: '2025-07-04' },
    { person_id: 722, full_name: 'Heather Williams', date: '2025-07-04' },
    { person_id: 428, full_name: 'John Welch', date: '2025-07-04' },
    { person_id: 732, full_name: 'Hector Tucker', date: '2025-07-04' },
    { person_id: 518, full_name: 'Jason Todd', date: '2025-07-04' },
    { person_id: 672, full_name: 'Crystal Sparks', date: '2025-07-04' },
    { person_id: 960, full_name: 'William Snyder', date: '2025-07-04' },
    { person_id: 706, full_name: 'Victor Santiago', date: '2025-07-04' },
    { person_id: 358, full_name: 'Audrey Ramirez', date: '2025-07-04' },
    { person_id: 517, full_name: 'Shannon Peterson', date: '2025-07-04' },
    { person_id: 751, full_name: 'Jacob Perry', date: '2025-07-04' },
    { person_id: 340, full_name: 'Emily Parker', date: '2025-07-04' },
    { person_id: 995, full_name: 'Dr. Murray', date: '2025-07-04' },
    { person_id: 563, full_name: 'Danny Murphy', date: '2025-07-04' },
    { person_id: 356, full_name: 'Charles Murphy', date: '2025-07-04' },
    { person_id: 323, full_name: 'Kevin Morgan', date: '2025-07-04' },
    { person_id: 167, full_name: 'Leslie Miller', date: '2025-07-04' },
    { person_id: 314, full_name: 'Jacob Miller', date: '2025-07-04' },
    { person_id: 760, full_name: 'Robin MD', date: '2025-07-04' },
    { person_id: 470, full_name: 'Randall Love', date: '2025-07-04' },
    { person_id: 233, full_name: 'Nicholas Lee', date: '2025-07-04' },
    { person_id: 44, full_name: 'Christine Kim', date: '2025-07-04' },
    { person_id: 7, full_name: 'John Johnson', date: '2025-07-04' },
    { person_id: 226, full_name: 'Michelle Johnson', date: '2025-07-04' },
    { person_id: 52, full_name: 'Elizabeth Jackson', date: '2025-07-04' },
    { person_id: 190, full_name: 'Kayla Hurley', date: '2025-07-04' },
    { person_id: 651, full_name: 'Christopher Huang', date: '2025-07-04' },
    { person_id: 239, full_name: 'Jody Griffin', date: '2025-07-04' },
    { person_id: 477, full_name: 'Bryan Gill', date: '2025-07-04' },
    { person_id: 105, full_name: 'Stephen Garner', date: '2025-07-04' },
    { person_id: 281, full_name: 'Gina Ford', date: '2025-07-04' },
    { person_id: 802, full_name: 'Michael Duffy', date: '2025-07-04' },
    { person_id: 1001, full_name: 'Gavin Drew', date: '2025-07-04' },
    { person_id: 1001, full_name: 'Gavin Drew', date: '2025-07-04' },
    { person_id: 954, full_name: 'Jessica Carr', date: '2025-07-04' },
    { person_id: 533, full_name: 'Jacqueline Burke', date: '2025-07-04' },
    { person_id: 187, full_name: 'Gregory Burch', date: '2025-07-04' },
    { person_id: 19, full_name: 'Robin Brown', date: '2025-07-04' },
    { person_id: 823, full_name: 'Dominic Becker', date: '2025-07-04' },
    { person_id: 305, full_name: 'Mark Atkins', date: '2025-07-04' },
    { person_id: 164, full_name: 'Melissa Allen', date: '2025-07-04' }], 
    requiredColumns: ['person_id', 'full_name', 'date'], 
    orderBy: 'date asc', 
    placeholder: `SELECT * FROM employee_shifts`
  },

  { id: 3, 
    title: 'Hint 3: Multiple Shifts Worked', 
    prompt: `
Find employees who worked two or more shifts between the dates identified in Hint 1.
Use employee_shifts, employees, and persons table. 

Return: employee_id renamed as Person ID, first name and last name concatenated as Full Name, count renamed as Shift Count
Order by: employee_id, date
Hint: Use GROUP BY and HAVING`, 
    answer: [{ "Person ID": 340, "Full Name": "Emily Parker", "Shift Count": 2 },
    { "Person ID": 356, "Full Name": "Charles Murphy", "Shift Count": 2 },
    { "Person ID": 1001, "Full Name": "Gavin Drew", "Shift Count": 4 },
    { "Person ID": 722, "Full Name": "Heather Williams", "Shift Count": 2 },
    { "Person ID": 604, "Full Name": "Amanda Maxwell", "Shift Count": 2 }], 
    requiredColumns: ['Person ID', 'Full Name', 'Shift Count'], 
    orderBy: 'Person ID asc', 
    placeholder: 'SELECT * FROM employee_shifts' 
  },

  { id: 4, title: 'Hint 4 (placeholder)', prompt: 'Coming soon…', answer: [], requiredColumns: [], orderBy: '', placeholder: '/* TBD */' },
  { id: 5, title: 'Hint 5 (placeholder)', prompt: 'Coming soon…', answer: [], requiredColumns: [], orderBy: '', placeholder: '/* TBD */' },
  { id: 6, title: 'Hint 6 (placeholder)', prompt: 'Coming soon…', answer: [], requiredColumns: [], orderBy: '', placeholder: '/* TBD */' },
  { id: 7, title: 'Hint 7 (placeholder)', prompt: 'Coming soon…', answer: [], requiredColumns: [], orderBy: '', placeholder: '/* TBD */' },
  { id: 8, title: 'Hint 8 (placeholder)', prompt: 'Coming soon…', answer: [], requiredColumns: [], orderBy: '', placeholder: '/* TBD */' },
  { id: 9, title: 'Hint 9 (placeholder)', prompt: 'Coming soon…', answer: [], requiredColumns: [], orderBy: '', placeholder: '/* TBD */' },
  { id: 10, title: 'Hint 10 (placeholder)', prompt: 'Coming soon…', answer: [], requiredColumns: [], orderBy: '', placeholder: '/* TBD */' },
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
        <img src="/images/database.png" height="570" width="800" alt="Database schema" />
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
                    <HintBox
                    hintId={idx + 1}
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
