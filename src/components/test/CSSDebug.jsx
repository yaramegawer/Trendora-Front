import React from 'react';

const CSSDebug = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '16px'
        }}>
          CSS Debug Test
        </h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginTop: '24px'
        }}>
          {/* Test Card 1 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Test Card 1</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>123</p>
                <p style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>+12% from last month</p>
              </div>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '8px'
              }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '4px' }}></div>
              </div>
            </div>
            {/* Mini Chart */}
            <div style={{ height: '64px', display: 'flex', alignItems: 'end', gap: '4px' }}>
              {[65, 72, 68, 80, 75, 85, 90].map((height, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                    borderRadius: '2px 2px 0 0',
                    height: `${height}%`,
                    width: '12px'
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Test Card 2 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Test Card 2</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>456</p>
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>+3 new today</p>
              </div>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '8px'
              }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '4px' }}></div>
              </div>
            </div>
            {/* Mini Chart */}
            <div style={{ height: '64px', display: 'flex', alignItems: 'end', gap: '4px' }}>
              {[40, 35, 45, 30, 25, 20, 15].map((height, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(to top, #ef4444, #f87171)',
                    borderRadius: '2px 2px 0 0',
                    height: `${height}%`,
                    width: '12px'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Primary Button
          </button>
          <button style={{
            backgroundColor: '#f3f4f6',
            color: '#374151',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          >
            Secondary Button
          </button>
        </div>

        <div style={{ 
          marginTop: '32px', 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Typography Test</h2>
          <p style={{ color: '#4b5563', marginBottom: '8px' }}>
            This is a paragraph with <span style={{ fontWeight: '600', color: '#2563eb' }}>bold text</span> and <span style={{ fontStyle: 'italic', color: '#10b981' }}>italic text</span>.
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>This is smaller text with different styling.</p>
        </div>
      </div>
    </div>
  );
};

export default CSSDebug;
