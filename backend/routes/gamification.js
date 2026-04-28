
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const GamificationService = require('../services/gamificationService');
const User = require('../models/User');
const { sequelize } = require('../config/database');

// Get user gamification stats
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await GamificationService.getUserStats(req.user.id);
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching stats'
    });
  }
});

// Get XP history
router.get('/xp-history', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        history: user.xp_history || []
      }
    });
  } catch (error) {
    console.error('Error fetching XP history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching XP history'
    });
  }
});

// Award XP for study session 
router.post('/study-session', protect, async (req, res) => {
  try {
    const { durationHours } = req.body;
    const result = await GamificationService.awardStudySessionXP(req.user.id, durationHours);
    
    res.status(200).json({
      status: 'success',
      message: 'XP awarded for study session',
      data: result
    });
  } catch (error) {
    console.error('Error awarding study XP:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error awarding XP'
    });
  }
});

// Get user badges
router.get('/badges', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        badges: user.badges || []
      }
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching badges'
    });
  }
});

// Get all available achievements
router.get('/achievements', protect, async (req, res) => {
  try {
    const [achievements] = await sequelize.query('SELECT * FROM achievements');
    res.status(200).json({
      status: 'success',
      data: {
        achievements
      }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching achievements'
    });
  }
});

module.exports = router;