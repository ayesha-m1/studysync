// backend/scripts/migration.js
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

async function columnExists(tableName, columnName) {
  const [result] = await sequelize.query(
    `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = ? 
     AND COLUMN_NAME = ?`,
    {
      replacements: [tableName, columnName],
      type: QueryTypes.SELECT
    }
  );
  return result.count > 0;
}

async function tableExists(tableName) {
  const [result] = await sequelize.query(
    `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = ?`,
    {
      replacements: [tableName],
      type: QueryTypes.SELECT
    }
  );
  return result.count > 0;
}

async function runMigration() {
  try {
    console.log('Starting migration...');

    // 1. Add new columns to users table (checking existence first)
    console.log('Checking users table columns...');
    
    if (!await columnExists('users', 'xp_points')) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN xp_points INT DEFAULT 0`);
      console.log('✓ Added xp_points column');
    }
    
    if (!await columnExists('users', 'level')) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN level INT DEFAULT 1`);
      console.log('✓ Added level column');
    }
    
    // Fix for JSON columns - remove DEFAULT value
    if (!await columnExists('users', 'badges')) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN badges JSON`);
      console.log('✓ Added badges column (no default value)');
    }
    
    if (!await columnExists('users', 'total_study_sessions')) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN total_study_sessions INT DEFAULT 0`);
      console.log('✓ Added total_study_sessions column');
    }
    
    if (!await columnExists('users', 'longest_streak')) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN longest_streak INT DEFAULT 0`);
      console.log('✓ Added longest_streak column');
    }
    
    if (!await columnExists('users', 'xp_history')) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN xp_history JSON`);
      console.log('✓ Added xp_history column (no default value)');
    }

    // 2. Create task_analytics table
    if (!await tableExists('task_analytics')) {
      await sequelize.query(`
        CREATE TABLE task_analytics (
          id INT PRIMARY KEY AUTO_INCREMENT,
          task_id INT NOT NULL,
          user_id INT NOT NULL,
          predicted_duration DECIMAL(10,2) DEFAULT 0,
          actual_duration DECIMAL(10,2) DEFAULT 0,
          difficulty_score INT DEFAULT 0,
          focus_score INT DEFAULT 0,
          completed_at TIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_task_user (task_id, user_id)
        )
      `);
      console.log('✓ Created task_analytics table');
    } else {
      console.log('ℹ task_analytics table already exists');
    }

    // 3. Create study_sessions table
    if (!await tableExists('study_sessions')) {
      await sequelize.query(`
        CREATE TABLE study_sessions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          task_id INT,
          start_time DATETIME NOT NULL,
          end_time DATETIME,
          duration DECIMAL(10,2) DEFAULT 0,
          session_type ENUM('pomodoro', 'regular', 'focus') DEFAULT 'regular',
          breaks_taken INT DEFAULT 0,
          productivity_score INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
          INDEX idx_user_sessions (user_id, start_time)
        )
      `);
      console.log('✓ Created study_sessions table');
    } else {
      console.log('ℹ study_sessions table already exists');
    }

    // 4. Create notes table
    if (!await tableExists('notes')) {
      await sequelize.query(`
        CREATE TABLE notes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          task_id INT,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          attachments JSON,
          is_pinned BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          INDEX idx_user_notes (user_id),
          INDEX idx_task_notes (task_id)
        )
      `);
      console.log('✓ Created notes table');
    } else {
      console.log('ℹ notes table already exists');
    }

    // 5. Create achievements table
    if (!await tableExists('achievements')) {
      await sequelize.query(`
        CREATE TABLE achievements (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          badge_icon VARCHAR(255),
          required_criteria JSON,
          xp_reward INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✓ Created achievements table');
      
      // Insert default achievements (using INSERT IGNORE to avoid duplicates)
      await sequelize.query(`
        INSERT IGNORE INTO achievements (name, description, badge_icon, required_criteria, xp_reward) VALUES
        ('Early Bird', 'Complete 10 tasks before 9 AM', '', '{"type": "early_bird", "count": 10}', 100),
        ('Night Owl', 'Complete 10 tasks after 10 PM', '', '{"type": "night_owl", "count": 10}', 100),
        ('Marathon', 'Maintain a 30-day study streak', '', '{"type": "streak", "days": 30}', 500),
        ('Subject Master', 'Complete 10 tasks in one subject', '', '{"type": "subject_master", "count": 10}', 150),
        ('Speed Demon', 'Complete 5 tasks before estimated time', '', '{"type": "speed_demon", "count": 5}', 200),
        ('Perfect Week', 'Complete all tasks in a week', '', '{"type": "perfect_week", "count": 1}', 300),
        ('Dedicated', 'Study every day for 14 days', '', '{"type": "dedicated", "days": 14}', 250),
        ('Focus Master', 'Complete 10 Pomodoro sessions', '', '{"type": "focus_master", "count": 10}', 150)
      `);
      console.log('✓ Inserted default achievements');
    } else {
      console.log('ℹ achievements table already exists');
    }

    // 6. Create user_badges table
    if (!await tableExists('user_badges')) {
      await sequelize.query(`
        CREATE TABLE user_badges (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          badge_id INT NOT NULL,
          earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          displayed BOOLEAN DEFAULT TRUE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (badge_id) REFERENCES achievements(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_badge (user_id, badge_id),
          INDEX idx_user_badges (user_id)
        )
      `);
      console.log('✓ Created user_badges table');
    } else {
      console.log('ℹ user_badges table already exists');
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await sequelize.close();
  }
}

runMigration();