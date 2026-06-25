import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Folder, BarChart3, CheckCircle2, Clock, Circle, LayoutDashboard, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: boards, isLoading: boardsLoading, error } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await api.get('/boards');
      return res.data;
    }
  });

  const { data: allTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['allTasks'],
    queryFn: async () => {
      const res = await api.get('/tasks/all');
      return res.data;
    }
  });

  const createBoard = useMutation({
    mutationFn: async (title) => {
      const res = await api.post('/boards', { title });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['boards']);
      setNewBoardTitle('');
      setIsCreating(false);
    }
  });

  const deleteBoard = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/boards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['boards']);
      queryClient.invalidateQueries(['allTasks']);
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    createBoard.mutate(newBoardTitle);
  };

  const tasks = allTasks || [];
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const statusData = [
    { name: 'To Do', value: todoCount, color: '#94a3b8' }, 
    { name: 'In Progress', value: inProgressCount, color: '#f59e0b' }, 
    { name: 'Done', value: doneCount, color: '#10b981' } 
  ].filter(d => d.value > 0);

  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const medPriority = tasks.filter(t => t.priority === 'med').length;
  const lowPriority = tasks.filter(t => t.priority === 'low').length;

  const priorityData = [
    { name: 'High', value: highPriority, color: '#ef4444' },
    { name: 'Medium', value: medPriority, color: '#f59e0b' },
    { name: 'Low', value: lowPriority, color: '#10b981' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-white custom-scrollbar h-full">
      {/* Header */}
      <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-end sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            <LayoutDashboard className="w-6 h-6 mr-3 text-gray-400" />
            Overview
          </h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Project
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        
        {/* Create Board Inline Form */}
        {isCreating && (
          <div className="bg-[#FBFBFC] rounded-xl p-5 border border-gray-200">
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                type="text"
                autoFocus
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Project name..."
                className="flex-1 px-4 py-2 rounded-md border border-gray-300 bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm"
              />
              <button
                type="submit"
                disabled={createBoard.isPending || !newBoardTitle.trim()}
                className="bg-gray-900 text-white text-sm font-medium py-2 px-5 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {createBoard.isPending ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setIsCreating(false); setNewBoardTitle(''); }}
                className="bg-white border border-gray-300 text-gray-700 text-sm font-medium py-2 px-5 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Analytics Grid */}
        {!tasksLoading && tasks.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Summary Widget */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-1.5" /> Status Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-gray-600"><Circle className="w-3.5 h-3.5 mr-2 text-slate-400" /> To Do</span>
                    <span className="font-semibold text-gray-900">{todoCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-gray-600"><Clock className="w-3.5 h-3.5 mr-2 text-amber-500" /> In Progress</span>
                    <span className="font-semibold text-gray-900">{inProgressCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-gray-600"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Done</span>
                    <span className="font-semibold text-gray-900">{doneCount}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
                <span className="text-sm font-medium text-gray-500">Total Tasks</span>
                <span className="text-2xl font-bold text-gray-900">{tasks.length}</span>
              </div>
            </div>

            {/* Status Pie Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Completion</h3>
              <div className="h-40 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Priority Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Priorities</h3>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={30}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-8">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Active Projects</h2>
          </div>
          
          {boardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">Failed to load boards.</div>
          ) : boards?.length === 0 ? (
            <div className="text-center py-16 bg-[#FBFBFC] rounded-xl border border-dashed border-gray-300">
              <Folder className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No projects yet</h3>
              <p className="text-xs text-gray-500 mb-4">Create your first project to organize your tasks.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-800 transition-colors shadow-sm"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards?.map((board) => (
                <Link 
                  to={`/boards/${board._id}`} 
                  key={board._id} 
                  className="group block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200">
                      <Folder className="w-4 h-4" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm('Delete this project?')) {
                          deleteBoard.mutate(board._id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{board.title}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-4 group-hover:text-gray-900 transition-colors">
                    View project <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
