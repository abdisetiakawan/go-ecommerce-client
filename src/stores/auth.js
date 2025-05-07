import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import Cookies from "js-cookie";

export const useAuthStore = defineStore("auth", () => {
  const userRole = ref(Cookies.get("userRole") || null);
  const authToken = ref(Cookies.get("authToken") || null);
  const userName = ref(Cookies.get("userName") || null);

  async function login(credentials) {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/auth/login`,
        credentials,
        {
          withCredentials: true, // Penting untuk menerima cookies dari server
        }
      );

      if (response.data.status === "success") {
        const { role, access_token } = response.data.data;

        // Set cookies dengan opsi yang aman
        Cookies.set("authToken", access_token, {
          secure: true,
          sameSite: "strict",
          expires: 7, // expires dalam 7 hari
        });
        Cookies.set("userRole", role, {
          secure: true,
          sameSite: "strict",
          expires: 7,
        });

        userRole.value = role;
        authToken.value = access_token;

        await fetchName();

        return {
          success: true,
          data: { role, token: access_token },
        };
      }
      return { success: false, message: "Login failed" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login error",
      };
    }
  }

  function logout() {
    // Hapus cookies
    Cookies.remove("authToken");
    Cookies.remove("userRole");
    Cookies.remove("userName");

    // Reset state
    userRole.value = null;
    authToken.value = null;
    userName.value = null;
  }

  async function fetchName() {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/user/profile`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken.value}`,
          },
        }
      );

      if (response.data.status === "success") {
        const name = response.data.data.name;
        Cookies.set("userName", name, {
          secure: true,
          sameSite: "strict",
          expires: 7,
        });
        userName.value = name;
        return name;
      }
    } catch (error) {
      return null;
    }
  }

  return {
    userRole,
    authToken,
    userName,
    login,
    logout,
    fetchName,
  };
});
