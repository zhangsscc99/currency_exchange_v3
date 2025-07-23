const { executeQuery } = require('../config/database');
const { logger } = require('../utils/logger');

class Currency {
  constructor(data) {
    this.currency_id = data.currency_id;
    this.currency_name = data.currency_name;
    this.currency_symbol = data.currency_symbol;
  }

  // 获取所有货币
  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, search = '' } = options;
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM currency';
      let countQuery = 'SELECT COUNT(*) as total FROM currency';
      let params = [];
      let countParams = [];

      // 添加搜索条件
      if (search) {
        const searchCondition = ' WHERE currency_name LIKE ? OR currency_symbol LIKE ?';
        query += searchCondition;
        countQuery += searchCondition;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam);
        countParams.push(searchParam, searchParam);
      }

      // 添加分页
      query += ' ORDER BY currency_id LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      // 执行查询
      const [currencies, countResult] = await Promise.all([
        executeQuery(query, params),
        executeQuery(countQuery, countParams)
      ]);

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        data: currencies.map(currency => new Currency(currency)),
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: total,
          total_pages: totalPages
        }
      };
    } catch (error) {
      logger.error('获取货币列表失败:', error.message);
      throw error;
    }
  }

  // 根据ID获取货币
  static async findById(id) {
    try {
      const query = 'SELECT * FROM currency WHERE currency_id = ?';
      const results = await executeQuery(query, [id]);
      
      if (results.length === 0) {
        return null;
      }
      
      return new Currency(results[0]);
    } catch (error) {
      logger.error(`获取货币失败 (ID: ${id}):`, error.message);
      throw error;
    }
  }

  // 根据名称获取货币
  static async findByName(name) {
    try {
      const query = 'SELECT * FROM currency WHERE currency_name = ?';
      const results = await executeQuery(query, [name]);
      
      if (results.length === 0) {
        return null;
      }
      
      return new Currency(results[0]);
    } catch (error) {
      logger.error(`获取货币失败 (名称: ${name}):`, error.message);
      throw error;
    }
  }

  // 根据符号获取货币
  static async findBySymbol(symbol) {
    try {
      const query = 'SELECT * FROM currency WHERE currency_symbol = ?';
      const results = await executeQuery(query, [symbol]);
      
      if (results.length === 0) {
        return null;
      }
      
      return new Currency(results[0]);
    } catch (error) {
      logger.error(`获取货币失败 (符号: ${symbol}):`, error.message);
      throw error;
    }
  }

  // 创建新货币
  static async create(currencyData) {
    try {
      const { currency_name, currency_symbol } = currencyData;
      
      const query = `
        INSERT INTO currency (currency_name, currency_symbol)
        VALUES (?, ?)
      `;
      
      const result = await executeQuery(query, [currency_name, currency_symbol]);
      
      // 返回新创建的货币
      return await Currency.findById(result.insertId);
    } catch (error) {
      logger.error('创建货币失败:', error.message);
      throw error;
    }
  }

  // 更新货币
  static async update(id, updateData) {
    try {
      const existingCurrency = await Currency.findById(id);
      if (!existingCurrency) {
        return null;
      }

      // 构建动态更新查询
      const updateFields = [];
      const updateValues = [];

      if (updateData.currency_name !== undefined) {
        updateFields.push('currency_name = ?');
        updateValues.push(updateData.currency_name);
      }

      if (updateData.currency_symbol !== undefined) {
        updateFields.push('currency_symbol = ?');
        updateValues.push(updateData.currency_symbol);
      }

      if (updateFields.length === 0) {
        // 没有需要更新的字段，返回原数据
        return existingCurrency;
      }

      updateValues.push(id);

      const query = `
        UPDATE currency 
        SET ${updateFields.join(', ')}
        WHERE currency_id = ?
      `;

      await executeQuery(query, updateValues);

      // 返回更新后的货币
      return await Currency.findById(id);
    } catch (error) {
      logger.error(`更新货币失败 (ID: ${id}):`, error.message);
      throw error;
    }
  }

  // 删除货币
  static async delete(id) {
    try {
      const existingCurrency = await Currency.findById(id);
      if (!existingCurrency) {
        return false;
      }

      const query = 'DELETE FROM currency WHERE currency_id = ?';
      await executeQuery(query, [id]);
      
      return true;
    } catch (error) {
      logger.error(`删除货币失败 (ID: ${id}):`, error.message);
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
        params.push(excludeId);
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
        params.push(excludeId);
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