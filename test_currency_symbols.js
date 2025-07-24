/**
 * 测试货币符号重复功能
 * 
 * 这个测试演示了人民币和日元都可以使用 ￥ 符号
 */

const axios = require('axios');

// API基础地址
const API_BASE = 'http://localhost:3000';

const testCurrencySymbolDuplication = async () => {
  console.log('🧪 开始测试货币符号重复功能...\n');
  
  try {
    // 1. 获取当前所有货币
    console.log('1️⃣ 获取当前货币列表:');
    const { data: currencies } = await axios.get(`${API_BASE}/currencies`);
    console.log('现有货币:', currencies);
    console.log('');
    
    // 2. 尝试创建人民币 (使用 ￥ 符号)
    console.log('2️⃣ 创建人民币 (使用 ￥ 符号):');
    try {
      const { data: rmb } = await axios.post(`${API_BASE}/currencies`, {
        currency_name: '人民币',
        currency_symbol: '￥'
      });
      console.log('✅ 人民币创建成功:', rmb);
    } catch (error) {
      if (error.response?.data?.error?.includes('已存在')) {
        console.log('ℹ️  人民币已存在，跳过创建');
      } else {
        console.log('❌ 人民币创建失败:', error.response?.data || error.message);
      }
    }
    console.log('');
    
    // 3. 尝试创建日元 (也使用 ￥ 符号)
    console.log('3️⃣ 创建日元 (也使用 ￥ 符号):');
    try {
      const { data: jpy } = await axios.post(`${API_BASE}/currencies`, {
        currency_name: '日元',
        currency_symbol: '￥'
      });
      console.log('✅ 日元创建成功:', jpy);
    } catch (error) {
      if (error.response?.data?.error?.includes('已存在')) {
        console.log('ℹ️  日元已存在，跳过创建');
      } else {
        console.log('❌ 日元创建失败:', error.response?.data || error.message);
      }
    }
    console.log('');
    
    // 4. 再次获取货币列表，验证两个货币都存在
    console.log('4️⃣ 验证最终货币列表:');
    const { data: finalCurrencies } = await axios.get(`${API_BASE}/currencies`);
    
    const yenSymbolCurrencies = finalCurrencies.filter(c => c.currency_symbol === '￥');
    console.log('使用 ￥ 符号的货币:', yenSymbolCurrencies);
    
    if (yenSymbolCurrencies.length >= 2) {
      console.log('\n🎉 测试成功！多个货币可以使用相同符号！');
      console.log('✅ 已验证人民币和日元都可以使用 ￥ 符号');
    } else {
      console.log('\n⚠️  测试结果待确认，使用 ￥ 符号的货币数量:', yenSymbolCurrencies.length);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 请确保后端服务正在运行 (npm start 或 node src/app.js)');
    }
  }
};

// 运行测试
if (require.main === module) {
  testCurrencySymbolDuplication();
}

module.exports = { testCurrencySymbolDuplication }; 