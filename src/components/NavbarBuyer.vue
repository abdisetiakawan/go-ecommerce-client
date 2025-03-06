<template>
  <nav class="navbar navbar-expand-lg bg-white shadow-sm">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">
        <img src="../assets/golang.png" width="40" alt="logo" />
      </RouterLink>
      <div class="d-flex align-items-center">
        <RouterLink to="/products" class="btn btn-link text-dark"
          >Products</RouterLink
        >
        <RouterLink to="/orders" class="btn btn-link text-dark"
          >Orders</RouterLink
        >
        <div class="dropdown">
          <button
            class="btn btn-link text-dark dropdown-toggle text-capitalize"
            type="button"
            data-bs-toggle="dropdown"
          >
            {{ authStore.userName }}
          </button>
          <ul class="dropdown-menu">
            <li>
              <RouterLink class="dropdown-item" to="/profile"
                >Profile</RouterLink
              >
            </li>
            <li>
              <a class="dropdown-item" @click.prevent="handleLogout">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { onMounted } from "vue";
const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

onMounted(() => {
  if (!authStore.authToken) {
    router.push("/login");
  } else {
    authStore.fetchName();
  }
});
</script>

<style scoped>
.dropdown-item {
  transition: all 0.2s;
}
.dropdown-item:hover {
  background-color: #f8f9fa;
}
.btn-link {
  text-decoration: none;
}
</style>
