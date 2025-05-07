<template>
  <div id="app">
    <NavbarSeller v-if="authStore.userRole === 'seller'" />
    <NavbarBuyer v-else-if="authStore.userRole === 'buyer'" />
    <RouterView />
  </div>
</template>

<script setup>
import { useAuthStore } from "./stores/auth";
import NavbarSeller from "./components/NavbarSeller.vue";
import NavbarBuyer from "./components/NavbarBuyer.vue";
import { watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";

const router = useRouter();
const authStore = useAuthStore();

// Auto redirect jika status berubah
watch(
  () => authStore.userRole,
  (newRole) => {
    if (!newRole) {
      router.push("/login");
    }
  }
);

// Check authentication status on app mount
onMounted(() => {
  const token = Cookies.get("authToken");
  if (!token && router.currentRoute.value.meta.requiresAuth) {
    router.push("/login");
  }
});
</script>
