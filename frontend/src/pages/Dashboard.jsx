// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ProfileModal from '../components/ProfileModal';
import LevelProgress from '../components/Gamification/LevelProgress';
import BadgeCollection from '../components/Gamification/BadgeCollection';
import { BookOpen, CheckCircle, Clock, TrendingUp, Target, Award, AlertCircle, BarChart3, GraduationCap, Plus, RefreshCw, X, Filter, Eye, EyeOff } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import api from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    fetchTasks();

    return () => clearInterval(timer);
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks?sortBy=dueDate');
      setTasks(response.data.data.tasks);
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      setTasks(prev => [response.data.data.task, ...prev]);
      setIsModalOpen(false);
      setError('');
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const response = await api.put(`/tasks/${selectedTask.id}`, taskData);
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id ? response.data.data.task : task
      ));
      setIsModalOpen(false);
      setSelectedTask(null);
      setError('');
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setError('');
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setModalMode('create');
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleModalSubmit = (taskData) => {
    if (modalMode === 'create') {
      handleCreateTask(taskData);
    } else {
      handleUpdateTask(taskData);
    }
  };

  const completedTasks = tasks.filter(t => t.isCompleted);
  const activeTasks = tasks.filter(t => !t.isCompleted);
  
  const totalStudyHours = completedTasks.reduce((sum, t) => sum + parseFloat(t.timeSpent || 0), 0);
  
  const stats = {
    activeTasks: activeTasks.length,
    completedTasks: completedTasks.length,
    totalStudyHours: totalStudyHours.toFixed(1),
    averageProgress: tasks.length > 0 
      ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
      : 0
  };

  const statsArray = [
    { label: 'Active Tasks', value: stats.activeTasks, icon: BookOpen, color: 'blue' },
    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle, color: 'green' },
    { label: 'Study Hours', value: `${stats.totalStudyHours}h`, icon: Clock, color: 'purple' },
    { label: 'Avg Progress', value: `${stats.averageProgress}%`, icon: TrendingUp, color: 'orange' },
  ];

  let displayTasks = activeTasks;
  
  if (filterPriority !== 'all') {
    displayTasks = displayTasks.filter(t => t.priority === filterPriority);
  }

  displayTasks = displayTasks.sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'progress') {
      return b.progress - a.progress;
    }
    return 0;
  }).slice(0, 5);

  const completedTasksList = completedTasks;

  const subjectProgress = tasks.reduce((acc, task) => {
    if (!acc[task.subject]) {
      acc[task.subject] = { subject: task.subject, tasks: 0, completed: 0, totalProgress: 0 };
    }
    acc[task.subject].tasks++;
    acc[task.subject].totalProgress += task.progress;
    if (task.isCompleted) {
      acc[task.subject].completed++;
    }
    return acc;
  }, {});

  const subjectProgressArray = Object.values(subjectProgress).map(subject => ({
    ...subject,
    progress: Math.round(subject.totalProgress / subject.tasks)
  }));

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Responsive */}
        <div className="mb-6 md:mb-8" style={{ animation: 'fadeIn 0.8s ease-out' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2 flex items-center gap-2 md:gap-3">
                <GraduationCap className="w-7 h-7 md:w-10 md:h-10 text-gray-700" />
                <span className="truncate">{greeting}, {user.name?.split(' ')[0]}!</span>
              </h1>
              <p className="text-sm md:text-lg text-gray-600">Track your academic progress</p>
            </div>
            <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 text-center sm:text-right">
              <div className="text-xl md:text-3xl font-bold text-gray-800">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs md:text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {statsArray.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-3 md:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
            >
              <div className="flex items-start justify-between mb-2 md:mb-4">
                <h3 className="text-xs md:text-sm font-medium text-gray-600">{stat.label}</h3>
                <stat.icon className={`w-4 h-4 md:w-5 md:h-5 text-${stat.color}-500`} />
              </div>
              <div className="text-xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
              {stat.label === 'Study Hours' && (
                <p className="text-xs text-gray-500 mt-1 hidden md:block">From completed tasks</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Tasks Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                  <span>Active Tasks</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <Filter className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                    <select 
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-2 py-1 md:px-3 md:py-2 border border-gray-300 text-gray-700 rounded-lg text-xs md:text-sm"
                    >
                      <option value="all">All</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2 py-1 md:px-3 md:py-2 border border-gray-300 text-gray-700 rounded-lg text-xs md:text-sm"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="progress">Progress</option>
                  </select>

                  <button 
                    onClick={fetchTasks}
                    className="px-2 py-1 md:px-3 md:py-2 border border-gray-300 text-gray-700 rounded-lg text-xs md:text-sm"
                  >
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  <button 
                    onClick={openCreateModal}
                    className="px-3 py-1 md:px-4 md:py-2 bg-gray-800 text-white rounded-lg text-xs md:text-sm flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Add Task</span>
                  </button>
                </div>
              </div>
              
              {displayTasks.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">No active tasks</h3>
                  <p className="text-sm text-gray-500 mb-4">Create your first task to get started!</p>
                  <button 
                    onClick={openCreateModal}
                    className="px-4 py-2 md:px-6 md:py-3 bg-gray-800 text-white rounded-lg text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4 inline mr-1" /> Create Task
                  </button>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {displayTasks.map((task, index) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      index={index}
                      onEdit={() => openEditModal(task)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onTaskUpdate={() => fetchTasks()}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks Section */}
            {completedTasksList.length > 0 && (
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-green-200">
                <button
                  onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                  className="w-full flex items-center justify-between mb-4 md:mb-6"
                >
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    <span>Completed ({completedTasksList.length})</span>
                  </h2>
                  {showCompletedTasks ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                </button>

                {showCompletedTasks && (
                  <div className="space-y-3 md:space-y-4">
                    {completedTasksList.map((task, index) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        index={index}
                        onEdit={() => openEditModal(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                        onTaskUpdate={() => fetchTasks()}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subject Progress */}
            {subjectProgressArray.length > 0 && (
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                  <span>Subject Progress</span>
                </h2>
                <div className="space-y-4 md:space-y-6">
                  {subjectProgressArray.slice(0, 5).map((subject, index) => (
                    <div key={subject.subject} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base">{subject.subject}</h3>
                          <p className="text-xs text-gray-500">{subject.completed}/{subject.tasks} done</p>
                        </div>
                        <span className="text-xl md:text-2xl font-bold text-gray-800">{subject.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gray-800 transition-all duration-1000"
                          style={{ width: `${subject.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <LevelProgress />
            <BadgeCollection />
            
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm text-white">
              <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 md:w-5 md:h-5" />
                <span>Quick Actions</span>
              </h2>
              <div className="space-y-2">
                <button onClick={openCreateModal} className="w-full py-2 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm md:text-base text-left px-3 md:px-4">
                  📝 Create Task
                </button>
                <button onClick={fetchTasks} className="w-full py-2 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm md:text-base text-left px-3 md:px-4">
                  🔄 Refresh
                </button>
                <button onClick={() => setSortBy('priority')} className="w-full py-2 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm md:text-base text-left px-3 md:px-4">
                  📅 Sort by Priority
                </button>
                <button onClick={() => setIsProfileModalOpen(true)} className="w-full py-2 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm md:text-base text-left px-3 md:px-4">
                  👤 Profile
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                <span>Performance</span>
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-bold">{tasks.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-bold text-green-600">{stats.completedTasks}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-bold">{tasks.length > 0 ? Math.round((stats.completedTasks / tasks.length) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
                  <span className="text-gray-600">Study Hours</span>
                  <span className="font-bold text-purple-600">{stats.totalStudyHours}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleModalSubmit} task={selectedTask} mode={modalMode} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} user={user} onProfileUpdate={(updatedUser) => setUser(updatedUser)} />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}