# PUT Currency API 使用指南

## 🎯 API 端点

```
PUT /api/v1/currencies/{id}
```

## 📝 功能描述

更新现有货币的信息，支持部分更新（只更新提供的字段）。

## 🔧 请求格式

### 请求头
```
Content-Type: application/json
```

### 路径参数
- `id` (必需): 货币的ID (整数，> 0)

### 请求体
```json
{
  "currency_name": "string (可选)",
  "currency_symbol": "string (可选)"
}
```

**注意**: 至少需要提供一个字段进行更新。

## ✅ 成功响应

### 状态码: 200 OK

```json
{
  "success": true,
  "message": "货币更新成功",
  "data": {
    "id": 1,
    "name": "美元",
    "symbol": "$"
  }
}
```

## ❌ 错误响应

### 1. 货币不存在 (404)
```json
{
  "success": false,
  "message": "货币不存在",
  "error_code": "NOT_FOUND"
}
```

### 2. 验证错误 (400)
```json
{
  "success": false,
  "message": "输入数据验证失败",
  "error_code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "currency_name",
      "message": "货币名称长度必须在1-50个字符之间",
      "value": ""
    }
  ]
}
```

### 3. 重复数据 (409)
```json
{
  "success": false,
  "message": "货币名称已存在",
  "error_code": "CONFLICT"
}
```

## 🚀 使用示例

### 示例 1: 更新货币名称

**请求:**
```bash
curl -X PUT http://localhost:3000/api/v1/currencies/1 \
  -H "Content-Type: application/json" \
  -d '{
    "currency_name": "美国美元"
  }'
```

**响应:**
```json
{
  "success": true,
  "message": "货币更新成功",
  "data": {
    "id": 1,
    "name": "美国美元",
    "symbol": "$"
  }
}
```

### 示例 2: 更新货币符号

**请求:**
```bash
curl -X PUT http://localhost:3000/api/v1/currencies/2 \
  -H "Content-Type: application/json" \
  -d '{
    "currency_symbol": "€"
  }'
```

**响应:**
```json
{
  "success": true,
  "message": "货币更新成功",
  "data": {
    "id": 2,
    "name": "欧元",
    "symbol": "€"
  }
}
```

### 示例 3: 同时更新名称和符号

**请求:**
```bash
curl -X PUT http://localhost:3000/api/v1/currencies/3 \
  -H "Content-Type: application/json" \
  -d '{
    "currency_name": "英镑",
    "currency_symbol": "£"
  }'
```

**响应:**
```json
{
  "success": true,
  "message": "货币更新成功",
  "data": {
    "id": 3,
    "name": "英镑",
    "symbol": "£"
  }
}
```

### 示例 4: JavaScript 中使用

```javascript
// 使用 fetch API
async function updateCurrency(id, updateData) {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/currencies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('货币更新成功:', result.data);
      return result.data;
    } else {
      console.error('更新失败:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('网络错误:', error.message);
    throw error;
  }
}

// 使用示例
updateCurrency(1, {
  currency_name: "新的货币名称",
  currency_symbol: "¥"
}).then(updatedCurrency => {
  console.log('更新后的货币:', updatedCurrency);
}).catch(error => {
  console.error('错误:', error.message);
});
```

### 示例 5: Vue.js 中使用

```vue
<template>
  <div>
    <h2>更新货币</h2>
    <form @submit.prevent="updateCurrency">
      <div>
        <label>货币名称:</label>
        <input v-model="form.currency_name" type="text" />
      </div>
      <div>
        <label>货币符号:</label>
        <input v-model="form.currency_symbol" type="text" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '更新中...' : '更新货币' }}
      </button>
    </form>
    
    <div v-if="message" :class="messageClass">
      {{ message }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UpdateCurrency',
  props: {
    currencyId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      form: {
        currency_name: '',
        currency_symbol: ''
      },
      loading: false,
      message: '',
      messageClass: ''
    };
  },
  methods: {
    async updateCurrency() {
      this.loading = true;
      this.message = '';
      
      try {
        // 构建更新数据（只包含非空字段）
        const updateData = {};
        if (this.form.currency_name.trim()) {
          updateData.currency_name = this.form.currency_name.trim();
        }
        if (this.form.currency_symbol.trim()) {
          updateData.currency_symbol = this.form.currency_symbol.trim();
        }
        
        if (Object.keys(updateData).length === 0) {
          this.message = '请至少填写一个字段';
          this.messageClass = 'error';
          return;
        }
        
        const response = await axios.put(
          `http://localhost:3000/api/v1/currencies/${this.currencyId}`,
          updateData
        );
        
        if (response.data.success) {
          this.message = '货币更新成功！';
          this.messageClass = 'success';
          this.$emit('currency-updated', response.data.data);
        }
      } catch (error) {
        if (error.response && error.response.data) {
          this.message = error.response.data.message || '更新失败';
        } else {
          this.message = '网络错误，请稍后重试';
        }
        this.messageClass = 'error';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.success {
  color: green;
}
.error {
  color: red;
}
</style>
```

## 🔍 验证规则

### currency_name (货币名称)
- **可选字段**
- 长度：1-50个字符
- 格式：只能包含字母、中文和空格
- 唯一性：不能与其他货币名称重复（排除当前更新的货币）

### currency_symbol (货币符号)  
- **可选字段**
- 长度：1-10个字符
- 唯一性：不能与其他货币符号重复（排除当前更新的货币）

### 通用规则
- 至少需要提供一个字段进行更新
- 字符串会自动去除首尾空格
- ID必须是大于0的整数

## 🧪 测试用例

### 1. 正常更新测试
```bash
# 创建测试货币
curl -X POST http://localhost:3000/api/v1/currencies \
  -H "Content-Type: application/json" \
  -d '{"currency_name": "测试货币", "currency_symbol": "TEST"}'

# 更新货币名称
curl -X PUT http://localhost:3000/api/v1/currencies/1 \
  -H "Content-Type: application/json" \
  -d '{"currency_name": "更新后的测试货币"}'
```

### 2. 错误情况测试
```bash
# 测试不存在的ID
curl -X PUT http://localhost:3000/api/v1/currencies/999 \
  -H "Content-Type: application/json" \
  -d '{"currency_name": "不存在的货币"}'

# 测试无效的ID
curl -X PUT http://localhost:3000/api/v1/currencies/abc \
  -H "Content-Type: application/json" \
  -d '{"currency_name": "无效ID"}'

# 测试空请求体
curl -X PUT http://localhost:3000/api/v1/currencies/1 \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 📊 性能和限制

- **请求限制**: 每个IP每15分钟最多100次请求
- **响应时间**: 通常 < 100ms
- **并发支持**: 是
- **事务安全**: 是

## 🔧 故障排除

### 常见问题

1. **"货币不存在"错误**
   - 检查ID是否正确
   - 确认货币确实存在于数据库中

2. **"货币名称已存在"错误**
   - 检查是否有其他货币使用了相同的名称
   - 使用不同的名称或符号

3. **"验证失败"错误**
   - 检查字段格式是否正确
   - 确保至少提供一个要更新的字段

4. **网络连接错误**
   - 检查服务器是否运行
   - 验证API端点地址是否正确

### 调试技巧
- 启用日志查看详细错误信息
- 使用 `/health` 端点检查服务状态
- 查看 Swagger 文档获取完整API规范 