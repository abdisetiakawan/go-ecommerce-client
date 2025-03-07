<!-- Data Dummy -->

<template>
  <div class="container">
    <div class="row">
      <!-- Main Content -->
      <div class="col-12 p-4">
        <h3 class="mb-4">Dashboard Buyer</h3>

        <!-- Account Summary -->
        <div class="row g-4 mb-4">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-secondary">Total Belanja</h5>
                <h2 class="fw-bold">Rp3.450.000</h2>
                <span class="text-success"
                  ><i class="bi bi-cart-check"></i> 15 orders</span
                >
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-secondary">Pesanan Aktif</h5>
                <h2 class="fw-bold">3</h2>
                <span class="text-primary">Dalam Proses</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-secondary">Wishlist</h5>
                <h2 class="fw-bold">8</h2>
                <span class="text-danger"
                  ><i class="bi bi-heart"></i> Items</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <h5 class="card-title mb-4">Pesanan Saya</h5>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Produk</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in recentOrders" :key="order.id">
                    <td>#{{ order.id }}</td>
                    <td>{{ order.product }}</td>
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

        <!-- Recommended Products -->
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Rekomendasi Untuk Anda</h5>
            <div class="row g-4">
              <div
                class="col-md-3"
                v-for="product in recommendedProducts"
                :key="product.id"
              >
                <div class="card product-card">
                  <img
                    :src="product.image"
                    class="card-img-top"
                    alt="product"
                  />
                  <div class="card-body">
                    <h6 class="card-title">{{ product.name }}</h6>
                    <p class="text-danger fw-bold">{{ product.price }}</p>
                  </div>
                </div>
              </div>
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

const router = useRouter();

// Contoh data
const recentOrders = ref([
  {
    id: 1234,
    product: "Headphone Premium",
    status: "shipped",
    total: "Rp450.000",
  },
  { id: 1235, product: "Smartwatch", status: "processing", total: "Rp780.000" },
]);

const recommendedProducts = ref([
  {
    id: 1,
    name: "Wireless Speaker",
    price: "Rp299.000",
    image: "https://placehold.co/100",
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: "Rp599.000",
    image: "https://placehold.co/100",
  },
]);

const statusClass = (status) => {
  return {
    processing: "bg-warning",
    shipped: "bg-info",
    delivered: "bg-success",
  }[status];
};

const authStore = useAuthStore();

if (!authStore.authToken) {
  router.push("/login");
}
</script>

<style scoped>
.product-card {
  transition: transform 0.2s;
}
.product-card:hover {
  transform: translateY(-5px);
  cursor: pointer;
}
</style>
