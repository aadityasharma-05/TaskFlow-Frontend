import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans text-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
        {children}
      </main>
    </div>
  );
};

export default Layout;
