
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Task title is required' },
      len: {
        args: [1, 200],
        msg: 'Title cannot exceed 200 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Description cannot exceed 1000 characters'
      }
    }
  },
  subject: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Subject is required' }
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Due date is required' },
      isDate: { msg: 'Please provide a valid date' }
    }
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Progress cannot be less than 0'
      },
      max: {
        args: [100],
        msg: 'Progress cannot exceed 100'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('not-started', 'in-progress', 'completed'),
    defaultValue: 'not-started',
    allowNull: false
  },
  estimatedTime: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
    comment: 'Estimated time in hours'
  },
  timeSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
    comment: 'Actual time spent in hours'
  },
  timeSessions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of time tracking sessions'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['userId', 'dueDate'] },
    { fields: ['userId', 'priority'] },
    { fields: ['userId', 'subject'] },
    { fields: ['userId', 'status'] }
  ],
  hooks: {
    beforeSave: async (task) => {
      
      if (task.progress === 0) {
        task.status = 'not-started';
      } else if (task.progress > 0 && task.progress < 100) {
        task.status = 'in-progress';
      } else if (task.progress === 100) {
        task.status = 'completed';
        task.isCompleted = true;
        if (!task.completedAt) {
          task.completedAt = new Date();
        }
      }
    }
  }
});

Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });


Task.prototype.isOverdue = function() {
  return !this.isCompleted && new Date() > new Date(this.dueDate);
};

Task.prototype.isDueSoon = function() {
  if (this.isCompleted) return false;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const timeDiff = dueDate - now;
  return timeDiff > 0 && timeDiff < 86400000; 
};
module.exports = Task;