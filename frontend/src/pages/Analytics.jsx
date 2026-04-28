// src/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { 
  TrendingUp, 
  Award, 
  Clock,
  BookOpen,
  CheckCircle2,
  BarChart3,
  FileText,
  Download,
  Calendar,
  Activity,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import api from '../utils/api';

export default function Analytics() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [overallStats, setOverallStats] = useState({
    completionRate: 0,
    averageProgress: 0,
    totalTasksCompleted: 0,
    totalStudyHours: 0,
    activeStreak: 0,
  });
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [progressInsights, setProgressInsights] = useState([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    fetchAnalyticsData();
  }, [navigate, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [overviewRes, subjectsRes, weeklyRes, insightsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/subjects'),
        api.get('/analytics/weekly'),
        api.get('/analytics/insights')
      ]);

      setOverallStats({
        completionRate: overviewRes.data.data.overview.completionRate,
        averageProgress: overviewRes.data.data.overview.averageProgress,
        totalTasksCompleted: overviewRes.data.data.overview.totalTasksCompleted,
        totalStudyHours: overviewRes.data.data.overview.totalStudyHours,
        activeStreak: overviewRes.data.data.overview.activeStreak,
      });

      setSubjectPerformance(subjectsRes.data.data.subjectPerformance || []);
      
      const backendWeeks = weeklyRes.data.data.weeklyActivity || [];
      const swappedWeeks = backendWeeks.map((week, index) => ({
        ...week,
        week: `Week ${index + 1}`
      }));
      
      setWeeklyActivity(swappedWeeks);
      setProgressInsights(insightsRes.data.data.insights || []);

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await api.get('/analytics/report');
      const reportData = JSON.stringify(response.data.data.report, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `progress-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('Report generated and downloaded successfully!');
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report. Please try again.');
    }
  };

  const maxHours = Math.max(...weeklyActivity.map(w => w.studyHours), 1);

  const getIconComponent = (iconName) => {
    const icons = { Calendar, Award, Clock, TrendingUp };
    return icons[iconName] || Clock;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl max-w-md text-center">
          <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-5 py-2 md:px-6 md:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Responsive */}
        <div className="mb-6 md:mb-8" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2 flex items-center gap-2 md:gap-3">
                <BarChart3 className="w-7 h-7 md:w-10 md:h-10 text-indigo-600" />
                <span>Analytics</span>
              </h1>
              <p className="text-sm md:text-base text-gray-600">Track your academic performance</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={fetchAnalyticsData}
                className="px-3 py-2 md:px-5 md:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button 
                onClick={generateReport}
                className="px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Report</span>
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            {['week', 'month'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatBox icon={CheckCircle2} label="Completion Rate" value={`${overallStats.completionRate}%`} color="green" />
          <StatBox icon={Award} label="Avg Progress" value={`${overallStats.averageProgress}%`} color="blue" />
          <StatBox icon={BookOpen} label="Tasks Done" value={overallStats.totalTasksCompleted} color="purple" />
          <StatBox icon={Clock} label="Study Hours" value={`${overallStats.totalStudyHours}h`} color="orange" />
          <StatBox icon={Activity} label="Streak" value={`${overallStats.activeStreak}d`} color="pink" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Subject Performance */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                <span>Subject Performance</span>
              </h2>
              
              {subjectPerformance.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-500 text-sm">No subject data available yet.</p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {subjectPerformance.slice(0, 4).map((subject) => (
                    <div key={subject.subject} className="p-3 md:p-5 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base md:text-lg">{subject.subject}</h3>
                          <p className="text-xs text-gray-500">
                            {subject.tasksCompleted}/{subject.tasksTotal} tasks
                          </p>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-indigo-600">{subject.avgProgress}%</div>
                      </div>
                      <ProgressBar value={subject.avgProgress} showLabel={false} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Progress */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Weekly Progress</h2>
              <div className="space-y-4 md:space-y-6">
                {weeklyActivity.map((week, index) => (
                  <div key={week.week} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-900">{week.week}</span>
                      <div className="flex items-center gap-2 md:gap-4">
                        <span className="text-gray-600 text-xs">{week.tasksCompleted} tasks</span>
                        <span className="font-bold text-indigo-600 text-sm">{week.studyHours}h</span>
                      </div>
                    </div>
                    <div className="h-6 md:h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-end px-2 text-white text-xs font-bold"
                        style={{ width: `${Math.max((week.studyHours / maxHours) * 100, 5)}%` }}
                      >
                        {week.studyHours > 0 && week.studyHours}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:space-y-8">
            {/* Insights */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Insights</h2>
              <div className="space-y-3 md:space-y-4">
                {progressInsights.slice(0, 4).map((insight) => {
                  const Icon = getIconComponent(insight.icon);
                  return (
                    <div key={insight.title} className="p-3 md:p-4 rounded-xl bg-gray-50">
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 rounded-lg bg-indigo-100 text-indigo-600">
                          <Icon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{insight.title}</p>
                          <p className="text-base md:text-lg font-bold text-gray-900">{insight.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md text-white">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/20 text-sm">
                  <span>Progress</span>
                  <span className="text-xl md:text-2xl font-bold">{overallStats.completionRate}%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/20 text-sm">
                  <span>Tasks Done</span>
                  <span className="text-xl md:text-2xl font-bold">{overallStats.totalTasksCompleted}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Study Hours</span>
                  <span className="text-xl md:text-2xl font-bold">{overallStats.totalStudyHours}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  const colors = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    pink: 'text-pink-600',
  };

  return (
    <div className="bg-white rounded-xl p-3 md:p-4 shadow-md hover:shadow-lg transition-all">
      <Icon className={`w-5 h-5 md:w-8 md:h-8 mb-1 md:mb-2 ${colors[color]}`} />
      <p className="text-xs text-gray-600 mb-0.5 md:mb-1">{label}</p>
      <p className="text-lg md:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}