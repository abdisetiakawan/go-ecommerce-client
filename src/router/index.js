import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: () => {
        const userRole = localStorage.getItem("userRole");
        if (userRole === "seller") return "/seller/dashboard";
        if (userRole === "buyer") return "/buyer/dashboard";
        return "/login";
      },
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("../views/Login.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/seller/dashboard",
      name: "SellerDashboard",
      component: () => import("../views/seller/Dashboard.vue"),
      meta: { requiresAuth: true, role: "seller" },
    },
    {
      path: "/buyer/dashboard",
      name: "BuyerDashboard",
      component: () => import("../views/buyer/Dashboard.vue"),
      meta: { requiresAuth: true, role: "buyer" },
    },
    {
      path: "/buyer/products",
      name: "BuyerProducts",
      component: () => import("../views/buyer/Products.vue"),
      meta: { requiresAuth: true, role: "buyer" },
    },
    {
      path: "/profile",
      name: "Profile",
      component: () => import("../views/Profile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:catchAll(.*)",
      name: "NotFound",
      component: () => import("../views/NotFound.vue"),
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // redirect user kalau dia ingin mengakses halaman guest (contohnya : halaman login)
  if (to.meta.requiresGuest && authStore.authToken) {
    return authStore.userRole === "seller"
      ? "/seller/dashboard"
      : "/buyer/dashboard";
  }

  if (to.meta.requiresAuth && !authStore.authToken) {
    return "/login";
  }

  if (to.meta.role && to.meta.role !== authStore.userRole) {
    return authStore.userRole === "seller"
      ? "/seller/dashboard"
      : "/buyer/dashboard";
  }

  return true;
});

export default router;
