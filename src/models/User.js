const { executeQuery } = require('../config/database');
const { logger } = require('../utils/logger');

class User {
    constructor(user_id, user_name, user_pwd_hash, user_email) {
        this.user_id = user_id;
        this.user_name = user_name;
        this.user_pwd_hash = user_pwd_hash;
        this.user_email = user_email;
    }

    static async findById(id) {
        try {
          const query = 'SELECT * FROM users WHERE user_id = ?';
          const results = await executeQuery(query, [id]);
          
          if (results.length === 0) {
            return null;
          }
          
          return new User(results[0]);
        } catch (error) {
          logger.error(`获取user失败 (ID: ${id}):`, error.message);
          throw error;
        }
      }
    // 检查用户名是否存在
    static async isNameExists(user_name) {
        try {
            const query = 'SELECT COUNT(*) AS count FROM users WHERE user_name = ?';
            const result = await executeQuery(query, [user_name]);
            return result[0].count > 0;
        } catch (error) {
            logger.error(`检查用户名是否存在失败: ${error.message}`);
            throw error;
        }
    }
    // 检查邮箱是否存在
    static async isEmailExists(user_email) {
        try {
            const query = 'SELECT COUNT(*) AS count FROM users WHERE user_email = ?';
            const result = await executeQuery(query, [user_email]);
            return result[0].count > 0;
        } catch (error) {
            logger.error(`检查邮箱是否存在失败: ${error.message}`);
            throw error;
        }
    }
    // 创建新user
  static async create(userData) {
    try {
      const { user_name, user_pwd_hash, user_email} = userData;
      
      const query = `
        INSERT INTO users (user_name, user_pwd_hash, user_email)
        VALUES (?, ?, ?)
      `;
      
      const result = await executeQuery(query, [user_name, user_pwd_hash, user_email]);
      
      // 返回新创建的user
      return await User.findById(result.insertId);
    } catch (error) {
      logger.error('创建user失败:', error.message);
      throw error;
    }
  }

  // 更新user
  static async update(id, updateData) {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return null;
      }

      // 构建动态更新查询
      const updateFields = [];
      const updateValues = [];

      if (updateData.user_name !== undefined) {
        updateFields.push('user_name = ?');
        updateValues.push(updateData.user_name);
      }

      if (updateData.user_pwd_hash !== undefined) {
        updateFields.push('user_pwd_hash = ?');
        updateValues.push(updateData.user_pwd_hash);
      }

      if (updateData.user_email !== undefined) {
        updateFields.push('user_email = ?');
        updateValues.push(updateData.user_email);
      }

      if (updateFields.length === 0) {
        // 没有需要更新的字段，返回原数据
        return existingUser;
      }

      updateValues.push(id);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE user_id = ?
      `;

      await executeQuery(query, updateValues);

      // 返回更新后的user
      return await User.findById(id);
    } catch (error) {
      logger.error(`更新user失败 (ID: ${id}):`, error.message);
      throw error;
    }
  }
}

module.exports = User;