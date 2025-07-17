import { useState } from 'react';

function FinalBox() {
  const [firstname, setFirst] = useState('');
  const [surname, setSur] = useState('');
  const [result, setResult] = useState(null);  // win or lose message
  const [attempted, setAttempted] = useState(false); // prevents retries

  const handleSubmit = () => {
    if (attempted) return; // Do nothing after one attempt

    setAttempted(true); // lock out future attempts

    if (
      firstname.trim().toLowerCase() === 'sally' &&
      surname.trim().toLowerCase() === 'schofield'
    ) {
      setResult('✅ Correct! You solved the mystery.');
    } else {
      setResult('❌ Incorrect. You only had one chance.');
    }
  };

  return (
    <div className="container">
      <h2>Final Guess</h2>

      <input
        placeholder="First Name"
        value={firstname}
        onChange={(e) => setFirst(e.target.value)}
        disabled={attempted}
      />

      <input
        placeholder="Last Name"
        value={surname}
        onChange={(e) => setSur(e.target.value)}
        disabled={attempted}
      />

      <button onClick={handleSubmit} disabled={attempted}>
        Submit
      </button>

      {result && <p>{result}</p>}
    </div>
  );
}

export default FinalBox;
