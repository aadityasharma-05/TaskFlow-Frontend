import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { X, Sparkles, Loader2, Bot } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, boardId, taskToEdit }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'med',
    dueDate: '',
    estimatedEffort: '',
  });

  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        status: taskToEdit.status,
        priority: taskToEdit.priority,
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '',
        estimatedEffort: taskToEdit.estimatedEffort || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'med',
        dueDate: '',
        estimatedEffort: '',
      });
    }
  }, [taskToEdit, isOpen]);

  const saveTask = useMutation({
    mutationFn: async (data) => {
      if (taskToEdit) {
        return await api.put(`/tasks/${taskToEdit._id}`, data);
      } else {
        return await api.post('/tasks', { ...data, board: boardId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', boardId]);
      queryClient.invalidateQueries(['allTasks']); 
      onClose();
    }
  });

  const suggestEstimate = useMutation({
    mutationFn: async () => {
      const res = await api.post('/tasks/suggest-estimate', {
        title: formData.title,
        description: formData.description,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        estimatedEffort: data.estimatedEffort,
        dueDate: data.dueDate,
      }));
      setAiError('');
    },
    onError: () => {
      setAiError('AI engine failed to compute.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveTask.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden border border-white/50 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white/50">
          <h2 className="text-xl font-bold text-gray-900 font-heading">
            {taskToEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-medium"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="What needs to be done?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none min-h-[120px] resize-y"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Add more details..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low Priority</option>
                  <option value="med">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* AI Assistant Section */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Bot className="w-24 h-24 text-indigo-600" />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <h3 className="text-sm font-bold text-indigo-900 flex items-center uppercase tracking-wider">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-600" /> 
                    AI Auto-Estimator
                  </h3>
                  <button
                    type="button"
                    onClick={() => suggestEstimate.mutate()}
                    disabled={!formData.title || suggestEstimate.isPending}
                    className="flex items-center px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestEstimate.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      'Generate Estimates'
                    )}
                  </button>
                </div>

                {aiError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded-lg border border-red-100">{aiError}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-800 mb-1 uppercase tracking-wider">Due Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm font-medium"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-800 mb-1 uppercase tracking-wider">Estimated Effort</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm font-medium"
                      placeholder="e.g. 2 hours"
                      value={formData.estimatedEffort}
                      onChange={(e) => setFormData({...formData, estimatedEffort: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            disabled={saveTask.isPending}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70"
          >
            {saveTask.isPending ? 'Saving...' : (taskToEdit ? 'Save Changes' : 'Create Task')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
