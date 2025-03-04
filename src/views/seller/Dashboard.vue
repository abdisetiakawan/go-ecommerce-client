<!-- Data DUmmy -->

<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <div class="col-md-3 bg-light border-end vh-100 p-4">
        <div class="d-flex flex-column">
          <h4 class="mb-4">Seller Panel</h4>
          <router-link
            to="/seller/products"
            class="btn btn-outline-dark text-start mb-2"
          >
            <i class="bi bi-box-seam me-2"></i>Manage Products
          </router-link>
          <router-link
            to="/seller/orders"
            class="btn btn-outline-dark text-start mb-2"
          >
            <i class="bi bi-receipt me-2"></i>Orders
          </router-link>
          <router-link
            to="/seller/analytics"
            class="btn btn-outline-dark text-start mb-2"
          >
            <i class="bi bi-graph-up me-2"></i>Analytics
          </router-link>
        </div>
      </div>

      <!-- Main Content -->
      <div class="col-md-9 p-4">
        <h3 class="mb-4">Dashboard Seller</h3>

        <!-- Stats Cards -->
        <div class="row g-4 mb-4">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-secondary">Total Penjualan</h5>
                <h2 class="fw-bold">Rp12.450.000</h2>
                <span class="text-success"
                  ><i class="bi bi-arrow-up"></i> 15%</span
                >
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-secondary">Pesanan Baru</h5>
                <h2 class="fw-bold">8</h2>
                <span class="text-warning">Pending</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-secondary">Total Produk</h5>
                <h2 class="fw-bold">24</h2>
                <span class="text-success">Active</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Pesanan Terbaru</h5>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in recentOrders" :key="order.id">
                    <td>#{{ order.id }}</td>
                    <td>{{ order.customer }}</td>
                    <td>
                      <span class="badge" :class="statusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                    <td>{{ order.total }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const recentOrders = ref([
  { id: 1234, customer: "John Doe", status: "pending", total: "Rp450.000" },
  { id: 1235, customer: "Jane Smith", status: "shipped", total: "Rp780.000" },
  {
    id: 1236,
    customer: "Bob Johnson",
    status: "completed",
    total: "Rp1.230.000",
  },
]);

const statusClass = (status) => {
  return {
    pending: "bg-warning",
    shipped: "bg-info",
    completed: "bg-success",
  }[status];
};

if (!authStore.authToken) {
  router.push("/login");
}
</script>
