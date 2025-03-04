import axios from "axios";

export default {
  async login(credentials) {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/auth/login`,
        credentials
      );

      console.log(response);
      if (response.data.status === "success") {
        // Simpan token dan role ke localStorage
        localStorage.setItem("authToken", response.data.data.access_token);
        localStorage.setItem("userRole", response.data.data.role);

        return {
          success: true,
          data: {
            role: response.data.data.role,
            token: response.data.data.access_token,
          },
        };
      }
      return { success: false, message: "Login gagal" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login error",
      };
    }
  },

  logout() {
    localStorage.removeItem("authToken");
  },

  getAuthHeader() {
    const token = localStorage.getItem("authToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  },

  isAuthenticated() {
    return !!localStorage.getItem("authToken");
  },
};
