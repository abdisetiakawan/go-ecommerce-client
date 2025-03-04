import { defineStore } from "pinia";
import { ref } from "vue";
import authService from "../services/auth.js";

export const useAuthStore = defineStore("auth", () => {
  const userRole = ref(localStorage.getItem("userRole") || null);
  const authToken = ref(localStorage.getItem("authToken") || null);

  async function login(credentials) {
    const result = await authService.login(credentials);
    if (result.success) {
      userRole.value = result.data.role;
      authToken.value = result.data.token;
      localStorage.setItem("authToken", result.data.token);
      localStorage.setItem("userRole", result.data.role);
    }
    return result;
  }

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    userRole.value = null;
    authToken.value = null;
  }

  return {
    userRole,
    authToken,
    login,
    logout,
  };
});
