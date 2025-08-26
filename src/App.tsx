import React from 'react';
import FinancialDataUpload from './components/FinancialDataUpload';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">
          Financial Data Upload System
        </h1>
        <FinancialDataUpload />
      </div>
    </div>
  );
}

export default App;