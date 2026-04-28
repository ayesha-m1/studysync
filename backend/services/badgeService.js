// backend/services/badgeService.js
const { sequelize } = require('../config/database');
const User = require('../models/User');
const Task = require('../models/Task');
const GamificationService = require('./gamificationService');

class BadgeService {
  static async checkAndAwardBadges(userId) {
    try {
      console.log(`Checking badges for user ${userId}...`);
      
      const user = await User.findByPk(userId);
      if (!user) {
        console.log('User not found');
        return [];
      }
      
      const tasks = await Task.findAll({ 
        where: { userId, isCompleted: true }
      });
      
      const currentBadges = user.badges || [];
      const newBadges = [];

      const [achievements] = await sequelize.query(
        'SELECT * FROM achievements'
      );

      for (const achievement of achievements) {
        if (currentBadges.some(b => b.id === achievement.id)) continue;

        let earned = false;
        let criteria = {};
        
        try {
          criteria = typeof achievement.required_criteria === 'string' 
            ? JSON.parse(achievement.required_criteria) 
            : achievement.required_criteria;
        } catch (e) {
          console.error(`Error parsing criteria for ${achievement.name}:`, e);
          continue;
        }

        switch (criteria.type) {
          case 'early_bird':
            earned = await this.checkEarlyBird(userId, criteria.count);
            break;
          case 'night_owl':
            earned = await this.checkNightOwl(userId, criteria.count);
            break;
          case 'streak':
            earned = await this.checkStreak(user, criteria.days);
            break;
          case 'subject_master':
            earned = await this.checkSubjectMaster(tasks, criteria.count);
            break;
          case 'speed_demon':
            earned = await this.checkSpeedDemon(tasks, criteria.count);
            break;
          case 'perfect_week':
            earned = await this.checkPerfectWeek(tasks);
            break;
          case 'dedicated':
            earned = await this.checkDedicated(user, criteria.days);
            break;
          case 'focus_master':
            earned = await this.checkFocusMaster(user, criteria.count);
            break;
        }

        if (earned) {
          console.log(`🎉 User ${userId} earned badge: ${achievement.name}`);
          
          newBadges.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            badge_icon: achievement.badge_icon,
            earned_at: new Date()
          });
          
          await GamificationService.addXP(userId, achievement.xp_reward, `Earned badge: ${achievement.name}`);
        }
      }

      if (newBadges.length > 0) {
        const updatedBadges = [...currentBadges, ...newBadges];
        await user.update({ badges: updatedBadges });
        
        for (const badge of newBadges) {
          // FIXED: Use user_id (snake_case) instead of userId
          await sequelize.query(
            'INSERT IGNORE INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, ?)',
            { replacements: [userId, badge.id, new Date()] }
          );
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  static async checkEarlyBird(userId, requiredCount) {
    const [results] = await sequelize.query(
      `SELECT COUNT(*) as count FROM tasks 
       WHERE userId = ? AND isCompleted = 1 
       AND HOUR(completedAt) < 9`,
      { replacements: [userId] }
    );
    const count = results[0].count;
    console.log(`Early Bird progress: ${count}/${requiredCount}`);
    return count >= requiredCount;
  }

  static async checkNightOwl(userId, requiredCount) {
    const [results] = await sequelize.query(
      `SELECT COUNT(*) as count FROM tasks 
       WHERE userId = ? AND isCompleted = 1 
       AND HOUR(completedAt) >= 22`,
      { replacements: [userId] }
    );
    const count = results[0].count;
    console.log(`Night Owl progress: ${count}/${requiredCount}`);
    return count >= requiredCount;
  }

  static async checkStreak(user, requiredDays) {
    const stats = user.statistics || {};
    const currentStreak = stats.currentStreak || 0;
    console.log(`Streak progress: ${currentStreak}/${requiredDays} days`);
    return currentStreak >= requiredDays;
  }

  static async checkSubjectMaster(tasks, requiredCount) {
    const subjectCounts = {};
    tasks.forEach(task => {
      subjectCounts[task.subject] = (subjectCounts[task.subject] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(subjectCounts), 0);
    console.log(`Subject Master progress: ${maxCount}/${requiredCount} tasks in one subject`);
    console.log('Subject counts:', subjectCounts);
    return maxCount >= requiredCount;
  }

  static async checkSpeedDemon(tasks, requiredCount) {
    let earlyCount = 0;
    for (const task of tasks) {
      if (task.completedAt && new Date(task.completedAt) < new Date(task.dueDate)) {
        earlyCount++;
      }
    }
    console.log(`Speed Demon progress: ${earlyCount}/${requiredCount} early completions`);
    return earlyCount >= requiredCount;
  }

  static async checkPerfectWeek(tasks) {
    const weekCompletions = {};
    tasks.forEach(task => {
      if (task.completedAt) {
        const weekNum = `${new Date(task.completedAt).getFullYear()}-${Math.floor(new Date(task.completedAt).getDate() / 7)}`;
        weekCompletions[weekNum] = (weekCompletions[weekNum] || 0) + 1;
      }
    });
    const hasPerfectWeek = Object.values(weekCompletions).some(count => count >= 5);
    console.log(`Perfect Week: ${hasPerfectWeek ? 'Earned' : 'Not yet'}`);
    return hasPerfectWeek;
  }

  static async checkDedicated(user, requiredDays) {
    const stats = user.statistics || {};
    const currentStreak = stats.currentStreak || 0;
    console.log(`Dedicated progress: ${currentStreak}/${requiredDays} days`);
    return currentStreak >= requiredDays;
  }

  static async checkFocusMaster(user, requiredCount) {
    const sessions = user.total_study_sessions || 0;
    console.log(`Focus Master progress: ${sessions}/${requiredCount} sessions`);
    return sessions >= requiredCount;
  }
}

module.exports = BadgeService;