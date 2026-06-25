import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans text-gray-900">
      <Sidebar isMobileOpen={isMobileMenuOpen} closeMobile={() => setIsMobileMenuOpen(false)} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white w-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-20">
          <div className="flex items-center">
            <div className="w-7 h-7 bg-gradient-to-br from-gray-800 to-gray-900 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm mr-2.5">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-sm text-gray-900 truncate">
              {user?.name}'s Workspace
            </span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
