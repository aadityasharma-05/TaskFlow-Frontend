import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { X, Sparkles, Loader2, Bot, CalendarDays, AlignLeft, Flag } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, boardId, taskToEdit }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'med',
    dueDate: '',
    estimatedEffort: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        status: taskToEdit.status || 'todo',
        priority: taskToEdit.priority || 'med',
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '',
        estimatedEffort: taskToEdit.estimatedEffort || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'med',
        dueDate: '',
        estimatedEffort: ''
      });
    }
  }, [taskToEdit, isOpen]);

  const saveTask = useMutation({
    mutationFn: async (data) => {
      if (taskToEdit) {
        await api.put(`/tasks/${taskToEdit._id}`, data);
      } else {
        await api.post('/tasks', { ...data, boardId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', boardId]);
      queryClient.invalidateQueries(['allTasks']);
      onClose();
    }
  });

  const deleteTask = useMutation({
    mutationFn: async () => {
      if (taskToEdit) {
        await api.delete(`/tasks/${taskToEdit._id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', boardId]);
      queryClient.invalidateQueries(['allTasks']);
      onClose();
    }
  });

  const generateEstimates = useMutation({
    mutationFn: async () => {
      const res = await api.post('/tasks/suggest-estimate', {
        title: formData.title,
        description: formData.description
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.suggestion) {
        let parsed;
        try {
          parsed = JSON.parse(data.suggestion);
          setFormData(prev => ({
            ...prev,
            estimatedEffort: parsed.estimatedEffort || prev.estimatedEffort,
            dueDate: parsed.dueDate || prev.dueDate
          }));
        } catch (e) {
          console.error("Failed to parse Groq suggestion", e);
        }
      }
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    saveTask.mutate(formData);
  };

  const handleGenerateClick = () => {
    if (!formData.title) return;
    setIsGenerating(true);
    generateEstimates.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 text-[10px] font-mono px-2 py-0.5 rounded">
              {taskToEdit ? `T-${taskToEdit._id.slice(-4).toUpperCase()}` : 'NEW ISSUE'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <input
                type="text"
                autoFocus
                placeholder="Issue title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full text-xl font-semibold text-gray-900 placeholder-gray-300 border-0 border-b border-transparent hover:border-gray-200 focus:border-gray-900 focus:ring-0 px-0 py-2 transition-colors bg-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <AlignLeft className="w-4 h-4 mr-2 text-gray-400" /> Description
              </div>
              <textarea
                placeholder="Add a description..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full h-32 px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none transition-colors"
              />
            </div>

            {/* AI Action Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-600">
                <Bot className="w-4 h-4 mr-2 text-indigo-500" />
                <span>Auto-estimate effort & due date</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateClick}
                disabled={isGenerating || !formData.title.trim()}
                className="flex items-center px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1.5 text-indigo-500" />
                    Ask AI
                  </>
                )}
              </button>
            </div>

            <div className="h-px bg-gray-100 my-6"></div>

            {/* Properties */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-32 text-xs font-medium text-gray-500 flex items-center">Status</div>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="flex-1 text-sm border border-gray-200 rounded-md py-1.5 px-2 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="flex items-center">
                <div className="w-32 text-xs font-medium text-gray-500 flex items-center">
                  <Flag className="w-3.5 h-3.5 mr-1.5" /> Priority
                </div>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="flex-1 text-sm border border-gray-200 rounded-md py-1.5 px-2 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="low">Low</option>
                  <option value="med">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-center">
                <div className="w-32 text-xs font-medium text-gray-500 flex items-center">
                  <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Due Date
                </div>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="flex-1 text-sm border border-gray-200 rounded-md py-1.5 px-2 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>

              <div className="flex items-center">
                <div className="w-32 text-xs font-medium text-gray-500 flex items-center">Estimate</div>
                <input
                  type="text"
                  placeholder="e.g., 2h, 1d"
                  value={formData.estimatedEffort}
                  onChange={(e) => setFormData({...formData, estimatedEffort: e.target.value})}
                  className="flex-1 text-sm border border-gray-200 rounded-md py-1.5 px-2 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50/50">
          {taskToEdit ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete this task?')) {
                  deleteTask.mutate();
                }
              }}
              className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Delete
            </button>
          ) : (
            <div></div> // empty div for flex spacing
          )}
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="task-form"
              disabled={saveTask.isPending || !formData.title.trim()}
              className="px-4 py-2 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm"
            >
              {saveTask.isPending ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Issue'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskModal;
