import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const isAdmin = ref(localStorage.getItem('isAdmin') === 'true')

  function setUser(data, adminFlag = false) {
    token.value = data.token
    user.value = data.user || null
    isAdmin.value = adminFlag
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user || null))
    localStorage.setItem('isAdmin', adminFlag)
  }

  function logout() {
    token.value = null
    user.value = null
    isAdmin.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('isAdmin')
  }

  async function login(login, password) {
    const res = await api.post('/auth/login', { login, password })
    setUser(res.data, false)
  }

  async function adminLogin(login, password) {
    const res = await api.post('/auth/admin/login', { login, password })
    setUser(res.data, true)
  }

  async function register(form) {
    await api.post('/auth/register', form)
  }

  return { token, user, isAdmin, login, adminLogin, register, logout }
})
