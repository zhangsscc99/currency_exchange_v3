const Currency = require('../models/Currency');
const { logger } = require('../utils/logger');

class CurrencyService {
  // 获取所有货币（带分页和搜索）
  static async getAllCurrencies(options = {}) {
    try {
      logger.info(`获取货币列表 - 参数: ${JSON.stringify(options)}`);
      const result = await Currency.findAll(options);
      logger.info(`成功获取 ${result.data.length} 条货币记录`);
      return result;
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

  // 创建新货币
  static async createCurrency(currencyData) {
    try {
      logger.info(`创建新货币 - 数据: ${JSON.stringify(currencyData)}`);
      
      // 检查名称和符号是否已存在
      const [nameExists, symbolExists] = await Promise.all([
        Currency.isNameExists(currencyData.currency_name),
        Currency.isSymbolExists(currencyData.currency_symbol)
      ]);

      if (nameExists) {
        logger.warn(`货币名称已存在: ${currencyData.currency_name}`);
        throw new Error('货币名称已存在');
      }

      if (symbolExists) {
        logger.warn(`货币符号已存在: ${currencyData.currency_symbol}`);
        throw new Error('货币符号已存在');
      }

      const newCurrency = await Currency.create(currencyData);
      logger.info(`成功创建货币 - ID: ${newCurrency.currency_id}, 名称: ${newCurrency.currency_name}`);
      return newCurrency;
    } catch (error) {
      logger.error('创建货币失败:', error.message);
      throw error;
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

      // 检查更新的名称是否与其他货币冲突
      if (updateData.currency_name) {
        const nameExists = await Currency.isNameExists(updateData.currency_name, id);
        if (nameExists) {
          logger.warn(`货币名称已存在: ${updateData.currency_name}`);
          throw new Error('货币名称已存在');
        }
      }

      // 检查更新的符号是否与其他货币冲突
      if (updateData.currency_symbol) {
        const symbolExists = await Currency.isSymbolExists(updateData.currency_symbol, id);
        if (symbolExists) {
          logger.warn(`货币符号已存在: ${updateData.currency_symbol}`);
          throw new Error('货币符号已存在');
        }
      }

      const updatedCurrency = await Currency.update(id, updateData);
      logger.info(`成功更新货币 - ID: ${id}, 名称: ${updatedCurrency.currency_name}`);
      return updatedCurrency;
    } catch (error) {
      logger.error(`更新货币失败 - ID: ${id}:`, error.message);
      throw error;
    }
  }

  // 删除货币
  static async deleteCurrency(id) {
    try {
      logger.info(`删除货币 - ID: ${id}`);
      
      // 检查货币是否存在
      const existingCurrency = await Currency.findById(id);
      if (!existingCurrency) {
        logger.warn(`货币不存在 - ID: ${id}`);
        return false;
      }

      const success = await Currency.delete(id);
      if (success) {
        logger.info(`成功删除货币 - ID: ${id}, 名称: ${existingCurrency.currency_name}`);
      }
      return success;
    } catch (error) {
      logger.error(`删除货币失败 - ID: ${id}:`, error.message);
      throw new Error('删除货币失败');
    }
  }

  // 检查货币名称是否可用
  static async checkNameAvailability(name, excludeId = null) {
    try {
      const exists = await Currency.isNameExists(name, excludeId);
      return !exists;
    } catch (error) {
      logger.error('检查货币名称可用性失败:', error.message);
      throw new Error('检查货币名称可用性失败');
    }
  }

  // 检查货币符号是否可用
  static async checkSymbolAvailability(symbol, excludeId = null) {
    try {
      const exists = await Currency.isSymbolExists(symbol, excludeId);
      return !exists;
    } catch (error) {
      logger.error('检查货币符号可用性失败:', error.message);
      throw new Error('检查货币符号可用性失败');
    }
  }

  // 搜索货币
  static async searchCurrencies(searchTerm, options = {}) {
    try {
      logger.info(`搜索货币 - 关键词: ${searchTerm}`);
      const result = await Currency.findAll({
        ...options,
        search: searchTerm
      });
      logger.info(`搜索到 ${result.data.length} 条货币记录`);
      return result;
    } catch (error) {
      logger.error('搜索货币失败:', error.message);
      throw new Error('搜索货币失败');
    }
  }
}

module.exports = CurrencyService; 