<template>
  <div class="user-management container">
    <h2><i class="fas fa-users"></i> 用户管理</h2>

    <!-- 创建用户 -->
    <div class="form-group">
      <input v-model="userForm.user_name" placeholder="用户名" type="text" />
      <input v-model="userForm.user_pwd" placeholder="密码" type="password" />
      <input v-model="userForm.user_email" placeholder="邮箱" type="email" />
      <button @click="createUser" class="btn btn-success">创建用户</button>
    </div>

    <!-- 查询用户 -->
    <div class="form-group">
      <input v-model="searchName" placeholder="用户名查询" type="text" />
      <button @click="searchUser" class="btn btn-primary">查询</button>
    </div>

    <!-- 显示查询结果 -->
    <div v-if="queriedUser" class="user-card">
      <h3>用户信息</h3>
      <p>ID: {{ queriedUser.user_id }}</p>
      <p>用户名: {{ queriedUser.user_name }}</p>
      <p>邮箱: {{ queriedUser.user_email }}</p>
      <button @click="deleteUser(queriedUser.user_id)" class="btn btn-danger">删除</button>
      <button @click="prepareUpdate(queriedUser)" class="btn btn-warning">修改</button>
    </div>

    <!-- 更新用户 -->
    <div v-if="editUser.user_id" class="form-group">
      <input v-model="editUser.user_name" placeholder="新用户名" type="text" />
      <input v-model="editUser.user_pwd" placeholder="新密码" type="password" />
      <input v-model="editUser.user_email" placeholder="新邮箱" type="email" />
      <button @click="updateUser" class="btn btn-primary">保存</button>
      <button @click="editUser = {}" class="btn btn-secondary">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

const API_BASE ='/api/users'
const loading = ref(false)
const searchName = ref('')
const queriedUser = ref(null)

const userForm = reactive({
  user_name: '',
  user_pwd: '',
  user_email: ''
})

const editUser = reactive({
  user_id: '',
  user_name: '',
  user_pwd: '',
  user_email: ''
})

const callApi = async (apiCall) => {
  loading.value = true
  try {
    const res = await apiCall()
    return res.data
  } catch (err) {
    alert(err.response?.data?.error || err.message)
    throw err
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  if (!userForm.user_name || !userForm.user_pwd || !userForm.user_email) {
    alert('请填写完整信息')
    return
  }
  const data = { ...userForm }
  await callApi(() => axios.post(`${API_BASE}/createUser`, data))
  userForm.user_name = userForm.user_pwd = userForm.user_email = ''
}

const searchUser = async () => {
  if (!searchName.value) return
  queriedUser.value = await callApi(() => axios.get(`${API_BASE}/searchUser`, {
    params: { name: searchName.value }
  }))
}

const deleteUser = async (id) => {
  if (!confirm(`确认删除用户 ${id} 吗？`)) return
  await callApi(() => axios.delete(`${API_BASE}/${id}`))
  queriedUser.value = null
}

const prepareUpdate = (user) => {
  editUser.user_id = user.user_id
  editUser.user_name = user.user_name
  editUser.user_email = user.user_email
  editUser.user_pwd = ''
}

const updateUser = async () => {
  const updateData = {}
  if (editUser.user_name) updateData.user_name = editUser.user_name
  if (editUser.user_pwd) updateData.user_pwd = editUser.user_pwd
  if (editUser.user_email) updateData.user_email = editUser.user_email

  await callApi(() => axios.put(`${API_BASE}/updateUser/${editUser.user_id}`, updateData))
  queriedUser.value = await callApi(() => axios.get(`${API_BASE}/searchUser`, {
    params: { name: editUser.user_name }
  }))
  editUser.user_id = ''
}
</script>

<style scoped>
.container {
  padding: 1rem;
}
.form-group {
  margin: 1rem 0;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.user-card {
  padding: 1rem;
  background: #f4f4f4;
  border-radius: 8px;
  margin-top: 1rem;
}
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-success {
  background-color: #28a745;
  color: white;
}
.btn-danger {
  background-color: #dc3545;
  color: white;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-warning {
  background-color: #ffc107;
  color: black;
}
</style>