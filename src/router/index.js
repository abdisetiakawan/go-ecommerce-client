import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Checkout from "../views/Checkout.vue";
import OrderDetail from "../views/OrderDetail.vue";
import BuyerOrders from "../views/buyer/BuyerOrders.vue";
import SellerProducts from "../views/SellerProducts.vue";
import Cookies from "js-cookie";

const routes = [
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
    path: "/register",
    name: "Register",
    component: () => import("../views/Register.vue"),
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
    path: "/buyer/orders",
    name: "BuyerOrders",
    component: BuyerOrders,
    meta: { requiresAuth: true, role: "buyer" },
  },
  {
    path: "/seller/products",
    name: "SellerProducts",
    component: SellerProducts,
    meta: { requiresAuth: true, role: "seller" },
  },
  {
    path: "/seller/orders",
    name: "SellerOrders",
    component: () => import("../views/seller/SellerOrders.vue"),
    meta: { requiresAuth: true, role: "seller" },
  },
  {
    path: "/seller/orders/:orderUuid",
    name: "OrderDetailSeller",
    component: () => import("../views/seller/OrderDetailSeller.vue"),
    meta: { requiresAuth: true, role: "seller" },
    props: true,
  },
  {
    path: "/seller/edit-product/:productUuid",
    name: "EditProduct",
    props: true,
  },
  {
    path: "/seller/store",
    name: "Store",
    component: () => import("../views/seller/Store.vue"),
    meta: { requiresAuth: true, role: "seller" },
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: Checkout,
    props: (route) => ({
      cartItems: JSON.parse(route.query.cartItems),
      cartTotal: Number(route.query.cartTotal),
    }),
  },
  {
    path: "/orders/:orderUuid",
    name: "OrderDetail",
    component: OrderDetail,
    props: true,
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const hasAuthToken = Cookies.get("authToken");

  // Redirect jika mencoba akses halaman guest (login)
  if (to.meta.requiresGuest && hasAuthToken) {
    return authStore.userRole === "seller"
      ? "/seller/dashboard"
      : "/buyer/dashboard";
  }

  // Redirect ke login jika tidak ada token
  if (to.meta.requiresAuth && !hasAuthToken) {
    return "/login";
  }

  // Validasi role
  if (to.meta.role && to.meta.role !== authStore.userRole) {
    return authStore.userRole === "seller"
      ? "/seller/dashboard"
      : "/buyer/dashboard";
  }

  return true;
});

export default router;
