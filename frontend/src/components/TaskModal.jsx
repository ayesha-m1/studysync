// src/components/TaskModal.jsx
import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';


export default function TaskModal({ isOpen, onClose, onSubmit, task, mode }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    priority: 'medium',
    dueDate: '',
    timeSpent: 0,
    progress: 0,
    isCompleted: false,
    createdAt: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);


  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        subject: task.subject || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        timeSpent: task.timeSpent || 0,
        progress: task.progress || 0,
        isCompleted: task.isCompleted || false,
        createdAt: task.createdAt
      });
      
      if (task.createdAt) {
        const createdTime = new Date(task.createdAt).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - createdTime) / 1000);
        setElapsedTime(elapsed);
      }
    } else {
      setFormData({
        title: '',
        description: '',
        subject: '',
        priority: 'medium',
        dueDate: '',
        timeSpent: 0,
        progress: 0,
        isCompleted: false,
        createdAt: new Date().toISOString()
      });
      setElapsedTime(0);
    }
    setErrors({});
    setIsRunning(false);

  }, [task, mode, isOpen]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && isOpen) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isOpen]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today && mode === 'create') {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (formData.timeSpent < 0) {
      newErrors.timeSpent = 'Time spent cannot be negative';
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        progress: checked ? 100 : 0,
        ...(checked && { isCompleted: true })
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare submission data
    const submissionData = {
      ...formData,
      isCompleted: formData.progress === 100 || formData.isCompleted,
      ...((formData.progress === 100 || formData.isCompleted) && formData.timeSpent === 0 && {
        timeSpent: Math.max(0.5, Math.round(elapsedTime / 3600 * 10) / 10)
      })
    };

    try {
      setLoading(true);
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? ' Create New Task' : ' Edit Task'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Complete Math Assignment"
              className={`w-full px-4 py-2 border rounded-lg outline-none transition focus:ring-2 ${
                errors.title
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-gray-200'
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add task details, notes, or requirements..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Subject and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Mathematics, Physics, English"
                className={`w-full px-4 py-2 border rounded-lg outline-none transition focus:ring-2 ${
                  errors.subject
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-gray-200'
                }`}
              />
              {errors.subject && (
                <p className="text-red-600 text-sm mt-1">{errors.subject}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Type any subject name</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition focus:ring-2 focus:ring-gray-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date and Time Spent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg outline-none transition focus:ring-2 ${
                  errors.dueDate
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-gray-200'
                }`}
              />
              {errors.dueDate && (
                <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {mode === 'create' ? 'Estimated Time (hours)' : 'Time Spent (hours)'}
              </label>
              <input
                type="number"
                name="timeSpent"
                value={formData.timeSpent}
                onChange={handleChange}
                placeholder="0"
                step="0.5"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg outline-none transition focus:ring-2 ${
                  errors.timeSpent
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-gray-200'
                }`}
              />
              {errors.timeSpent && (
                <p className="text-red-600 text-sm mt-1">{errors.timeSpent}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {mode === 'create' 
                  ? 'How long do you think this will take?' 
                  : 'Update actual time spent on this task'}
              </p>
            </div>
          </div>

    

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (mode === 'create' ? 'Creating...' : 'Updating...')
                : (mode === 'create' ? ' Create Task' : ' Save Changes')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}