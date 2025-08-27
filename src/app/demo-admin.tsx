import React from 'react';
import { AdminPanel } from '../features/discovery/components/AdminPanel';

export default function DemoAdminPage() {
  return (
    <div>
      <div className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">🚀 Featured Places Admin Panel - Demo</h1>
        <p className="mt-2">This is a demo of the comprehensive admin panel with image upload functionality</p>
      </div>
      <AdminPanel />
    </div>
  );
}
