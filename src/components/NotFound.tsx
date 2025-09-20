import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '72px',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
      }}
    >
      404
    </div>
  );
};

export default NotFound;
