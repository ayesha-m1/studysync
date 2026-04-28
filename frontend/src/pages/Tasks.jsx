//harded coded task component for future
import { useState } from 'react';
import TaskCard from '../components/TaskCard';
import { Plus, Search, Filter, SortAsc, Grid, List, Edit, Trash2, BookOpen } from 'lucide-react';

export default function Tasks() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Database Systems Assignment', subject: 'Computer Science', dueDate: '2026-02-03', progress: 65, priority: 'high', description: 'Complete ER diagram and normalization', timeSpent: 3.5, estimatedTime: 6 },
    { id: 2, title: 'Web Development Project', subject: 'Computer Science', dueDate: '2026-02-05', progress: 40, priority: 'high', description: 'Build responsive portfolio', timeSpent: 5, estimatedTime: 12 },
    { id: 3, title: 'Data Structures Quiz', subject: 'Computer Science', dueDate: '2026-02-02', progress: 85, priority: 'medium', description: 'Review linked lists, stacks, queues', timeSpent: 4, estimatedTime: 5 },
    { id: 4, title: 'Software Engineering Report', subject: 'Computer Science', dueDate: '2026-02-07', progress: 30, priority: 'medium', description: 'Agile methodology analysis', timeSpent: 2, estimatedTime: 8 },
    { id: 5, title: 'Networks Lab Work', subject: 'Computer Science', dueDate: '2026-02-04', progress: 55, priority: 'low', description: 'TCP/IP protocol implementation', timeSpent: 3, estimatedTime: 6 },
    { id: 6, title: 'AI Algorithms Study', subject: 'Computer Science', dueDate: '2026-02-06', progress: 20, priority: 'low', description: 'Pathfinding and search algorithms', timeSpent: 1, estimatedTime: 5 },
  ]);

  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesSubject = filterSubject === 'all' || task.subject === filterSubject;
      return matchesSearch && matchesPriority && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate': return new Date(a.dueDate) - new Date(b.dueDate);
        case 'progress': return b.progress - a.progress;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default: return 0;
      }
    });

  const subjects = ['all', ...new Set(tasks.map(t => t.subject))];
  const completedCount = tasks.filter(t => t.progress === 100).length;
  const inProgressCount = tasks.filter(t => t.progress > 0 && t.progress < 100).length;
  const notStartedCount = tasks.filter(t => t.progress === 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
                <BookOpen className="w-10 h-10 text-indigo-600" />
                <span>Task Management</span>
              </h1>
              <p className="text-gray-600">Create, Edit, Delete and Organize your study tasks</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Task</span>
            </button>
          </div>

          {/* Task Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
              <p className="text-sm text-gray-600">Not Started</p>
              <p className="text-2xl font-bold text-orange-600">{notStartedCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
          </div>
        </div>

        {/* Organize Tasks Section */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-8" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Organize Tasks</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>

            {/* Filter by Subject */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all appearance-none bg-white cursor-pointer"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="dueDate">Due Date</option>
                <option value="progress">Progress</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>

          {/* Priority Filter Pills */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium">Filter by Priority:</span>
              {['all', 'high', 'medium', 'low'].map(priority => (
                <button
                  key={priority}
                  onClick={() => setFilterPriority(priority)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    filterPriority === priority
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Display */}
        {filteredTasks.length > 0 ? (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {filteredTasks.map((task, index) => (
              <div key={task.id} className="relative group">
                <TaskCard task={task} index={index} />
                {/* Edit/Delete Actions */}
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl" style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or create a new task</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create Task
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}