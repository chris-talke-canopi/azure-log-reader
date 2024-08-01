<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router'

import { msalService } from './utils/useAuth'
import { msalInstance, state } from './msal-config'

import Loading from './components/Loading.vue'

const { login, logout, handleRedirect, registerAuthorizationHeaderInterceptor } = msalService()

const router = useRouter();
const isLoading = ref(false);

onMounted(async () => {
  await initialize()
  await handleRedirect()
})

const initialize = async () => {
  try {
    await msalInstance.initialize()
    registerAuthorizationHeaderInterceptor()

  } catch (error) {
    console.log('Initialization error', error)
  }
}

const handleLogin = async () => {
  await login()
}

const handleLogout = () => {
  logout()
}

function setIsLoading() {
  isLoading.value = !isLoading.value;
}

const goBack = () => {
  router.go(-1);
};
</script>

<template>

  <!-- Authenticated Container -->
  <div v-if="state.isAuthenticated">
    <nav class="p-2 m-2 flex justify-between">
      <div>
        <RouterLink v-if="router.currentRoute.path !== '/'" to="/" class="bg-white font-bold py-2 px-4 rounded">Home</RouterLink>
        <a @click="goBack" class="bg-white font-bold ml-4 py-2 px-4 rounded cursor-pointer">Return</a>
      </div>
      <div>
        <a @click="handleLogout" class="bg-white font-bold ml-4 py-2 px-4 rounded cursor-pointer">Logout</a>
      </div>
    </nav>
    <main>
      <Loading v-if="isLoading" />
      <RouterView :setIsLoading="setIsLoading" />
    </main>
  </div>

  <!-- Login Container -->
  <div class="login" v-else>
    <div class="login-container">
      <p class="mb-2">Application Insights Explorer</p>
      <button @click="handleLogin" class="bg-white font-bold py-2 px-4 rounded">Login With Microsoft Account</button>
    </div>
  </div>
</template>

<style scoped>
main {
  position: relative;
}

.login {
  height: 100vh;
  width: 100vw;
  display: grid;
  place-items: center;
}

.login-container {
  text-align: center;
}
</style>
