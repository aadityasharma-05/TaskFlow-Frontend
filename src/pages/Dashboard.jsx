import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, Trash2, LayoutDashboard, Sparkles, Folder, BarChart3, CheckCircle2, Clock, Circle, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();
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
    { name: 'To Do', value: todoCount, color: '#6366f1' }, 
    { name: 'In Progress', value: inProgressCount, color: '#eab308' }, 
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
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-200">
                <LayoutDashboard className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-heading">
                TaskFlow
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-white/50 px-4 py-1.5 rounded-full shadow-sm border border-white/60">
                <span className="text-sm font-semibold text-slate-700">{user?.name}</span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-xl"
                title="Logout"
              >
                <LogOut className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 relative z-10 w-full space-y-12">
        
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-heading mb-3 tracking-tight">
              Welcome back, <span className="text-indigo-600">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-lg text-slate-500 font-medium">Here's what's happening across your projects today.</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-6 sm:mt-0 flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
            Create Project
          </button>
        </div>

        {/* Analytics Section */}
        {!tasksLoading && tasks.length > 0 && (
          <section>
            <div className="flex items-center mb-6">
              <BarChart3 className="w-6 h-6 mr-2 text-indigo-500" strokeWidth={2.5} />
              <h2 className="text-2xl font-bold font-heading text-slate-800 tracking-tight">Activity Overview</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="glass rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Task Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-slate-600 font-semibold"><Circle className="w-4 h-4 mr-2 text-indigo-500" /> To Do</span>
                      <span className="font-bold text-lg">{todoCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-slate-600 font-semibold"><Clock className="w-4 h-4 mr-2 text-amber-500" /> In Progress</span>
                      <span className="font-bold text-lg">{inProgressCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-slate-600 font-semibold"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Done</span>
                      <span className="font-bold text-lg">{doneCount}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-slate-500">Total Tasks</span>
                    <span className="text-4xl font-extrabold text-slate-900 font-heading">{tasks.length}</span>
                  </div>
                </div>
              </div>

              {/* Status Pie Chart */}
              <div className="glass rounded-3xl p-6 lg:col-span-1 flex flex-col items-center justify-center">
                <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider self-start">Status</h3>
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Priority Bar Chart */}
              <div className="glass rounded-3xl p-6 lg:col-span-1 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Priorities</h3>
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Create Board Inline Form */}
        {isCreating && (
          <div className="glass rounded-3xl p-6 animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl border border-indigo-100">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Create New Project</h3>
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  autoFocus
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="Project name..."
                  className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createBoard.isPending || !newBoardTitle.trim()}
                  className="flex-1 sm:flex-none bg-indigo-600 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70"
                >
                  {createBoard.isPending ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewBoardTitle('');
                  }}
                  className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Boards Section */}
        <section className="pt-4">
          <div className="flex items-center mb-6">
            <Folder className="w-6 h-6 mr-2 text-indigo-500" strokeWidth={2.5} />
            <h2 className="text-2xl font-bold font-heading text-slate-800 tracking-tight">Your Boards</h2>
          </div>
          
          {boardsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-white/40 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 text-center py-10 rounded-3xl border border-red-100">Failed to load boards.</div>
          ) : boards?.length === 0 ? (
            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Sparkles className="w-10 h-10 text-indigo-400" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-8">Create your first project board to get started.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards?.map((board) => (
                <div key={board._id} className="glass rounded-3xl p-6 group hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 relative">
                  <Link to={`/boards/${board._id}`} className="block h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100/50">
                        <Folder className="w-6 h-6" strokeWidth={2.5} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 font-heading">{board.title}</h3>
                    <p className="text-sm text-indigo-600 font-semibold mt-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      Open workspace <ArrowRight className="w-4 h-4 ml-1" />
                    </p>
                  </Link>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm('Delete this board?')) {
                        deleteBoard.mutate(board._id);
                      }
                    }}
                    className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete board"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
