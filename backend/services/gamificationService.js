
const { sequelize } = require('../config/database');
const User = require('../models/User');
const Task = require('../models/Task');

class GamificationService {
  // XP reward constants
  static XP_REWARDS = {
    TASK_COMPLETE: 50,
    EARLY_COMPLETE_BONUS: 20,
    HIGH_PRIORITY_BONUS: 30,
    FIRST_TASK_OF_DAY: 25,
    STUDY_STREAK_7_DAYS: 100,
    STUDY_STREAK_14_DAYS: 200,
    STUDY_STREAK_30_DAYS: 500,
    PERFECT_PREDICTION: 50,
    TWO_HOURS_STUDY: 50
  };

  // Level thresholds (exponential growth)
  static getLevelXP(level) {
    if (level === 1) return 0;
    if (level === 2) return 100;
    if (level === 3) return 250;
    if (level === 4) return 450;
    if (level === 5) return 700;
    if (level === 6) return 1000;
    if (level === 7) return 1350;
    if (level === 8) return 1750;
    if (level === 9) return 2200;
    if (level === 10) return 2700;
    // For levels beyond 10: formula XP = 100 * (level^2)
    return 100 * Math.pow(level, 2);
  }

  // Calculate level from XP
  static calculateLevel(xp) {
    let level = 1;
    while (xp >= this.getLevelXP(level + 1)) {
      level++;
    }
    return level;
  }

  // Add XP to user
  static async addXP(userId, amount, reason) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return null;

      const oldXP = user.xp_points || 0;
      const oldLevel = user.level || 1;
      const newXP = oldXP + amount;
      const newLevel = this.calculateLevel(newXP);
      
      // Update user
      await user.update({
        xp_points: newXP,
        level: newLevel
      });

      // Update XP history
      const xpHistory = user.xp_history || [];
      xpHistory.push({
        amount,
        reason,
        timestamp: new Date(),
        newTotal: newXP
      });
      
      // Keep only last 100 entries
      if (xpHistory.length > 100) xpHistory.shift();
      await user.update({ xp_history: xpHistory });

      // Check for level up
      const leveledUp = newLevel > oldLevel;
      
      return {
        success: true,
        oldXP,
        newXP,
        oldLevel,
        newLevel,
        leveledUp,
        amount,
        reason
      };
    } catch (error) {
      console.error('Error adding XP:', error);
      return null;
    }
  }

  // Award XP for task completion
  static async awardTaskCompletionXP(userId, taskId) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) return null;

      let totalXP = this.XP_REWARDS.TASK_COMPLETE;
      const reasons = ['Task completed'];

      // Early completion bonus (if completed before due date)
      if (new Date(task.completedAt) < new Date(task.dueDate)) {
        totalXP += this.XP_REWARDS.EARLY_COMPLETE_BONUS;
        reasons.push('Early completion bonus');
      }

      // High priority bonus
      if (task.priority === 'high') {
        totalXP += this.XP_REWARDS.HIGH_PRIORITY_BONUS;
        reasons.push('High priority bonus');
      }

      // Check if it's first task of the day
      const today = new Date().toDateString();
      const xpHistory = (await User.findByPk(userId)).xp_history || [];
      const hasTodayXP = xpHistory.some(entry => 
        new Date(entry.timestamp).toDateString() === today
      );
      
      if (!hasTodayXP) {
        totalXP += this.XP_REWARDS.FIRST_TASK_OF_DAY;
        reasons.push('First task of the day');
      }

      // Award XP
      const result = await this.addXP(userId, totalXP, reasons.join(', '));
      
      // Check for study streak
      await this.checkStudyStreak(userId);
      
      return result;
    } catch (error) {
      console.error('Error awarding task XP:', error);
      return null;
    }
    const newBadges = await BadgeService.checkAndAwardBadges(userId);
if (newBadges && newBadges.length > 0) {
  result.newBadges = newBadges;
}
  }

  // Award XP for study session
  static async awardStudySessionXP(userId, durationHours) {
    try {
      let totalXP = 0;
      const reasons = [];

      // Award XP for studying (10 XP per hour)
      const studyXP = Math.floor(durationHours * 10);
      totalXP += studyXP;
      reasons.push(`${durationHours}h study session`);

      // Bonus for 2+ hours
      if (durationHours >= 2) {
        totalXP += this.XP_REWARDS.TWO_HOURS_STUDY;
        reasons.push('2+ hours study bonus');
      }

      // Update study sessions count
      const user = await User.findByPk(userId);
      await user.update({
        total_study_sessions: (user.total_study_sessions || 0) + 1
      });

      // Award XP
      return await this.addXP(userId, totalXP, reasons.join(', '));
    } catch (error) {
      console.error('Error awarding study XP:', error);
      return null;
    }
  }

  // Check and update study streak
  static async checkStudyStreak(userId) {
    try {
      const user = await User.findByPk(userId);
      const stats = user.statistics || {};
      const lastStudyDate = stats.lastStudyDate ? new Date(stats.lastStudyDate) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentStreak = stats.currentStreak || 0;
      let longestStreak = user.longest_streak || 0;

      if (lastStudyDate) {
        const lastDate = new Date(lastStudyDate);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
          stats.currentStreak = currentStreak;
          
          // Check for streak milestones
          if (currentStreak === 7) {
            await this.addXP(userId, this.XP_REWARDS.STUDY_STREAK_7_DAYS, '7-day study streak');
          } else if (currentStreak === 14) {
            await this.addXP(userId, this.XP_REWARDS.STUDY_STREAK_14_DAYS, '14-day study streak');
          } else if (currentStreak === 30) {
            await this.addXP(userId, this.XP_REWARDS.STUDY_STREAK_30_DAYS, '30-day study streak');
          }
        } else if (diffDays > 1) {
          currentStreak = 1;
          stats.currentStreak = 1;
        }
      } else {
        currentStreak = 1;
        stats.currentStreak = 1;
      }

      // Update longest streak
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        await user.update({ longest_streak: longestStreak });
      }

      // Update statistics
      stats.lastStudyDate = today;
      await user.update({ statistics: stats });

      return { currentStreak, longestStreak };
    } catch (error) {
      console.error('Error checking streak:', error);
      return null;
    }
  }

  // Get user gamification stats
  static async getUserStats(userId) {
    try {
      const user = await User.findByPk(userId);
      const nextLevelXP = this.getLevelXP((user.level || 1) + 1);
      const currentLevelXP = this.getLevelXP(user.level || 1);
      const xpNeeded = nextLevelXP - (user.xp_points || 0);
      const xpProgress = ((user.xp_points - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

      return {
        xp: user.xp_points || 0,
        level: user.level || 1,
        nextLevelXP,
        xpNeeded,
        xpProgress: Math.min(100, Math.max(0, xpProgress)),
        totalStudySessions: user.total_study_sessions || 0,
        longestStreak: user.longest_streak || 0,
        currentStreak: user.statistics?.currentStreak || 0,
        badges: user.badges || []
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }
}

module.exports = GamificationService;