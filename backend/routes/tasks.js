
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const GamificationService = require('../services/gamificationService');
const BadgeService = require('../services/badgeService');

// Apply auth middleware to all routes
router.use(protect);

//    Get all tasks for logged-in user

router.get('/', async (req, res) => {
  try {
    const { subject, priority, status, search, sortBy } = req.query;
    
    // Build query
    const where = { userId: req.user.id };
    
    // Apply filters
    if (subject && subject !== 'all') {
      where.subject = subject;
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Determine sort order
    let order = [];
    switch (sortBy) {
      case 'dueDate':
        order = [['dueDate', 'ASC']];
        break;
      case 'priority':
        order = [['priority', 'DESC'], ['dueDate', 'ASC']];
        break;
      case 'progress':
        order = [['progress', 'DESC']];
        break;
      default:
        order = [['createdAt', 'DESC']];
    }
    
    const tasks = await Task.findAll({
      where,
      order
    });
    
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching tasks'
    });
  }
});


//    Get single task

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    // Check if task belongs to user
    if (task.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this task'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching task'
    });
  }
});

//    Create new task

router.post('/', async (req, res) => {
  try {
    const { title, description, subject, priority, dueDate, estimatedTime, timeSpent, progress } = req.body;
    
    // Validation
    if (!title || !subject || !dueDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide title, subject, and due date'
      });
    }
    
    // Create task
    const task = await Task.create({
      userId: req.user.id,
      title,
      description,
      subject,
      priority: priority || 'medium',
      dueDate,
      estimatedTime: estimatedTime || 0,
      timeSpent: timeSpent || 0,
      progress: progress || 0,
      isCompleted: progress === 100 || false
    });
    
    // Update user statistics
    const user = await User.findByPk(req.user.id);
    const stats = user.statistics || {};
    stats.totalTasksCreated = (stats.totalTasksCreated || 0) + 1;
    await user.update({ statistics: stats });
    
    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.errors[0].message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error creating task'
    });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    // Check if task belongs to user
    if (task.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this task'
      });
    }
    
    // Track old completion status
    const wasIncomplete = !task.isCompleted;
    const oldTimeSpent = parseFloat(task.timeSpent) || 0;
    
    // Prepare update data
    const updateData = { ...req.body };
    
    // If progress is 100, mark as completed
    if (updateData.progress === 100 || updateData.isCompleted === true) {
      updateData.isCompleted = true;
      updateData.status = 'completed';
      if (!task.completedAt) {
        updateData.completedAt = new Date();
      }
    } 
    else if (updateData.progress !== undefined && updateData.progress < 100) {
      updateData.isCompleted = false;
      updateData.status = updateData.progress > 0 ? 'in-progress' : 'not-started';
    }
    
    // Update the task
    await task.update(updateData);
    await task.reload();
    
    // Handle statistics and badges for completed tasks
    if (wasIncomplete && task.isCompleted) {
      const user = await User.findByPk(req.user.id);
      let stats = user.statistics || {};
      
      const currentTotalStudyHours = parseFloat(stats.totalStudyHours) || 0;
      const currentTimeSpent = parseFloat(task.timeSpent) || 0;
      const currentCompletedTasks = parseInt(stats.totalTasksCompleted) || 0;
      
      stats.totalTasksCompleted = currentCompletedTasks + 1;
      stats.totalStudyHours = currentTotalStudyHours + currentTimeSpent;
      stats.lastStudyDate = new Date();
      
      await user.update({ statistics: stats });
      
      // Award XP
      await GamificationService.awardTaskCompletionXP(req.user.id, task.id);
      
      // AWARD BADGES AUTOMATICALLY
      const BadgeService = require('../services/badgeService');
      const newBadges = await BadgeService.checkAndAwardBadges(req.user.id);
      
      if (newBadges && newBadges.length > 0) {
        console.log(`🎉 User ${req.user.id} earned ${newBadges.length} new badge(s)!`);
      }
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating task'
    });
  }
});


// @desc    Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    // Check if task belongs to user
    if (task.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this task'
      });
    }
    
    // If task was completed, subtract its timeSpent from user statistics
    if (task.isCompleted) {
      const user = await User.findByPk(req.user.id);
      let stats = user.statistics || {};
      const timeSpentToRemove = parseFloat(task.timeSpent) || 0;
      stats.totalTasksCompleted = Math.max(0, (stats.totalTasksCompleted || 0) - 1);
      stats.totalStudyHours = Math.max(0, (parseFloat(stats.totalStudyHours) || 0) - timeSpentToRemove);
      await user.update({ statistics: stats });
      
      console.log(`🗑️ Task deleted! Removed ${timeSpentToRemove}h from study hours. Total: ${stats.totalStudyHours}h`);
    }
    
    await task.destroy();
    
    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting task'
    });
  }
});


//    Add time tracking session

router.post('/:id/time-session', async (req, res) => {
  try {
    const { duration } = req.body; // duration in minutes
    
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    if (task.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }
    
    // Get current sessions
    const sessions = task.timeSessions || [];
    
    // Add new session
    sessions.push({
      startTime: new Date(Date.now() - duration * 60000),
      endTime: new Date(),
      duration
    });
    
    // Update total time spent (convert minutes to hours)
    const newTimeSpent = parseFloat(task.timeSpent) + (duration / 60);
    
    await task.update({
      timeSessions: sessions,
      timeSpent: newTimeSpent
    });
    
    // If task is completed, update user statistics
    if (task.isCompleted) {
      const user = await User.findByPk(req.user.id);
      let stats = user.statistics || {};
      stats.totalStudyHours = (parseFloat(stats.totalStudyHours) || 0) + (duration / 60);
      await user.update({ statistics: stats });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Time session added',
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Add time session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding time session'
    });
  }
});


//   Get task statistics summary

router.get('/stats/summary', async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    
    const summary = {
      total: tasks.length,
      completed: tasks.filter(t => t.isCompleted).length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      notStarted: tasks.filter(t => t.status === 'not-started').length,
      overdue: tasks.filter(t => t.isOverdue && t.isOverdue()).length,
      dueSoon: tasks.filter(t => t.isDueSoon && t.isDueSoon()).length,
      byPriority: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
      }
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        summary
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching summary'
    });
  }
});

module.exports = router;