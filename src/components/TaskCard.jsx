import React from 'react';
import { Calendar, Clock, Trash2, Edit2, CheckCircle2, Circle, ArrowRightCircle, GripVertical } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const priorityConfig = {
  high: { color: 'bg-rose-100 text-rose-700 border-rose-200', label: 'High' },
  med: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Medium' },
  low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Low' },
};

const TaskCard = ({ task, onEdit }) => {
  const queryClient = useQueryClient();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const updateStatus = useMutation({
    mutationFn: async (newStatus) => {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', task.board]);
      queryClient.invalidateQueries(['allTasks']); 
    }
  });

  const deleteTask = useMutation({
    mutationFn: async () => {
      await api.delete(`/tasks/${task._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', task.board]);
      queryClient.invalidateQueries(['allTasks']); 
    }
  });

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 relative ${isDragging ? 'cursor-grabbing border-indigo-400 shadow-xl' : ''}`}
    >
      
      {/* Drag Handle & Action Buttons */}
      <div className="absolute top-4 right-4 flex space-x-1 transition-opacity duration-200 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-100 p-1 opacity-0 group-hover:opacity-100 z-10">
        <button 
          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-grab active:cursor-grabbing" 
          title="Drag to move"
          {...listeners} 
          {...attributes}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button onClick={() => onEdit(task)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit Task">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => { if(confirm('Delete task?')) deleteTask.mutate() }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Task">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3 pr-24">
        <h4 className="font-bold text-gray-900 text-base leading-tight mb-1 font-heading group-hover:text-indigo-700 transition-colors">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{task.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${priorityConfig[task.priority].color}`}>
          {priorityConfig[task.priority].label}
        </span>
        
        {task.dueDate && (
          <span className={`flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${isOverdue ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
        
        {task.estimatedEffort && (
          <span className="flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold">
            <Clock className="w-3 h-3 mr-1" />
            {task.estimatedEffort}
          </span>
        )}
      </div>

      {/* Quick Move Actions */}
      <div className="flex items-center border-t border-gray-100 pt-3 mt-1 space-x-2 relative z-10">
        {task.status !== 'todo' && (
          <button onClick={() => updateStatus.mutate('todo')} className="flex items-center justify-center flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg transition-colors border border-transparent hover:border-slate-200 group/btn">
            <Circle className="w-3.5 h-3.5 mr-1.5 opacity-50 group-hover/btn:opacity-100" /> To Do
          </button>
        )}
        {task.status !== 'in-progress' && (
          <button onClick={() => updateStatus.mutate('in-progress')} className="flex items-center justify-center flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors border border-transparent hover:border-indigo-200 group/btn">
            <ArrowRightCircle className="w-3.5 h-3.5 mr-1.5 opacity-50 group-hover/btn:opacity-100" /> In Prog
          </button>
        )}
        {task.status !== 'done' && (
          <button onClick={() => updateStatus.mutate('done')} className="flex items-center justify-center flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors border border-transparent hover:border-emerald-200 group/btn">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 opacity-50 group-hover/btn:opacity-100" /> Done
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
