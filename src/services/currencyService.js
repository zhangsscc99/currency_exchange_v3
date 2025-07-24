const Currency = require('../models/Currency');
const { logger } = require('../utils/logger');

class CurrencyService {
  // 创建新货币
  static async createCurrency(currencyData) {
    try {
      logger.info(`创建新货币: ${JSON.stringify(currencyData)}`);
      
      // 检查货币名称是否已存在（保留名称唯一性）
      const nameExists = await Currency.isNameExists(currencyData.currency_name);
      if (nameExists) {
        logger.warn(`货币名称已存在: ${currencyData.currency_name}`);
        throw new Error('货币名称已存在');
      }

      // 移除货币符号重复性检查 - 允许多个货币使用相同符号（如人民币和日元都用￥）
      logger.info(`允许货币符号重复: ${currencyData.currency_symbol}`);

      const newCurrency = await Currency.create(currencyData);
      logger.info(`成功创建货币 - ID: ${newCurrency.currency_id}, 名称: ${newCurrency.currency_name}, 符号: ${newCurrency.currency_symbol}`);
      return newCurrency;
    } catch (error) {
      logger.error('创建货币失败:', error.message);
      throw error;
    }
  }

  // 获取所有货币
  static async getAllCurrencies() {
    try {
      logger.info('获取所有货币列表');
      const currencies = await Currency.findAll();
      logger.info(`成功获取 ${currencies.length} 条货币记录`);
      return currencies;
    } catch (error) {
      logger.error('获取货币列表失败:', error.message);
      throw new Error('获取货币列表失败');
    }
  }

  // 根据ID获取货币
  static async getCurrencyById(id) {
    try {
      logger.info(`获取货币详情 - ID: ${id}`);
      const currency = await Currency.findById(id);
      
      if (!currency) {
        logger.warn(`货币不存在 - ID: ${id}`);
        return null;
      }
      
      logger.info(`成功获取货币详情 - ID: ${id}, 名称: ${currency.currency_name}`);
      return currency;
    } catch (error) {
      logger.error(`获取货币详情失败 - ID: ${id}:`, error.message);
      throw new Error('获取货币详情失败');
    }
  }

  // 更新货币
  static async updateCurrency(id, updateData) {
    try {
      logger.info(`更新货币 - ID: ${id}, 数据: ${JSON.stringify(updateData)}`);
      
      // 检查货币是否存在
      const existingCurrency = await Currency.findById(id);
      if (!existingCurrency) {
        logger.warn(`货币不存在 - ID: ${id}`);
        return null;
      }

      // 检查更新的名称是否与其他货币冲突（保留名称唯一性）
      if (updateData.currency_name) {
        const nameExists = await Currency.isNameExists(updateData.currency_name, id);
        if (nameExists) {
          logger.warn(`货币名称已存在: ${updateData.currency_name}`);
          throw new Error('货币名称已存在');
        }
      }

      // 移除货币符号重复性检查 - 允许多个货币使用相同符号
      if (updateData.currency_symbol) {
        logger.info(`允许更新货币符号: ${updateData.currency_symbol} (可重复)`);
      }

      const updatedCurrency = await Currency.update(id, updateData);
      logger.info(`成功更新货币 - ID: ${id}, 名称: ${updatedCurrency.currency_name}`);
      return updatedCurrency;
    } catch (error) {
      logger.error(`更新货币失败 - ID: ${id}:`, error.message);
      throw error;
    }
  }
}

module.exports = CurrencyService; 