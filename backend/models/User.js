
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name is required' },
      len: {
        args: [2, 50],
        msg: 'Name must be between 2 and 50 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      args: true,
      msg: 'Email already exists'
    },
    validate: {
      isEmail: { msg: 'Please enter a valid email' },
      notEmpty: { msg: 'Email is required' }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: {
        args: [8],
        msg: 'Password must be at least 8 characters'
      }
    }
  },
  profilePicture: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  },
  subjects: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  academicInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      institution: '',
      course: '',
      year: ''
    }
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      studyGoalHours: 25,
      notifications: true
    }
  },
  statistics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      totalTasksCreated: 0,
      totalTasksCompleted: 0,
      totalStudyHours: 0,
      currentStreak: 0,
      lastStudyDate: null
    }
  },
  xp_points: {
  type: DataTypes.INTEGER,
  defaultValue: 0
},
level: {
  type: DataTypes.INTEGER,
  defaultValue: 1
},
badges: {
  type: DataTypes.JSON,
  defaultValue: []
},
total_study_sessions: {
  type: DataTypes.INTEGER,
  defaultValue: 0
},
longest_streak: {
  type: DataTypes.INTEGER,
  defaultValue: 0
},
xp_history: {
  type: DataTypes.JSON,
  defaultValue: []
}
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;