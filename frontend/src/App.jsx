// this page has been generated Orchid AI

import { useState } from 'react';
import LandingPage from './components/LandingPage';
import InputPage from './components/InputPage';
import DiagnosticPage from './components/DiagnosticPage';
import ResultPage from './components/ResultPage';

// Page states
const PAGES = {
  LANDING: 'landing',
  INPUT: 'input',
  DIAGNOSTIC: 'diagnostic',
  RESULT: 'result',
};

export default function App() {
  const [page, setPage] = useState(PAGES.LANDING);
  const [inputData, setInputData] = useState(null);
  const [result, setResult] = useState(null);

  return (
    <div style={{ minHeight: '100vh' }}>
      {page === PAGES.LANDING && (
        <LandingPage onStart={() => setPage(PAGES.INPUT)} />
      )}
      {page === PAGES.INPUT && (
        <InputPage
          onSubmit={(data) => {
            setInputData(data);
            setPage(PAGES.DIAGNOSTIC);
          }}
        />
      )}
      {page === PAGES.DIAGNOSTIC && inputData && (
        <DiagnosticPage
          inputData={inputData}
          onComplete={(res) => {
            setResult(res);
            setPage(PAGES.RESULT);
          }}
        />
      )}
      {page === PAGES.RESULT && result && (
        <ResultPage
          result={result}
          inputData={inputData}
          onRestart={() => {
            setInputData(null);
            setResult(null);
            setPage(PAGES.LANDING);
          }}
        />
      )}
    </div>
  );
}
