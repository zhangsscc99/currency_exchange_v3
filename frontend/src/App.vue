<template>
  <div id="app">
    <!-- 头部 -->
    <header class="header">
      <div class="container">
        <h1><i class="fas fa-exchange-alt"></i> 货币兑换系统</h1>
        <p>Currency Exchange API Demo</p>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <div class="container">
        
        <!-- 系统状态 -->
        <section class="status-section">
          <h2><i class="fas fa-heartbeat"></i> 系统状态</h2>
          <div class="button-group">
            <button @click="checkHealth" class="btn btn-primary" :disabled="loading">
              <i class="fas fa-heart"></i> 健康检查
            </button>
            <button @click="getApiInfo" class="btn btn-info" :disabled="loading">
              <i class="fas fa-info-circle"></i> API信息
            </button>
          </div>
          
          <div v-if="systemStatus" class="result-card success">
            <h3>系统状态</h3>
            <pre>{{ JSON.stringify(systemStatus, null, 2) }}</pre>
          </div>
        </section>

        <!-- 货币管理 -->
        <section class="currency-section">
          <h2><i class="fas fa-coins"></i> 货币管理</h2>
          
          <!-- 操作按钮 -->
          <div class="button-group">
            <button @click="getAllCurrencies" class="btn btn-success" :disabled="loading">
              <i class="fas fa-list"></i> 获取所有货币
            </button>
            <button @click="getCurrencyById" class="btn btn-warning" :disabled="loading">
              <i class="fas fa-search"></i> 根据ID查询货币
            </button>
            <button @click="toggleCreateCurrency" class="btn btn-success" :disabled="loading">
              <i class="fas fa-plus"></i> 创建新货币 (POST)
            </button>
            <button @click="toggleDirectUpdate" class="btn btn-primary" :disabled="loading">
              <i class="fas fa-edit"></i> 直接更新货币 (PUT)
            </button>
          </div>

          <!-- 直接更新货币表单 -->
          <div v-if="showDirectUpdate" class="direct-update-section">
            <h3><i class="fas fa-pencil-alt"></i> 直接更新货币 - PUT API调用</h3>
            <div class="form-row">
              <div class="form-group">
                <label>货币ID (必填)：</label>
                <input 
                  type="number" 
                  v-model="directUpdateForm.currency_id" 
                  placeholder="输入要更新的货币ID"
                  min="1"
                >
              </div>
              <div class="form-group">
                <label>新货币名称：</label>
                <input 
                  type="text" 
                  v-model="directUpdateForm.currency_name" 
                  placeholder="例如：美元"
                >
              </div>
              <div class="form-group">
                <label>新货币符号：</label>
                <input 
                  type="text" 
                  v-model="directUpdateForm.currency_symbol" 
                  placeholder="例如：USD"
                >
              </div>
            </div>
            <div class="button-group">
              <button 
                @click="directUpdateCurrency" 
                class="btn btn-primary" 
                :disabled="loading || !directUpdateForm.currency_id || (!directUpdateForm.currency_name && !directUpdateForm.currency_symbol)"
              >
                <i class="fas fa-save"></i> 执行 PUT 请求
              </button>
              <button @click="clearDirectUpdate" class="btn btn-secondary">
                <i class="fas fa-times"></i> 取消
              </button>
            </div>
          </div>

          <!-- 查询特定货币的输入 -->
          <div class="input-group">
            <label for="currencyId">货币ID：</label>
            <input 
              type="number" 
              id="currencyId" 
              v-model="selectedCurrencyId" 
              placeholder="输入货币ID (例如: 1)"
              min="1"
            >
          </div>

          <!-- 创建新货币表单 -->
          <div v-if="showCreateForm" class="create-currency-section">
            <h3><i class="fas fa-plus-circle"></i> 创建新货币 - POST API调用</h3>
            <div class="form-row">
              <div class="form-group">
                <label>货币名称 (必填)：</label>
                <input 
                  type="text" 
                  v-model="createForm.currency_name" 
                  placeholder="例如：欧元"
                  required
                >
              </div>
              <div class="form-group">
                <label>货币符号 (必填)：</label>
                <input 
                  type="text" 
                  v-model="createForm.currency_symbol" 
                  placeholder="例如：EUR"
                  required
                >
              </div>
            </div>
            <div class="button-group">
              <button 
                @click="createNewCurrency" 
                class="btn btn-success" 
                :disabled="loading || !createForm.currency_name || !createForm.currency_symbol"
              >
                <i class="fas fa-save"></i> 执行 POST 请求
              </button>
              <button @click="clearCreateForm" class="btn btn-secondary">
                <i class="fas fa-times"></i> 取消
              </button>
            </div>
          </div>

          <!-- 货币列表 -->
          <div v-if="currencies.length > 0" class="currency-list">
            <h3>货币列表</h3>
            <div class="currency-grid">
              <div 
                v-for="currency in currencies" 
                :key="currency.currency_id"
                class="currency-card"
                @click="selectCurrency(currency)"
                :class="{ 'selected': selectedCurrency?.currency_id === currency.currency_id }"
              >
                <div class="currency-symbol">{{ currency.currency_symbol }}</div>
                <div class="currency-name">{{ currency.currency_name }}</div>
                <div class="currency-id">ID: {{ currency.currency_id }}</div>
              </div>
            </div>
          </div>

          <!-- 更新货币表单 -->
          <div v-if="selectedCurrency" class="update-section">
            <h3><i class="fas fa-edit"></i> 更新货币</h3>
            <div class="form-group">
              <label>货币名称：</label>
              <input 
                type="text" 
                v-model="updateForm.currency_name" 
                :placeholder="selectedCurrency.currency_name"
              >
            </div>
            <div class="form-group">
              <label>货币符号：</label>
              <input 
                type="text" 
                v-model="updateForm.currency_symbol" 
                :placeholder="selectedCurrency.currency_symbol"
              >
            </div>
            <button 
              @click="updateCurrency" 
              class="btn btn-primary" 
              :disabled="loading || (!updateForm.currency_name && !updateForm.currency_symbol)"
            >
              <i class="fas fa-save"></i> 更新货币
            </button>
            <button @click="clearSelection" class="btn btn-secondary">
              <i class="fas fa-times"></i> 取消
            </button>
          </div>
        </section>

        <!-- 响应结果 -->
        <section v-if="apiResponse" class="response-section">
          <h2><i class="fas fa-code"></i> API响应</h2>
          <div class="result-card" :class="{ 'error': isError, 'success': !isError }">
            <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
          </div>
        </section>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> 正在处理请求...
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 货币兑换系统. 后端端口: 3000 | 前端端口: 8080</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import axios from 'axios'

export default {
  name: 'App',
  setup() {
    // 响应式数据
    const loading = ref(false)
    const currencies = ref([])
    const selectedCurrency = ref(null)
    const selectedCurrencyId = ref('')
    const apiResponse = ref(null)
    const isError = ref(false)
    const systemStatus = ref(null)
    
    const updateForm = reactive({
      currency_name: '',
      currency_symbol: ''
    })

    const directUpdateForm = reactive({
      currency_id: '',
      currency_name: '',
      currency_symbol: ''
    })

    const createForm = reactive({
      currency_name: '',
      currency_symbol: ''
    })

    const showDirectUpdate = ref(false)
    const showCreateForm = ref(false)

    // API基础URL - 使用代理
    const API_BASE = '/api'

    // 通用API调用函数
    const callApi = async (apiCall, successMessage = '') => {
      loading.value = true
      apiResponse.value = null
      isError.value = false
      
      try {
        const response = await apiCall()
        apiResponse.value = response.data
        isError.value = false
        
        if (successMessage) {
          console.log(successMessage, response.data)
        }
        
        return response.data
      } catch (error) {
        console.error('API调用失败:', error)
        apiResponse.value = error.response?.data || { error: error.message }
        isError.value = true
        throw error
      } finally {
        loading.value = false
      }
    }

    // API调用方法
    const checkHealth = () => {
      callApi(() => axios.get(`${API_BASE}/health`))
        .then(data => {
          systemStatus.value = data
        })
    }

    const getApiInfo = () => {
      callApi(() => axios.get(`${API_BASE}/api`))
    }

    const getAllCurrencies = () => {
      callApi(() => axios.get(`${API_BASE}/currencies`), '获取所有货币成功')
        .then(data => {
          currencies.value = data
        })
    }

    const getCurrencyById = () => {
      if (!selectedCurrencyId.value) {
        alert('请输入货币ID')
        return
      }
      
      callApi(() => axios.get(`${API_BASE}/currencies/${selectedCurrencyId.value}`), `获取货币ID ${selectedCurrencyId.value} 成功`)
        .then(data => {
          currencies.value = [data]
        })
    }

    const updateCurrency = () => {
      if (!selectedCurrency.value) return
      
      const updateData = {}
      if (updateForm.currency_name) updateData.currency_name = updateForm.currency_name
      if (updateForm.currency_symbol) updateData.currency_symbol = updateForm.currency_symbol
      
      callApi(
        () => axios.put(`${API_BASE}/currencies/${selectedCurrency.value.currency_id}`, updateData),
        `更新货币ID ${selectedCurrency.value.currency_id} 成功`
      ).then(data => {
        // 更新本地数据
        const index = currencies.value.findIndex(c => c.currency_id === selectedCurrency.value.currency_id)
        if (index !== -1) {
          currencies.value[index] = data
        }
        selectedCurrency.value = data
        clearUpdateForm()
      })
    }

    // 辅助方法
    const selectCurrency = (currency) => {
      selectedCurrency.value = currency
      updateForm.currency_name = ''
      updateForm.currency_symbol = ''
    }

    const clearSelection = () => {
      selectedCurrency.value = null
      clearUpdateForm()
    }

    const clearUpdateForm = () => {
      updateForm.currency_name = ''
      updateForm.currency_symbol = ''
    }

    // 直接更新货币的方法
    const toggleDirectUpdate = () => {
      showDirectUpdate.value = !showDirectUpdate.value
      if (!showDirectUpdate.value) {
        clearDirectUpdate()
      }
    }

    const directUpdateCurrency = () => {
      if (!directUpdateForm.currency_id) {
        alert('请输入货币ID')
        return
      }
      
      const updateData = {}
      if (directUpdateForm.currency_name) updateData.currency_name = directUpdateForm.currency_name
      if (directUpdateForm.currency_symbol) updateData.currency_symbol = directUpdateForm.currency_symbol
      
      callApi(
        () => axios.put(`${API_BASE}/currencies/${directUpdateForm.currency_id}`, updateData),
        `直接更新货币ID ${directUpdateForm.currency_id} 成功`
      ).then(data => {
        // 更新本地数据
        const index = currencies.value.findIndex(c => c.currency_id === parseInt(directUpdateForm.currency_id))
        if (index !== -1) {
          currencies.value[index] = data
        }
        clearDirectUpdate()
        showDirectUpdate.value = false
      }).catch(error => {
        console.error('直接更新货币失败:', error)
      })
    }

    const clearDirectUpdate = () => {
      directUpdateForm.currency_id = ''
      directUpdateForm.currency_name = ''
      directUpdateForm.currency_symbol = ''
    }

    // 创建货币的方法
    const toggleCreateCurrency = () => {
      showCreateForm.value = !showCreateForm.value
      if (!showCreateForm.value) {
        clearCreateForm()
      }
    }

    const createNewCurrency = () => {
      if (!createForm.currency_name || !createForm.currency_symbol) {
        alert('请填写货币名称和符号')
        return
      }
      
      const newCurrencyData = {
        currency_name: createForm.currency_name.trim(),
        currency_symbol: createForm.currency_symbol.trim()
      }
      
      callApi(
        () => axios.post(`${API_BASE}/currencies`, newCurrencyData),
        `成功创建新货币: ${newCurrencyData.currency_name}`
      ).then(data => {
        // 将新创建的货币添加到列表
        if (currencies.value.length > 0) {
          currencies.value.push(data)
        }
        clearCreateForm()
        showCreateForm.value = false
        // 刷新货币列表以显示最新数据
        getAllCurrencies()
      }).catch(error => {
        console.error('创建货币失败:', error)
      })
    }

    const clearCreateForm = () => {
      createForm.currency_name = ''
      createForm.currency_symbol = ''
    }

    return {
      loading,
      currencies,
      selectedCurrency,
      selectedCurrencyId,
      apiResponse,
      isError,
      systemStatus,
      updateForm,
      directUpdateForm,
      createForm,
      showDirectUpdate,
      showCreateForm,
      checkHealth,
      getApiInfo,
      getAllCurrencies,
      getCurrencyById,
      updateCurrency,
      selectCurrency,
      clearSelection,
      toggleDirectUpdate,
      directUpdateCurrency,
      clearDirectUpdate,
      toggleCreateCurrency,
      createNewCurrency,
      clearCreateForm
    }
  }
}
</script> 