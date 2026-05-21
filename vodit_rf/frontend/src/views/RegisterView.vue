<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  login: '',
  password: '',
  full_name: '',
  birth_date: '',
  phone: '',
  email: '',
})

const errors = ref({})
const success = ref('')
const loading = ref(false)

function validate() {
  errors.value = {}
  if (!/^[a-zA-Z0-9]{6,}$/.test(form.value.login)) {
    errors.value.login = 'Логин: только латиница и цифры, минимум 6 символов'
  }
  if (form.value.password.length < 8) {
    errors.value.password = 'Пароль минимум 8 символов'
  }
  if (!form.value.full_name.trim()) {
    errors.value.full_name = 'Введите ФИО'
  }
  if (!form.value.birth_date) {
    errors.value.birth_date = 'Введите дату рождения'
  }
  if (!form.value.phone.trim()) {
    errors.value.phone = 'Введите телефон'
  }
  if (!form.value.email.trim()) {
    errors.value.email = 'Введите e-mail'
  }
  return Object.keys(errors.value).length === 0
}

async function submit() {
  success.value = ''
  if (!validate()) return
  loading.value = true
  try {
    await auth.register(form.value)
    success.value = 'Регистрация успешна! Теперь войдите в систему.'
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    errors.value.general = e.response?.data?.message || 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-left">
      <img src="/images/1ybMfJJ9kSk.jpg" alt="Водить.РФ" class="bg-img" />
      <div class="overlay">
        <div class="brand">Водить.РФ</div>
        <p>Курсы вождения речного транспорта</p>
      </div>
    </div>

    <div class="register-right">
      <div class="register-box card">
        <h2>Регистрация</h2>
        <p class="subtitle">Создайте аккаунт для подачи заявок</p>

        <div v-if="errors.general" class="alert alert-error">{{ errors.general }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label>Логин *</label>
            <input v-model="form.login" type="text" placeholder="Только латиница и цифры, мин. 6" />
            <span v-if="errors.login" class="error-msg">{{ errors.login }}</span>
          </div>

          <div class="form-group">
            <label>Пароль *</label>
            <input v-model="form.password" type="password" placeholder="Минимум 8 символов" />
            <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
          </div>

          <div class="form-group">
            <label>ФИО *</label>
            <input v-model="form.full_name" type="text" placeholder="Иванов Иван Иванович" />
            <span v-if="errors.full_name" class="error-msg">{{ errors.full_name }}</span>
          </div>

          <div class="form-group">
            <label>Дата рождения *</label>
            <input v-model="form.birth_date" type="date" />
            <span v-if="errors.birth_date" class="error-msg">{{ errors.birth_date }}</span>
          </div>

          <div class="form-group">
            <label>Телефон *</label>
            <input v-model="form.phone" type="tel" placeholder="+7 (999) 999-99-99" />
            <span v-if="errors.phone" class="error-msg">{{ errors.phone }}</span>
          </div>

          <div class="form-group">
            <label>E-mail *</label>
            <input v-model="form.email" type="email" placeholder="example@mail.ru" />
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
          </button>
        </form>

        <p class="login-link">
          Уже зарегистрированы?
          <router-link to="/login">Войти</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  min-height: 100vh;
}

.register-left {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(21, 101, 192, 0.65);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
}

.overlay .brand {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 12px;
}

.overlay p {
  font-size: 18px;
  opacity: 0.9;
}

.register-right {
  width: 480px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px;
  background: #f0f4f8;
  overflow-y: auto;
}

.register-box {
  width: 100%;
  margin-top: 20px;
}

.register-box h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
}

.subtitle {
  color: #607d8b;
  font-size: 14px;
  margin-bottom: 24px;
}

.w-full { width: 100%; }

.login-link {
  text-align: center;
  margin-top: 18px;
  font-size: 14px;
  color: #607d8b;
}

.login-link a {
  color: #1565c0;
  font-weight: 500;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
