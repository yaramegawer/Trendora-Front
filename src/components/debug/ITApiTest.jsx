import React, { useState } from 'react';
import { itEmployeeApi } from '../../services/itApi';

const ITApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🧪 Testing IT API directly...');
      const response = await itEmployeeApi.getAllEmployees();
      console.log('🧪 Test result:', response);
      setResult(response);
    } catch (err) {
      console.error('🧪 Test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>IT API Test</h3>
      <button onClick={testApi} disabled={loading}>
        {loading ? 'Testing...' : 'Test IT Employees API'}
      </button>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{ marginTop: '10px' }}>
          <strong>Result:</strong>
          <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '5px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ITApiTest;
