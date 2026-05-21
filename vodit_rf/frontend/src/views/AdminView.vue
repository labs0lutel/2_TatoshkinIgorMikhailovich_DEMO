<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api'

const router = useRouter()
const auth = useAuthStore()

const applications = ref([])
const total = ref(0)
const loading = ref(false)
const notification = ref('')
const notificationType = ref('success')

const filterStatus = ref('')
const page = ref(1)
const limit = 8
const sortField = ref('created_at')
const sortOrder = ref('DESC')

const totalPages = computed(() => Math.ceil(total.value / limit))

const statuses = ['', 'Новая', 'Идет обучение', 'Обучение завершено']

onMounted(loadApplications)

async function loadApplications() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit,
      sort: sortField.value,
      order: sortOrder.value,
    }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.get('/admin/applications', { params })
    applications.value = res.data.data
    total.value = res.data.total
  } catch {
    applications.value = []
  } finally {
    loading.value = false
  }
}

async function changeStatus(id, status) {
  try {
    await api.patch(`/admin/applications/${id}/status`, { status })
    showNotification(`Статус изменён на "${status}"`, 'success')
    await loadApplications()
  } catch (e) {
    showNotification(e.response?.data?.message || 'Ошибка', 'error')
  }
}

function showNotification(msg, type = 'success') {
  notification.value = msg
  notificationType.value = type
  setTimeout(() => { notification.value = '' }, 3000)
}

function statusClass(status) {
  if (status === 'Новая') return 'status-new'
  if (status === 'Идет обучение') return 'status-learning'
  return 'status-done'
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU')
}

function applyFilter() {
  page.value = 1
  loadApplications()
}

function setPage(p) {
  page.value = p
  loadApplications()
}

function toggleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortField.value = field
    sortOrder.value = 'DESC'
  }
  loadApplications()
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div>
    <nav class="navbar">
      <span class="logo">Водить.РФ — Администратор</span>
      <div class="nav-links">
        <button @click="logout">Выйти</button>
      </div>
    </nav>

    <div v-if="notification" class="toast" :class="notificationType === 'success' ? 'toast-success' : 'toast-error'">
      {{ notification }}
    </div>

    <div class="admin-content">
      <h2 class="section-title">Управление заявками</h2>

      <div class="filters card">
        <div class="filter-row">
          <div class="form-group" style="margin:0; flex:1">
            <label>Фильтр по статусу</label>
            <select v-model="filterStatus" @change="applyFilter">
              <option value="">Все статусы</option>
              <option v-for="s in statuses.slice(1)" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <button class="btn btn-secondary" @click="applyFilter">Применить</button>
        </div>
        <div class="sort-row">
          <span>Сортировка:</span>
          <button class="sort-btn" :class="{ active: sortField === 'created_at' }" @click="toggleSort('created_at')">
            Дата {{ sortField === 'created_at' ? (sortOrder === 'DESC' ? '↓' : '↑') : '' }}
          </button>
          <button class="sort-btn" :class="{ active: sortField === 'status' }" @click="toggleSort('status')">
            Статус {{ sortField === 'status' ? (sortOrder === 'DESC' ? '↓' : '↑') : '' }}
          </button>
        </div>
      </div>

      <div class="table-wrap card">
        <div v-if="loading" class="loading">Загрузка...</div>
        <table v-else>
          <thead>
            <tr>
              <th>#</th>
              <th>Пользователь</th>
              <th>Транспорт</th>
              <th>Оплата</th>
              <th>Дата начала</th>
              <th>Создана</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in applications" :key="app.id">
              <td>{{ app.id }}</td>
              <td>
                <div class="user-cell">
                  <span class="user-name">{{ app.full_name }}</span>
                  <span class="user-login">@{{ app.login }}</span>
                </div>
              </td>
              <td>{{ app.transport_name }}</td>
              <td>{{ app.payment_name }}</td>
              <td>{{ formatDate(app.start_date) }}</td>
              <td>{{ formatDate(app.created_at) }}</td>
              <td>
                <span class="status-badge" :class="statusClass(app.status)">{{ app.status }}</span>
              </td>
              <td>
                <select class="status-select" :value="app.status" @change="changeStatus(app.id, $event.target.value)">
                  <option value="Новая">Новая</option>
                  <option value="Идет обучение">Идет обучение</option>
                  <option value="Обучение завершено">Обучение завершено</option>
                </select>
              </td>
            </tr>
            <tr v-if="applications.length === 0">
              <td colspan="8" class="empty-row">Заявок не найдено</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button
          v-for="p in totalPages"
          :key="p"
          class="page-btn"
          :class="{ active: p === page }"
          @click="setPage(p)"
        >{{ p }}</button>
      </div>

      <div class="total-info">Всего заявок: {{ total }}</div>
    </div>
  </div>
</template>

<style scoped>
.admin-content {
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 16px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

.filters {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 12px;
}

.sort-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #607d8b;
}

.sort-btn {
  background: #e3f2fd;
  border: none;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Rubik', sans-serif;
  transition: background 0.2s;
}

.sort-btn.active { background: #1565c0; color: #fff; }

.table-wrap {
  overflow-x: auto;
  padding: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  background: #e3f2fd;
  padding: 12px 14px;
  text-align: left;
  font-weight: 600;
  color: #1565c0;
  white-space: nowrap;
}

td {
  padding: 12px 14px;
  border-bottom: 1px solid #eceff1;
  vertical-align: middle;
}

tr:last-child td { border-bottom: none; }
tr:hover td { background: #f5f9ff; }

.user-cell {
  display: flex;
  flex-direction: column;
}

.user-name { font-weight: 500; }
.user-login { font-size: 12px; color: #90a4ae; }

.status-select {
  padding: 6px 10px;
  border: 1.5px solid #cfd8dc;
  border-radius: 6px;
  font-family: 'Rubik', sans-serif;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.empty-row {
  text-align: center;
  color: #90a4ae;
  padding: 32px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #607d8b;
}

.pagination {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  justify-content: center;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1.5px solid #cfd8dc;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-family: 'Rubik', sans-serif;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn.active {
  background: #1565c0;
  color: #fff;
  border-color: #1565c0;
}

.total-info {
  text-align: right;
  color: #90a4ae;
  font-size: 13px;
  margin-top: 12px;
}

/* Всплывающее уведомление */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 14px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  z-index: 999;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  animation: slideIn 0.3s ease;
}

.toast-success { background: #e8f5e9; color: #1b5e20; border: 1px solid #a5d6a7; }
.toast-error { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }

@keyframes slideIn {
  from { transform: translateX(60px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
