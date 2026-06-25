import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { 
  LayoutDashboard, 
  LogOut, 
  Hash, 
  Plus, 
  Settings, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isBoardsOpen, setIsBoardsOpen] = useState(true);

  const { data: boards } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await api.get('/boards');
      return res.data;
    }
  });

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-[#FBFBFC] h-screen flex flex-col transition-all duration-300">
      
      {/* Workspace Header */}
      <div className="h-14 flex items-center px-4 border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer group">
        <div className="w-6 h-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <span className="ml-3 font-semibold text-sm text-gray-800 group-hover:text-gray-900 truncate">
          {user?.name}'s Workspace
        </span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => 
            `flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-gray-200/60 text-gray-900' : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 mr-2.5 opacity-70" />
          Dashboard
        </NavLink>

        <div className="pt-4 pb-1">
          <button 
            onClick={() => setIsBoardsOpen(!isBoardsOpen)}
            className="flex items-center justify-between w-full px-2.5 py-1 text-xs font-semibold text-gray-500 hover:text-gray-900 uppercase tracking-wider group"
          >
            <span className="flex items-center">
              {isBoardsOpen ? <ChevronDown className="w-3 h-3 mr-1 opacity-50" /> : <ChevronRight className="w-3 h-3 mr-1 opacity-50" />}
              Projects
            </span>
            <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          {isBoardsOpen && (
            <div className="mt-1 space-y-0.5">
              {boards?.map(board => (
                <NavLink 
                  key={board._id}
                  to={`/boards/${board._id}`} 
                  className={({ isActive }) => 
                    `flex items-center px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                      isActive ? 'bg-gray-200/60 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                    }`
                  }
                >
                  <Hash className="w-4 h-4 mr-2.5 opacity-50 text-gray-400" />
                  <span className="truncate">{board.title}</span>
                </NavLink>
              ))}
              {boards?.length === 0 && (
                <div className="px-8 py-2 text-xs text-gray-400">No projects yet</div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-gray-200 space-y-1">
        <button 
          className="flex items-center w-full px-2.5 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-4 h-4 mr-2.5 opacity-70" />
          Settings
        </button>
        <button 
          onClick={logout}
          className="flex items-center w-full px-2.5 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2.5 opacity-70" />
          Log out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
