import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { ArrowLeft, Plus, Loader2, Search, Filter } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { DndContext, closestCenter, useDroppable } from '@dnd-kit/core';

const DroppableColumn = ({ column, tasks, onEditTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 rounded-3xl flex flex-col max-h-full backdrop-blur-md border shadow-sm transition-colors duration-200 ${isOver ? 'bg-indigo-100/80 border-indigo-300' : column.bgColor} ${column.borderColor}`}
    >
      <div className="p-5 flex justify-between items-center">
        <div className={`px-4 py-1.5 rounded-full ${column.headerColor} font-bold text-sm flex items-center shadow-sm`}>
          <div className="w-2 h-2 rounded-full bg-current mr-2 opacity-70"></div>
          {column.title}
        </div>
        <span className="bg-white/80 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-gray-200/50">
          {tasks.length}
        </span>
      </div>
      
      <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        {tasks.map(task => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onEdit={onEditTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center p-6 border-2 border-dashed border-gray-300/50 rounded-2xl text-gray-400 text-sm font-medium">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

const BoardView = () => {
  const { boardId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const res = await api.get(`/boards/${boardId}`);
      return res.data;
    }
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', boardId],
    queryFn: async () => {
      const res = await api.get(`/tasks?boardId=${boardId}`);
      return res.data;
    }
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, newStatus }) => {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    },
    onMutate: async ({ taskId, newStatus }) => {
      await queryClient.cancelQueries(['tasks', boardId]);
      const previousTasks = queryClient.getQueryData(['tasks', boardId]);
      queryClient.setQueryData(['tasks', boardId], old => 
        old?.map(t => t._id === taskId ? { ...t, status: newStatus } : t)
      );
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['tasks', boardId], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks', boardId]);
      queryClient.invalidateQueries(['allTasks']); 
    }
  });

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.data.current?.task.status !== over.id) {
      updateTaskStatus.mutate({ 
        taskId: active.id, 
        newStatus: over.id 
      });
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', bgColor: 'bg-slate-100/60', borderColor: 'border-slate-200/60', headerColor: 'bg-slate-200/50 text-slate-700' },
    { id: 'in-progress', title: 'In Progress', bgColor: 'bg-indigo-50/60', borderColor: 'border-indigo-100/60', headerColor: 'bg-indigo-100/50 text-indigo-700' },
    { id: 'done', title: 'Done', bgColor: 'bg-emerald-50/60', borderColor: 'border-emerald-100/60', headerColor: 'bg-emerald-100/50 text-emerald-700' },
  ];

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  if (boardLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="glass p-8 rounded-3xl text-center">
          <p className="text-red-500 font-bold text-xl mb-4">Board not found</p>
          <Link to="/" className="text-indigo-600 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-300/20 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="glass-panel z-10 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm sticky top-0 gap-4 border-t-0 border-x-0 rounded-none rounded-b-xl">
        <div className="flex items-center space-x-4">
          <Link to="/" className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading leading-tight">{board.title}</h1>
            {board.description && <p className="text-sm text-gray-500">{board.description}</p>}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-3 py-2 bg-white/80 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-white/80 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-700 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="med">Medium</option>
              <option value="low">Low</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button
            onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
            className="flex items-center px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </header>

      {/* Board Columns */}
      <main className="flex-1 overflow-x-auto p-6 z-10 custom-scrollbar">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex space-x-6 h-full items-start pb-4">
            {columns.map(column => {
              const columnTasks = filteredTasks.filter(t => t.status === column.id);
              return (
                <DroppableColumn 
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onEditTask={handleEditTask}
                />
              );
            })}
            <div className="w-4 flex-shrink-0"></div>
          </div>
        </DndContext>
      </main>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boardId={boardId}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

export default BoardView;
