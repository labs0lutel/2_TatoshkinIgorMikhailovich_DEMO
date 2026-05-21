<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const login = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  if (!login.value || !password.value) {
    error.value = 'Заполните все поля'
    return
  }
  loading.value = true
  try {
    await auth.login(login.value, password.value)
    router.push('/cabinet')
  } catch (e) {
    error.value = e.response?.data?.message || 'Неверный логин или пароль'
  } finally {
    loading.value = false
  }
}

async function adminSubmit() {
  error.value = ''
  if (!login.value || !password.value) {
    error.value = 'Заполните все поля'
    return
  }
  loading.value = true
  try {
    await auth.adminLogin(login.value, password.value)
    router.push('/admin')
  } catch (e) {
    error.value = e.response?.data?.message || 'Неверный логин или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-left">
      <img src="/images/po-rekam-spb.jpg" alt="Водить.РФ" class="bg-img" />
      <div class="overlay">
        <div class="brand">Водить.РФ</div>
        <p>Курсы вождения речного транспорта</p>
      </div>
    </div>

    <div class="login-right">
      <div class="login-box card">
        <h2>Вход в систему</h2>
        <p class="subtitle">Введите логин и пароль для входа</p>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label>Логин</label>
            <input v-model="login" type="text" placeholder="Введите логин" />
          </div>
          <div class="form-group">
            <label>Пароль</label>
            <input v-model="password" type="password" placeholder="Введите пароль" />
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>
        </form>

        <button class="btn btn-secondary w-full mt-2" @click="adminSubmit" :disabled="loading">
          Войти как администратор
        </button>

        <p class="register-link">
          Ещё не зарегистрированы?
          <router-link to="/register">Регистрация</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
}

.login-left {
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

.login-right {
  width: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: #f0f4f8;
}

.login-box {
  width: 100%;
}

.login-box h2 {
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
.mt-2 { margin-top: 10px; }

.register-link {
  text-align: center;
  margin-top: 18px;
  font-size: 14px;
  color: #607d8b;
}

.register-link a {
  color: #1565c0;
  font-weight: 500;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
