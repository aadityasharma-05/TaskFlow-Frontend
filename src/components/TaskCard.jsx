import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  SignalHigh, 
  SignalMedium, 
  SignalLow, 
  CalendarDays, 
  GripVertical,
  MoreHorizontal
} from 'lucide-react';

const priorityConfig = {
  high: { icon: SignalHigh, color: 'text-red-500' },
  med: { icon: SignalMedium, color: 'text-amber-500' },
  low: { icon: SignalLow, color: 'text-gray-400' },
};

const TaskCard = ({ task, onEdit }) => {
  const queryClient = useQueryClient();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
  const PriorityIcon = priorityConfig[task.priority].icon;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group flex flex-col bg-white rounded-md border border-gray-200 p-3 hover:border-gray-300 hover:shadow-sm transition-all duration-200 relative ${isDragging ? 'shadow-lg border-gray-400 scale-[1.02]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        
        {/* Title and ID */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono text-gray-400">T-{task._id.slice(-4).toUpperCase()}</span>
            <h4 className="text-sm font-medium text-gray-900 truncate" title={task.title}>
              {task.title}
            </h4>
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-1 mb-3">{task.description}</p>
          )}
        </div>

        {/* Action Menu (Hover) */}
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors cursor-grab active:cursor-grabbing"
            {...listeners} 
            {...attributes}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors ml-1"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-transparent group-hover:border-gray-50 transition-colors">
        <div className="flex items-center" title={`Priority: ${task.priority}`}>
          <PriorityIcon className={`w-3.5 h-3.5 ${priorityConfig[task.priority].color}`} />
        </div>
        
        {task.dueDate && (
          <div className={`flex items-center text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            <CalendarDays className="w-3.5 h-3.5 mr-1" />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
        )}
        
        {task.estimatedEffort && (
          <div className="flex items-center text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
            {task.estimatedEffort}
          </div>
        )}

        <div className="ml-auto flex items-center">
          <div className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[9px] font-bold text-gray-600 shadow-sm">
            {task.owner?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
