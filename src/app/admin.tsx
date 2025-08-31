import React from 'react';
import { SpreadsheetManager } from '../components/admin/SpreadsheetManager';

export default function AdminPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>G-Decider Admin Panel</h1>
      <SpreadsheetManager onClose={() => {}} />
    </div>
  );
}
