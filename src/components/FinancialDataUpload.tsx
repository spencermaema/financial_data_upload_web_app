import React, { useState } from 'react';
import UploadForm from './UploadForm';
import DataDisplay from './DataDisplay';
import { FinancialRecord } from '../types/financial';

const FinancialDataUpload: React.FC = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [userInfo, setUserInfo] = useState<{ userId: number; year: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadSuccess = async (userId: number, year: number) => {
    setIsLoading(true);
    try {
      // Fetch the uploaded data
      const response = await fetch(`/api/finances/${userId}/${year}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
        setUserInfo({ userId, year });
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching uploaded data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <UploadForm onUploadSuccess={handleUploadSuccess} isLoading={isLoading} />
      {userInfo && records.length > 0 && (
        <DataDisplay records={records} userInfo={userInfo} />
      )}
    </div>
  );
};

export default FinancialDataUpload;