<template>
  <div class="auth-card">
    <form @submit.prevent="handleLogin">
      <img src="../assets/golang.png" class="logo" alt="logo" />
      <h2 class="mb-4 fw-bold">Welcome Back</h2>
      <p class="text-secondary mb-4">Please login to continue</p>

      <div class="role-selection mb-4">
        <div
          class="role-btn"
          :class="{ active: selectedRole === 'seller' }"
          @click="selectedRole = 'seller'"
        >
          <h5 class="mb-1">Seller</h5>
          <p class="text-muted small mb-0">I want to sell products</p>
        </div>
        <div
          class="role-btn"
          :class="{ active: selectedRole === 'buyer' }"
          @click="selectedRole = 'buyer'"
        >
          <h5 class="mb-1">Buyer</h5>
          <p class="text-muted small mb-0">I want to buy products</p>
        </div>
      </div>

      <div class="form-floating mb-3">
        <input
          type="email"
          class="form-control"
          id="loginEmail"
          placeholder="name@example.com"
          v-model="email"
          required
        />
        <label for="loginEmail">Email address</label>
      </div>

      <div class="form-floating mb-4">
        <input
          type="password"
          class="form-control"
          id="loginPassword"
          placeholder="Password"
          v-model="password"
          required
        />
        <label for="loginPassword">Password</label>
      </div>

      <button
        class="w-100 btn btn-primary btn-lg mb-3"
        type="submit"
        :disabled="loading"
      >
        {{ loading ? "Loading..." : "Sign In" }}
      </button>

      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            id="rememberMe"
            v-model="rememberMe"
            disabled
          />
          <label class="form-check-label" for="rememberMe">Remember me</label>
        </div>
        <RouterLink to="/forgot-password" class="text-decoration-none">
          Forgot password?
        </RouterLink>
      </div>

      <hr class="my-4" />
      <p class="text-center text-secondary">
        Don't have an account?
        <RouterLink to="/register" class="text-primary text-decoration-none">
          Sign Up
        </RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore(); // Get the store instance
const router = useRouter();
const email = ref("");
const password = ref("");
const selectedRole = ref("");
const errorMessage = ref("");
const loading = ref(false);

const handleLogin = async () => {
  errorMessage.value = "";
  loading.value = true;

  try {
    const result = await authStore.login({
      email: email.value,
      password: password.value,
      role: selectedRole.value,
    });

    if (result.success) {
      await router.push(
        authStore.userRole === "seller"
          ? "/seller/dashboard"
          : "/buyer/dashboard"
      );
    } else {
      errorMessage.value = result.message;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
body {
  background: #f8f9fa;
  height: 100vh;
  display: flex;
  align-items: center;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  margin: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.logo {
  width: 80px;
  margin-bottom: 1.5rem;
}
.form-control:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.role-selection {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.role-btn {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.role-btn.active {
  border-color: #6366f1;
  background-color: rgba(99, 102, 241, 0.1);
}
</style>
