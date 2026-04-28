const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    const user = await User.findByPk(req.user.id);
    
    // Calculate overall statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calculate average progress
    const avgProgress = totalTasks > 0 
      ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
      : 0;
    
    // Calculate total study hours
    const totalStudyHours = tasks.reduce((sum, t) => sum + parseFloat(t.timeSpent || 0), 0);
    
    // Get current streak
    const currentStreak = user.statistics?.currentStreak || 0;
    
    const overview = {
      completionRate,
      averageProgress: avgProgress,
      totalTasksCompleted: completedTasks,
      totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      activeStreak: currentStreak,
      totalTasks,
      activeTasks: totalTasks - completedTasks
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        overview
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching analytics overview'
    });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    
    // Group tasks by subject
    const subjectMap = {};
    
    tasks.forEach(task => {
      if (!subjectMap[task.subject]) {
        subjectMap[task.subject] = {
          subject: task.subject,
          tasksTotal: 0,
          tasksCompleted: 0,
          totalProgress: 0,
          studyHours: 0
        };
      }
      
      const subjectData = subjectMap[task.subject];
      subjectData.tasksTotal++;
      if (task.isCompleted) subjectData.tasksCompleted++;
      subjectData.totalProgress += task.progress;
      subjectData.studyHours += parseFloat(task.timeSpent || 0);
    });
    
    // Calculate averages
    const subjectPerformanceArray = Object.values(subjectMap).map(subject => {
      const avgProgress = Math.round(subject.totalProgress / subject.tasksTotal);
      
      return {
        subject: subject.subject,
        tasksTotal: subject.tasksTotal,
        tasksCompleted: subject.tasksCompleted,
        avgProgress,
        studyHours: Math.round(subject.studyHours * 10) / 10
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        subjectPerformance: subjectPerformanceArray
      }
    });
  } catch (error) {
    console.error('Get subject performance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching subject performance'
    });
  }
});

// @route   GET /api/analytics/weekly

router.get('/weekly', async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    
    const weeks = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekTasks = tasks.filter(t => {
        const completedDate = t.completedAt || t.updatedAt;
        return completedDate && completedDate >= weekStart && completedDate <= weekEnd;
      });
      
      const completedTasks = weekTasks.filter(t => t.isCompleted).length;
      const studyHours = weekTasks.reduce((sum, t) => sum + parseFloat(t.timeSpent || 0), 0);
      const totalTasksInWeek = weekTasks.length;
      const completionRate = totalTasksInWeek > 0 
        ? Math.round((completedTasks / totalTasksInWeek) * 100)
        : 0;
      
      weeks.push({
        week: `Week ${i + 1}`,
        tasksCompleted: completedTasks,
        studyHours: Math.round(studyHours * 10) / 10,
        completionRate
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        weeklyActivity: weeks
      }
    });
  } catch (error) {
    console.error('Get weekly activity error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching weekly activity'
    });
  }
});

// @route   GET /api/analytics/insights

router.get('/insights', async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    
    // Find most productive day
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCompletions = {};
    
    tasks.filter(t => t.completedAt).forEach(task => {
      const day = dayOfWeek[new Date(task.completedAt).getDay()];
      dayCompletions[day] = (dayCompletions[day] || 0) + 1;
    });
    
    let mostProductiveDay = 'N/A';
    if (Object.keys(dayCompletions).length > 0) {
      mostProductiveDay = Object.keys(dayCompletions).reduce((a, b) => dayCompletions[a] > dayCompletions[b] ? a : b);
    }
    
    // Find best subject
    const subjectScores = {};
    tasks.forEach(task => {
      if (!subjectScores[task.subject]) {
        subjectScores[task.subject] = { total: 0, count: 0 };
      }
      subjectScores[task.subject].total += task.progress;
      subjectScores[task.subject].count++;
    });
    
    let bestSubject = 'N/A';
    let bestScore = 0;
    Object.keys(subjectScores).forEach(subject => {
      const avg = subjectScores[subject].total / subjectScores[subject].count;
      if (avg > bestScore) {
        bestScore = avg;
        bestSubject = subject;
      }
    });
    
    // Calculate trend
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const recentTasks = tasks.filter(t => new Date(t.createdAt) >= monthAgo);
    
    const recentCompletionRate = recentTasks.length > 0
      ? Math.round((recentTasks.filter(t => t.isCompleted).length / recentTasks.length) * 100)
      : 0;
    
    const insights = [
      {
        title: 'Most Productive Day',
        value: mostProductiveDay,
        description: mostProductiveDay !== 'N/A' ? `You complete the most tasks on ${mostProductiveDay}s` : 'Complete more tasks to see insights',
        icon: 'Calendar',
        color: 'blue'
      },
      {
        title: 'Best Subject',
        value: bestSubject,
        description: bestSubject !== 'N/A' ? `${Math.round(bestScore)}% average progress` : 'Add tasks to see best subject',
        icon: 'Award',
        color: 'green'
      },
      {
        title: 'Study Pattern',
        value: 'Afternoon Peak',
        description: 'Most productive between 2-5 PM',
        icon: 'Clock',
        color: 'purple'
      },
      {
        title: 'Completion Trend',
        value: `${recentCompletionRate}%`,
        description: 'Current month completion rate',
        icon: 'TrendingUp',
        color: 'orange'
      }
    ];
    
    res.status(200).json({
      status: 'success',
      data: {
        insights
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching insights'
    });
  }
});


router.get('/report', async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    const user = await User.findByPk(req.user.id);
    
    // Get all analytics data
    const overview = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.isCompleted).length,
      completionRate: tasks.length > 0 
        ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100)
        : 0,
      totalStudyHours: Math.round(tasks.reduce((sum, t) => sum + parseFloat(t.timeSpent || 0), 0) * 10) / 10
    };
    
    // Subject breakdown
    const subjects = {};
    tasks.forEach(task => {
      if (!subjects[task.subject]) {
        subjects[task.subject] = { total: 0, completed: 0, hours: 0 };
      }
      subjects[task.subject].total++;
      if (task.isCompleted) subjects[task.subject].completed++;
      subjects[task.subject].hours += parseFloat(task.timeSpent || 0);
    });
    
    const subjectData = Object.entries(subjects).map(([name, data]) => ({
      name,
      total: data.total,
      completed: data.completed,
      completionRate: Math.round((data.completed / data.total) * 100),
      studyHours: Math.round(data.hours * 10) / 10
    }));
    
    const report = {
      generatedAt: new Date(),
      user: {
        name: user.name,
        email: user.email
      },
      overview,
      subjects: subjectData,
      recentTasks: tasks
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10)
        .map(t => ({
          title: t.title,
          subject: t.subject,
          progress: t.progress,
          status: t.status,
          dueDate: t.dueDate
        }))
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generating report'
    });
  }
});

module.exports = router;