import React from 'react';

export default function DemoAdminPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Demo Admin Panel Test</h1>
      <p>If you can see this, demo routing is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}
