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
import { watch } from "vue";
import { useRouter } from "vue-router";

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
</script>
