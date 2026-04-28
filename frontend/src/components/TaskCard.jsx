// src/components/TaskCard.jsx
import { useState } from 'react';
import { Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react';
import api from '../utils/api';

export default function TaskCard({ task, index, onEdit, onDelete, onTaskUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localProgress, setLocalProgress] = useState(task.progress);

  const handleProgressChange = async (newProgress) => {
    setLocalProgress(newProgress);
    
    try {
      setIsUpdating(true);
      await api.put(`/tasks/${task.id}`, {
        progress: newProgress,
        isCompleted: newProgress === 100,
        ...(newProgress === 100 && { completedAt: new Date().toISOString() })
      });

      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error updating task progress:', error);
      
      setLocalProgress(task.progress);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteToggle = async () => {
    const newProgress = task.isCompleted ? 0 : 100;
    await handleProgressChange(newProgress);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && !task.isCompleted;
  const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className={`bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
        task.isCompleted
          ? 'border-green-200 bg-green-50'
          : isOverdue
          ? 'border-red-200'
          : 'border-gray-200'
      }`}
      style={{
        animation: `slideInLeft 0.5s ease-out ${index * 0.1}s both`
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 flex items-start gap-3">
            {/* Complete button */}
            <button
              onClick={handleCompleteToggle}
              disabled={isUpdating}
              className="mt-1 transition-all hover:scale-110 disabled:opacity-50"
            >
              {task.isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className={`text-lg font-semibold ${
                  task.isCompleted
                    ? 'text-gray-500 line-through'
                    : 'text-gray-900'
                }`}>
                  {task.title}
                </h3>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {task.subject}
                </span>
              </div>
              {task.description && (
                <p className={`text-sm ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions - Hide Edit button for completed tasks */}
          <div className="flex gap-2 ml-2">
            {/* Only show Edit button if task is NOT completed */}
            {!task.isCompleted && (
              <button
                onClick={() => onEdit()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                disabled={isUpdating}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete()}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              disabled={isUpdating}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar section */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Progress: {localProgress}%</span>
            <span className="text-xs text-gray-500">
              {isOverdue && !task.isCompleted
                ? `${Math.abs(daysUntilDue)} days overdue`
                : daysUntilDue > 0 && !task.isCompleted
                ? `Due in ${daysUntilDue} days`
                : task.isCompleted
                ? 'Completed ✓'
                : 'Due today'}
            </span>
          </div>

          {/* Progress bar with quick update buttons - Hide for completed tasks */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    localProgress === 100
                      ? 'bg-green-500'
                      : localProgress >= 75
                      ? 'bg-blue-500'
                      : localProgress >= 50
                      ? 'bg-yellow-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${localProgress}%` }}
                />
              </div>
            </div>

            {/* Quick progress buttons - Hide for completed tasks */}
            {!task.isCompleted && (
              <div className="flex gap-1">
                {[0, 25, 50, 75, 100].map(progress => (
                  <button
                    key={progress}
                    onClick={() => handleProgressChange(progress)}
                    disabled={isUpdating}
                    className={`flex-1 py-1 text-xs font-medium rounded transition-all ${
                      localProgress === progress
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {progress}%
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with time and metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>
            Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {task.estimatedTime > 0 && (
            <span>Est. Time: {task.estimatedTime}h</span>
          )}
          {task.timeSpent > 0 && (
            <span className="text-blue-600 font-medium">Time Spent: {task.timeSpent}h</span>
          )}
        </div>
      </div>
    </div>
  );
}