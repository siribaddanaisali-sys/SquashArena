import React from 'react';
import DeveloperSidebar from './DeveloperSidebar';

export default function DeveloperLayout({ children }) {
  return (
    <div className="flex">
      <DeveloperSidebar />
      <main className="ml-64 flex-1 bg-squash-light min-h-screen">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
