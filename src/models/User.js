const { executeQuery } = require('../config/database');
const { logger } = require('../utils/logger');
const bcrypt = require('bcrypt'); // 确保已安装 bcrypt 模块

class User {
    constructor(user_id, user_name, user_pwd, user_email) {
        this.user_id = user_id;
        this.user_name = user_name;
        this.user_pwd = user_pwd;
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
        const { user_name, user_pwd, user_email } = userData;

        // 加密密码（建议使用 10 或 12 的 saltRounds）
        const saltRounds = 10;
        const user_pwd_hash = await bcrypt.hash(user_pwd, saltRounds);

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

        if (updateData.user_pwd !== undefined) {
          const saltRounds = 10;
          const user_pwd_hash = await bcrypt.hash(updateData.user_pwd, saltRounds);
          updateFields.push('user_pwd_hash = ?');
          updateValues.push(user_pwd_hash);
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

  // Get ONE user by exact name
  static async getUserByName(name) {
    const sql = 'SELECT * FROM users WHERE user_name = ? LIMIT 1';
    const results = await executeQuery(sql, [name]);
    return results[0]; // 只返回一个用户
}

    // Delete user by ID
    static async deleteUserById(userId) {
        const sql = 'DELETE FROM users WHERE user_id = ?';
        const result = await executeQuery(sql, [userId]);
        return result;
    }
}

module.exports = User;
