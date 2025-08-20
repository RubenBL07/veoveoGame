import React from 'react';

const Index = () => {
  console.log('Index component rendering...');
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Veo Veo</h1>
      <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>¡La aplicación está funcionando!</p>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid #6366f1',
        borderTop: '3px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.7 }}>
        Si ves esto, el problema está en el CSS o en otros componentes
      </p>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Index;
