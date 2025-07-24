const { executeQuery } = require('../config/database');
const { logger } = require('../utils/logger');

class Currency {
  constructor(data) {
    this.currency_id = data.currency_id;
    this.currency_name = data.currency_name;
    this.currency_symbol = data.currency_symbol;
  }

  // 获取所有货币 - 简化版本，不使用复杂的分页
  static async findAll() {
    try {
      const query = 'SELECT * FROM currency ORDER BY currency_id ASC';
      logger.info(`执行查询: ${query}`);
      
      const currencies = await executeQuery(query);
      logger.info(`成功获取 ${currencies.length} 条货币记录`);

      return currencies.map(currency => new Currency(currency));
    } catch (error) {
      logger.error('获取货币列表失败:', error.message);
      throw new Error(`获取货币列表失败: ${error.message}`);
    }
  }

  // 根据ID获取货币
  static async findById(id) {
    try {
      const query = 'SELECT * FROM currency WHERE currency_id = ?';
      logger.info(`执行查询: ${query}`, { id });
      
      const results = await executeQuery(query, [Number(id)]);
      
      if (results.length === 0) {
        logger.info(`货币不存在 - ID: ${id}`);
        return null;
      }
      
      logger.info(`成功获取货币 - ID: ${id}`);
      return new Currency(results[0]);
    } catch (error) {
      logger.error(`获取货币失败 (ID: ${id}):`, error.message);
      throw error;
    }
  }

  // 更新货币
  static async update(id, updateData) {
    try {
      const existingCurrency = await Currency.findById(id);
      if (!existingCurrency) {
        logger.warn(`尝试更新不存在的货币 - ID: ${id}`);
        return null;
      }

      // 构建动态更新查询
      const updateFields = [];
      const updateValues = [];

      if (updateData.currency_name !== undefined && updateData.currency_name !== null) {
        updateFields.push('currency_name = ?');
        updateValues.push(updateData.currency_name);
      }

      if (updateData.currency_symbol !== undefined && updateData.currency_symbol !== null) {
        updateFields.push('currency_symbol = ?');
        updateValues.push(updateData.currency_symbol);
      }

      if (updateFields.length === 0) {
        logger.info(`没有字段需要更新 - ID: ${id}`);
        return existingCurrency;
      }

      updateValues.push(Number(id));

      const query = `
        UPDATE currency 
        SET ${updateFields.join(', ')}
        WHERE currency_id = ?
      `;

      logger.info(`更新货币 - ID: ${id}`, { updateData });
      logger.info(`更新查询: ${query}`);
      logger.info(`更新参数: ${JSON.stringify(updateValues)}`);
      
      await executeQuery(query, updateValues);

      // 返回更新后的货币
      return await Currency.findById(id);
    } catch (error) {
      logger.error(`更新货币失败 (ID: ${id}):`, error.message);
      throw error;
    }
  }

  // 检查货币名称是否存在（排除指定ID）
  static async isNameExists(name, excludeId = null) {
    try {
      let query = 'SELECT currency_id FROM currency WHERE currency_name = ?';
      let params = [name];

      if (excludeId) {
        query += ' AND currency_id != ?';
        params.push(Number(excludeId));
      }

      const results = await executeQuery(query, params);
      return results.length > 0;
    } catch (error) {
      logger.error('检查货币名称失败:', error.message);
      throw error;
    }
  }

  // 检查货币符号是否存在（排除指定ID）
  static async isSymbolExists(symbol, excludeId = null) {
    try {
      let query = 'SELECT currency_id FROM currency WHERE currency_symbol = ?';
      let params = [symbol];

      if (excludeId) {
        query += ' AND currency_id != ?';
        params.push(Number(excludeId));
      }

      const results = await executeQuery(query, params);
      return results.length > 0;
    } catch (error) {
      logger.error('检查货币符号失败:', error.message);
      throw error;
    }
  }

  // 转换为JSON对象
  toJSON() {
    return {
      id: this.currency_id,
      name: this.currency_name,
      symbol: this.currency_symbol
    };
  }
}

module.exports = Currency; 