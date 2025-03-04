<template>
  <nav class="navbar navbar-expand-lg bg-white shadow-sm">
    <div class="container">
      <RouterLink to="/seller/dashboard" class="navbar-brand">
        <img src="../assets/golang.png" width="40" alt="logo" />
      </RouterLink>

      <div class="d-flex align-items-center">
        <RouterLink to="/seller/products" class="btn btn-link text-dark">
          Products
        </RouterLink>
        <RouterLink to="/seller/orders" class="btn btn-link text-dark">
          Orders
        </RouterLink>

        <div class="dropdown">
          <button class="btn btn-link text-dark dropdown-toggle" type="button">
            {{ userName }}
          </button>
          <ul class="dropdown-menu">
            <li>
              <RouterLink to="/profile" class="dropdown-item">
                Profile
              </RouterLink>
            </li>
            <li>
              <button class="dropdown-item" @click="handleLogout">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const userName = "Seller Name";

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>
