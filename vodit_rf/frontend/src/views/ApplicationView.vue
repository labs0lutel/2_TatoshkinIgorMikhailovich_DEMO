<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api'

const router = useRouter()
const auth = useAuthStore()

const transportTypes = ref([])
const paymentMethods = ref([])
const form = ref({
  transport_type_id: '',
  payment_method_id: '',
  start_date: '',
})
const errors = ref({})
const success = ref('')
const loading = ref(false)

onMounted(async () => {
  const [t, p] = await Promise.all([
    api.get('/applications/transport-types'),
    api.get('/applications/payment-methods'),
  ])
  transportTypes.value = t.data
  paymentMethods.value = p.data
})

function validate() {
  errors.value = {}
  if (!form.value.transport_type_id) errors.value.transport = 'Выберите вид транспорта'
  if (!form.value.payment_method_id) errors.value.payment = 'Выберите способ оплаты'
  if (!form.value.start_date) errors.value.date = 'Укажите дату начала обучения'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  success.value = ''
  if (!validate()) return
  loading.value = true
  try {
    await api.post('/applications', form.value)
    success.value = 'Заявка успешно подана!'
    setTimeout(() => router.push('/cabinet'), 1500)
  } catch (e) {
    errors.value.general = e.response?.data?.message || 'Ошибка при подаче заявки'
  } finally {
    loading.value = false
  }
}

function formatDisplay(val) {
  if (!val) return ''
  const [y, m, d] = val.split('-')
  return `${d}.${m}.${y}`
}
</script>

<template>
  <div>
    <nav class="navbar">
      <span class="logo">Водить.РФ</span>
      <div class="nav-links">
        <router-link to="/cabinet">Личный кабинет</router-link>
        <button @click="auth.logout(); $router.push('/login')">Выйти</button>
      </div>
    </nav>

    <div class="app-content">
      <div class="app-form card">
        <div class="form-header">
          <div>
            <h2>Оформление заявки</h2>
            <p class="subtitle">Заполните форму для записи на курс</p>
          </div>
        </div>

        <div v-if="errors.general" class="alert alert-error">{{ errors.general }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label>Вид транспорта *</label>
            <select v-model="form.transport_type_id">
              <option value="" disabled>Выберите вид транспорта</option>
              <option v-for="t in transportTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <span v-if="errors.transport" class="error-msg">{{ errors.transport }}</span>
          </div>

          <div class="form-group">
            <label>Способ оплаты *</label>
            <select v-model="form.payment_method_id">
              <option value="" disabled>Выберите способ оплаты</option>
              <option v-for="p in paymentMethods" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <span v-if="errors.payment" class="error-msg">{{ errors.payment }}</span>
          </div>

          <div class="form-group">
            <label>Дата начала обучения * (ДД.ММ.ГГГГ)</label>
            <input v-model="form.start_date" type="date" />
            <span v-if="form.start_date" class="date-display">{{ formatDisplay(form.start_date) }}</span>
            <span v-if="errors.date" class="error-msg">{{ errors.date }}</span>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Отправка...' : 'Подать заявку' }}
            </button>
            <router-link to="/cabinet" class="btn btn-secondary">Отмена</router-link>
          </div>
        </form>
      </div>

      <div class="app-info-panel">
        <img src="/images/67be0e9604c2fe619a95ca87.jpg" alt="Обучение" class="info-img" />
        <div class="card info-card">
          <h3>Как это работает?</h3>
          <ol>
            <li>Выберите вид транспорта</li>
            <li>Укажите удобную дату начала</li>
            <li>Выберите способ оплаты</li>
            <li>Заявка отправляется администратору</li>
            <li>Следите за статусом в личном кабинете</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-content {
  max-width: 900px;
  margin: 32px auto;
  padding: 0 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.app-form {
  align-self: start;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.form-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.form-header h2 {
  font-size: 22px;
  font-weight: 700;
}

.subtitle {
  color: #607d8b;
  font-size: 14px;
}

.date-display {
  font-size: 13px;
  color: #1565c0;
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.info-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
}

.info-card h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.info-card ol {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #37474f;
}

@media (max-width: 640px) {
  .app-content { grid-template-columns: 1fr; }
}
</style>
