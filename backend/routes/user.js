
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching profile'
    });
  }
});


router.put('/profile', async (req, res) => {
  try {
    const { name, subjects, academicInfo, preferences } = req.body;
    
    const user = await User.findByPk(req.user.id);
    
    const updateData = {};
    
    if (name) updateData.name = name;
    if (subjects) updateData.subjects = subjects;
    if (academicInfo) {
      updateData.academicInfo = {
        ...user.academicInfo,
        ...academicInfo
      };
    }
    if (preferences) {
      updateData.preferences = {
        ...user.preferences,
        ...preferences
      };
    }
    
    await user.update(updateData);
    
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile'
    });
  }
});


router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current and new password'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 8 characters'
      });
    }
    
    // Get user with password
    const user = await User.findByPk(req.user.id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    
    // Update password (will be hashed by beforeUpdate hook)
    await user.update({ password: newPassword });
    
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating password'
    });
  }
});


router.get('/statistics', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['statistics']
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        statistics: user.statistics
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching statistics'
    });
  }
});

module.exports = router;