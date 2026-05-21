<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Slider from '../components/Slider.vue'
import api from '../api'

const router = useRouter()
const auth = useAuthStore()

const applications = ref([])
const loading = ref(true)
const reviewText = ref('')
const reviewAppId = ref(null)
const reviewError = ref('')
const reviewSuccess = ref('')
const notification = ref('')

onMounted(async () => {
  await loadApplications()
})

async function loadApplications() {
  loading.value = true
  try {
    const res = await api.get('/applications/my')
    applications.value = res.data
  } catch {
    applications.value = []
  } finally {
    loading.value = false
  }
}

function statusClass(status) {
  if (status === 'Новая') return 'status-new'
  if (status === 'Идет обучение') return 'status-learning'
  return 'status-done'
}

function openReview(id) {
  reviewAppId.value = id
  reviewText.value = ''
  reviewError.value = ''
  reviewSuccess.value = ''
}

function closeReview() {
  reviewAppId.value = null
}

async function submitReview() {
  reviewError.value = ''
  if (!reviewText.value.trim()) {
    reviewError.value = 'Введите текст отзыва'
    return
  }
  try {
    await api.post('/reviews', { application_id: reviewAppId.value, text: reviewText.value })
    reviewSuccess.value = 'Отзыв добавлен!'
    setTimeout(closeReview, 1200)
  } catch (e) {
    reviewError.value = e.response?.data?.message || 'Ошибка'
  }
}

function logout() {
  auth.logout()
  router.push('/login')
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU')
}
</script>

<template>
  <div>
    <!-- Навбар -->
    <nav class="navbar">
      <span class="logo">Водить.РФ</span>
      <div class="nav-links">
        <span style="margin-right:8px; opacity:0.85">{{ auth.user?.full_name }}</span>
        <router-link to="/application">Подать заявку</router-link>
        <button @click="logout">Выйти</button>
      </div>
    </nav>

    <div class="cabinet-content">
      <!-- Слайдер -->
      <div class="slider-wrap">
        <Slider />
      </div>

      <h2 class="section-title">Мои заявки</h2>

      <div v-if="loading" class="loading">Загрузка...</div>

      <div v-else-if="applications.length === 0" class="empty-state card">
        <p>У вас пока нет заявок</p>
        <router-link to="/application" class="btn btn-primary">Подать заявку</router-link>
      </div>

      <div v-else class="applications-list">
        <div v-for="app in applications" :key="app.id" class="app-card card">
          <div class="app-header">
            <span class="app-id">#{{ app.id }}</span>
            <span class="status-badge" :class="statusClass(app.status)">{{ app.status }}</span>
          </div>
          <div class="app-info">
            <div><b>Транспорт:</b> {{ app.transport_name }}</div>
            <div><b>Оплата:</b> {{ app.payment_name }}</div>
            <div><b>Дата начала:</b> {{ formatDate(app.start_date) }}</div>
            <div><b>Создана:</b> {{ formatDate(app.created_at) }}</div>
          </div>
          <button
            v-if="app.status !== 'Новая'"
            class="btn btn-secondary"
            @click="openReview(app.id)"
          >
            Оставить отзыв
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно отзыва -->
    <div v-if="reviewAppId" class="modal-overlay" @click.self="closeReview">
      <div class="modal card">
        <h3>Оставить отзыв</h3>
        <div v-if="reviewError" class="alert alert-error">{{ reviewError }}</div>
        <div v-if="reviewSuccess" class="alert alert-success">{{ reviewSuccess }}</div>
        <div class="form-group">
          <label>Ваш отзыв</label>
          <textarea v-model="reviewText" rows="4" placeholder="Напишите ваш отзыв..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="submitReview">Отправить</button>
          <button class="btn btn-secondary" @click="closeReview">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cabinet-content {
  max-width: 900px;
  margin: 32px auto;
  padding: 0 16px;
}

.slider-wrap {
  margin-bottom: 32px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.loading {
  text-align: center;
  color: #607d8b;
  padding: 40px;
}

.empty-state {
  text-align: center;
  padding: 48px;
}

.empty-img {
  width: 120px;
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-state p {
  color: #607d8b;
  margin-bottom: 20px;
  font-size: 16px;
}

.applications-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.app-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-id {
  font-weight: 600;
  color: #607d8b;
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #37474f;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  width: 420px;
  max-width: 95vw;
}

.modal h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
</style>
