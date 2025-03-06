import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import authService from "../services/auth.js";

export const useAuthStore = defineStore("auth", () => {
  const userRole = ref(localStorage.getItem("userRole") || null);
  const authToken = ref(localStorage.getItem("authToken") || null);
  const userName = ref(localStorage.getItem("userName") || null);

  async function login(credentials) {
    const result = await authService.login(credentials);
    if (result.success) {
      userRole.value = result.data.role;
      authToken.value = result.data.token;
      localStorage.setItem("authToken", result.data.token);
      localStorage.setItem("userRole", result.data.role);
      await fetchName();
    }
    return result;
  }

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    userRole.value = null;
    authToken.value = null;
    userName.value = null;
  }

  async function fetchName() {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${authToken.value}`,
          },
        }
      );

      if (response.data.status === "success") {
        userName.value = response.data.data.name;
        localStorage.setItem("userName", response.data.data.name);
        return userName.value;
      }
    } catch (error) {
      return null;
    }
  }

  return {
    userRole,
    authToken,
    login,
    logout,
    fetchName,
    userName,
  };
});
