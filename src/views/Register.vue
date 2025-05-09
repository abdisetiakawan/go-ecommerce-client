<template>
  <div class="min-vh-100 d-flex align-items-center bg-light">
    <div class="auth-card">
      <form @submit.prevent="handleRegister">
        <img src="../assets/golang.png" class="logo" alt="logo" />
        <h2 class="mb-4 fw-bold">Create Account</h2>
        <p class="text-secondary mb-4">
          Please fill in your details to register
        </p>

        <!-- Role Selection -->
        <div class="role-selection mb-4">
          <div
            class="role-btn"
            :class="{
              active: form.role === 'seller',
              'is-invalid': errors.Role,
            }"
            @click="setRole('seller')"
          >
            <h5 class="mb-1">Seller</h5>
            <p class="text-muted small mb-0">I want to sell products</p>
          </div>
          <div
            class="role-btn"
            :class="{
              active: form.role === 'buyer',
              'is-invalid': errors.Role,
            }"
            @click="setRole('buyer')"
          >
            <h5 class="mb-1">Buyer</h5>
            <p class="text-muted small mb-0">I want to buy products</p>
          </div>
        </div>
        <div v-if="errors.Role" class="invalid-feedback d-block mb-3">
          {{ errors.Role.message }}
        </div>

        <!-- Name Input -->
        <div class="form-floating mb-3">
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.Name }"
            id="name"
            placeholder="Enter your name"
            v-model="form.name"
            required
          />
          <label for="name">Full Name</label>
          <div v-if="errors.Name" class="invalid-feedback">
            {{ errors.Name.message }}
          </div>
        </div>

        <!-- Username Input -->
        <div class="form-floating mb-3">
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.Username }"
            id="username"
            placeholder="Choose a username"
            v-model="form.username"
            required
          />
          <label for="username">Username</label>
          <div v-if="errors.Username" class="invalid-feedback">
            {{ errors.Username.message }}
          </div>
        </div>

        <!-- Email Input -->
        <div class="form-floating mb-3">
          <input
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errors.Email }"
            id="email"
            placeholder="name@example.com"
            v-model="form.email"
            required
          />
          <label for="email">Email address</label>
          <div v-if="errors.Email" class="invalid-feedback">
            {{ errors.Email.message }}
          </div>
        </div>

        <!-- Password Input -->
        <div class="form-floating mb-3">
          <input
            type="password"
            class="form-control"
            :class="{ 'is-invalid': errors.Password }"
            id="password"
            placeholder="Choose a password"
            v-model="form.password"
            required
          />
          <label for="password">Password</label>
          <div v-if="errors.Password" class="invalid-feedback">
            {{ errors.Password.message }}
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="form-floating mb-4">
          <input
            type="password"
            class="form-control"
            :class="{ 'is-invalid': errors.ConfirmPassword }"
            id="confirmPassword"
            placeholder="Confirm your password"
            v-model="form.confirmPassword"
            required
          />
          <label for="confirmPassword">Confirm Password</label>
          <div v-if="errors.ConfirmPassword" class="invalid-feedback">
            {{ errors.ConfirmPassword.message }}
          </div>
        </div>

        <!-- Submit Button -->
        <button
          class="w-100 btn btn-primary btn-lg mb-3"
          type="submit"
          :disabled="loading"
          style="background: #6366f1; border: none"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          {{ loading ? "Creating Account..." : "Create Account" }}
        </button>

        <!-- General Error Message -->
        <div v-if="generalError" class="alert alert-danger">
          {{ generalError }}
        </div>

        <hr class="my-4" />
        <p class="text-center text-secondary">
          Already have an account?
          <RouterLink to="/login" class="text-primary text-decoration-none">
            Sign In
          </RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import axiosInstance from "../services/axios";

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
});

const errors = reactive({});
const loading = ref(false);
const generalError = ref("");

const setRole = (role) => {
  form.role = role;
  if (errors.Role) {
    delete errors.Role;
  }
};

const handleRegister = async () => {
  loading.value = true;
  generalError.value = "";
  // Clear previous errors
  Object.keys(errors).forEach((key) => delete errors[key]);

  try {
    // Create request body with correct field name
    const requestBody = {
      name: form.name,
      username: form.username,
      email: form.email,
      password: form.password,
      confirm_password: form.confirmPassword, // Changed to match backend
      role: form.role,
    };

    const response = await axiosInstance.post("/auth/register", requestBody);

    if (response.data.status === "success") {
      // Auto login after successful registration
      const loginResult = await authStore.login({
        email: form.email,
        password: form.password,
        role: form.role,
      });

      if (loginResult.success) {
        router.push(
          form.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard"
        );
      }
    }
  } catch (error) {
    console.error("Registration error:", error);
    if (error.response?.data?.errors?.errors) {
      const backendErrors = error.response.data.errors.errors;
      if (backendErrors.confirm_password) {
        errors.ConfirmPassword = backendErrors.confirm_password;
      }
      Object.assign(errors, backendErrors);
    } else {
      generalError.value =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
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

.role-btn.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
}
</style>
