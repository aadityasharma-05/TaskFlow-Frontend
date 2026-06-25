import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Loader2, Search, Filter, Plus, ChevronRight, Hash, MoreHorizontal } from 'lucide-react';
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
      className={`flex-shrink-0 w-[300px] flex flex-col max-h-full transition-colors duration-200 ${isOver ? 'bg-gray-50/80 rounded-md' : ''}`}
    >
      <div className="px-2 py-3 flex justify-between items-center group cursor-pointer hover:bg-gray-50 rounded-md transition-colors mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${column.dotColor}`}></div>
          <span className="font-semibold text-sm text-gray-900">{column.title}</span>
          <span className="text-xs font-medium text-gray-400">{tasks.length}</span>
        </div>
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 text-gray-400 hover:text-gray-700 rounded"><Plus className="w-3.5 h-3.5" /></button>
          <button className="p-1 text-gray-400 hover:text-gray-700 rounded"><MoreHorizontal className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      
      <div className="px-1 flex-1 overflow-y-auto space-y-2 custom-scrollbar pb-4">
        {tasks.map(task => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onEdit={onEditTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center p-4 rounded-md border border-dashed border-gray-200 text-gray-400 text-xs font-medium bg-gray-50/50">
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
    { id: 'todo', title: 'Todo', dotColor: 'bg-gray-300' },
    { id: 'in-progress', title: 'In Progress', dotColor: 'bg-amber-400' },
    { id: 'done', title: 'Done', dotColor: 'bg-indigo-500' },
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
      <div className="h-full flex justify-center items-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="h-full flex justify-center items-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 font-medium text-sm mb-2">Project not found or deleted.</p>
          <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative">
      
      {/* Top Breadcrumb & Toolbar */}
      <header className="flex-none px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm w-full overflow-x-auto pb-1 sm:pb-0 custom-scrollbar-hide">
          <Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center flex-shrink-0">
            <span className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center mr-2 text-[10px] font-bold text-gray-600">
              U
            </span>
            Workspace
          </Link>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gray-400 flex-shrink-0" />
          <div className="flex items-center font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-100 shadow-sm whitespace-nowrap">
            <Hash className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            {board.title}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all w-full sm:w-40"
            />
          </div>
          
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none pl-7 pr-6 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 cursor-pointer focus:outline-none hover:bg-gray-50"
            >
              <option value="all">Priority</option>
              <option value="high">High</option>
              <option value="med">Medium</option>
              <option value="low">Low</option>
            </select>
            <Filter className="h-3.5 w-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
            className="flex items-center px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors shadow-sm ml-1"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Issue
          </button>
        </div>
      </header>

      {/* Kanban Board Layout */}
      <main className="flex-1 overflow-x-auto p-6 bg-white custom-scrollbar">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex h-full gap-6 items-start">
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
