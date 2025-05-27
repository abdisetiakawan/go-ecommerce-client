<template>
  <nav class="navbar navbar-expand-lg sticky-top">
    <div class="container">
      <!-- Brand Logo -->
      <RouterLink class="navbar-brand d-flex align-items-center" to="/">
        <img src="../assets/golang.png" width="40" alt="logo" class="me-2" />
        <span class="brand-text">GoShop</span>
      </RouterLink>

      <!-- Search Bar -->
      <div class="search-container d-none d-md-block flex-grow-1 mx-4">
        <input
          type="search"
          class="form-control search-input"
          placeholder="Search products..."
          @focus="router.push('/buyer/products')"
        />
        <i class="bi bi-search search-icon"></i>
      </div>

      <!-- Navigation Links -->
      <div class="nav-links">
        <RouterLink to="/buyer/products" class="nav-link" active-class="active">
          <i class="bi bi-shop"></i>
          <span>Products</span>
        </RouterLink>

        <RouterLink to="/buyer/orders" class="nav-link" active-class="active">
          <i class="bi bi-box-seam"></i>
          <span>Orders</span>
        </RouterLink>

        <!-- User Profile Dropdown -->
        <div class="profile-dropdown" ref="dropdownRef">
          <button class="profile-button" type="button" @click="toggleDropdown">
            <div class="avatar">
              {{ authStore.userName?.charAt(0).toUpperCase() || "U" }}
            </div>
            <span class="profile-name">{{ authStore.userName || "User" }}</span>
            <i
              class="bi bi-chevron-down"
              :class="{ rotate: isDropdownOpen }"
            ></i>
          </button>

          <ul class="custom-dropdown-menu" :class="{ show: isDropdownOpen }">
            <li class="custom-dropdown-header">
              <small class="text-muted">Signed in as</small>
              <div class="fw-bold">{{ authStore.userName || "User" }}</div>
            </li>
            <li class="divider"></li>
            <li>
              <RouterLink class="custom-dropdown-item" to="/profile">
                <i class="bi bi-person me-2"></i>My Profile
              </RouterLink>
            </li>
            <li>
              <RouterLink class="custom-dropdown-item" to="/buyer/orders">
                <i class="bi bi-clock-history me-2"></i>Order History
              </RouterLink>
            </li>
            <li>
              <RouterLink class="custom-dropdown-item" to="/buyer/wishlist">
                <i class="bi bi-heart me-2"></i>Wishlist
              </RouterLink>
            </li>
            <li class="divider"></li>
            <li>
              <a
                class="custom-dropdown-item danger"
                @click.prevent="handleLogout"
              >
                <i class="bi bi-box-arrow-right me-2"></i>Logout
              </a>
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
import { onMounted, ref, onBeforeUnmount } from "vue";
import Swal from "sweetalert2";

const authStore = useAuthStore();
const router = useRouter();
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeDropdown);
});

const handleLogout = async () => {
  // Add confirmation using SweetAlert2
  const result = await Swal.fire({
    title: "Logout",
    text: "Are you sure you want to logout?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, logout",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    authStore.logout();
    router.push("/login");
  }
};

onMounted(() => {
  // Initialize Bootstrap dropdown
  const dropdownElementList = document.querySelectorAll(".dropdown-toggle");
  const dropdownList = [...dropdownElementList].map(
    (dropdownToggleEl) => new bootstrap.Dropdown(dropdownToggleEl)
  );
});
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  padding: 0.8rem 0;
  z-index: 1000;
}

.brand-text {
  font-weight: 600;
  font-size: 1.2rem;
  background: linear-gradient(45deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.search-container {
  position: relative;
  max-width: 600px;
}

.search-input {
  padding-left: 40px;
  padding-right: 20px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #4b5563;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #f3f4f6;
  color: #2563eb;
}

.nav-link.active {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.nav-link i {
  font-size: 1.2rem;
}

.profile-dropdown {
  position: relative;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 8px;
  color: #4b5563;
  transition: all 0.2s ease;
}

.profile-button:hover {
  background-color: #f3f4f6;
}

.avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(45deg, #2563eb, #3b82f6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.profile-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: white;
  margin: 0;
  padding: 0.5rem;
  list-style: none;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 220px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
}

.custom-dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.custom-dropdown-header {
  padding: 0.5rem 1rem;
}

.divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0.5rem 0;
}

.custom-dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #4b5563;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.custom-dropdown-item:hover {
  background-color: #eff6ff;
  color: #2563eb;
}

.custom-dropdown-item.danger {
  color: #dc2626;
}

.custom-dropdown-item.danger:hover {
  background-color: #fef2f2;
}

.bi-chevron-down {
  transition: transform 0.2s ease;
}

.bi-chevron-down.rotate {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .search-container {
    display: none;
  }

  .nav-link span {
    display: none;
  }

  .profile-name {
    display: none;
  }
}
</style>
