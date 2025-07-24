const { mountpath } = require('../app');
const User = require('../models/User');
const { logger } = require('../utils/logger');


class UserService {
  // 根据ID获取用户
  static async getUserById(id) {
    try {
      logger.info(`获取用户详情 - ID: ${id}`);
      const user = await User.findById(id);
      if (!user) {         
        logger.warn(`用户不存在 - ID: ${id}`);
        return null;
      } 
        logger.info(`成功获取用户详情 - ID: ${id}, 名称: ${user.user_name}`);       
        return user;
    } catch (error) {
      logger.error(`获取用户详情失败 - ID: ${id}:`, error.message);
      throw new Error('获取用户详情失败');  
    }
  } 
    // 创建新用户   
    static async createUser(userData) {
      try {
        logger.info(`创建新用户 - 数据: ${JSON.stringify(userData)}`);
        
        // 检查用户名和邮箱是否已存在
        const [nameExists, emailExists] = await Promise.all([
          User.isNameExists(userData.user_name),
          User.isEmailExists(userData.user_email)
        ]);

        if (nameExists) {
          logger.warn(`用户名已存在: ${userData.user_name}`);
          throw new Error('用户名已存在');
        }

        if (emailExists) {
          logger.warn(`邮箱已存在: ${userData.user_email}`);
          throw new Error('邮箱已存在');
        }

        const newUser = await User.create(userData);
        logger.info(`成功创建用户 - ID: ${newUser.user_id}, 名称: ${newUser.user_name}`);
        return newUser;
      } catch (error) {
        logger.error('创建用户失败:', error.message);
        throw new Error('创建用户失败');
      }
    }
    // 更新用户信息
    static async updateUser(id, updateData) {
      try {
        logger.info(`更新用户信息 - ID: ${id}, 数据: ${JSON.stringify(updateData)}`);
        const updatedUser = await User.update(id, updateData);
        
        if (!updatedUser) {
          logger.warn(`用户不存在或未更新 - ID: ${id}`);
          return null;
        }
        
        logger.info(`成功更新用户信息 - ID: ${id}, 名称: ${updatedUser.user_name}`);
        return updatedUser;
      } catch (error) {
        logger.error(`更新用户信息失败 - ID: ${id}:`, error.message);
        throw new Error('更新用户信息失败');
      }
    }

    static async getUserByName(name){
      const user = await User.getUserByName(name);
      if (!user) {
          throw new Error('User not found');
      }
      return user;
    }

    static async deleteUser(userId)  {
      const result = await User.deleteUserById(userId);
      if (result.affectedRows === 0) {
          throw new Error('User not found');
      }
      return result;
    }
}

module.exports = UserService;