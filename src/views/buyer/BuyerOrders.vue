<template>
  <div class="main-card">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">My Orders</h3>
      <div class="col-md-3">
        <select class="form-select" v-model="statusFilter">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processed">Processed</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>

    <!-- Order List -->
    <div class="row g-4">
      <div
        v-for="order in filteredOrders"
        :key="order.order_uuid"
        class="col-12"
      >
        <div :class="['card', 'order-card', order.status]">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div class="w-75">
                <div class="d-flex justify-content-between mb-2">
                  <h5 class="card-title">Order #{{ order.order_uuid }}</h5>
                  <span :class="['badge', statusBadgeClass(order.status)]">{{
                    order.status
                  }}</span>
                </div>
                <div class="d-flex gap-4 text-muted">
                  <div>
                    <i class="bi bi-clock-history me-1"></i>
                    <span>{{ order.date }}</span>
                  </div>
                  <div>
                    <i class="bi bi-currency-dollar me-1"></i>
                    <span>Total: Rp{{ order.total_price }}</span>
                  </div>
                </div>
              </div>
              <div class="dropdown">
                <RouterLink
                  :to="{
                    name: 'OrderDetail',
                    params: { orderUuid: order.order_uuid },
                  }"
                  class="btn btn-primary"
                  >View Details</RouterLink
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <nav class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a
            class="page-link"
            href="#"
            @click.prevent="changePage(currentPage - 1)"
            >Previous</a
          >
        </li>
        <li
          class="page-item"
          :class="{ active: page === currentPage }"
          v-for="page in totalPages"
          :key="page"
        >
          <a class="page-link" href="#" @click.prevent="changePage(page)">{{
            page
          }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a
            class="page-link"
            href="#"
            @click.prevent="changePage(currentPage + 1)"
            >Next</a
          >
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { RouterLink } from "vue-router";

const orders = ref([]);
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = 10;

const fetchOrders = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/buyer/orders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    if (response.data.status === "success") {
      orders.value = response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }
};

const filteredOrders = computed(() => {
  return orders.value.filter(
    (order) => !statusFilter.value || order.status === statusFilter.value
  );
});

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / pageSize);
});

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

onMounted(() => {
  fetchOrders();
});

const statusBadgeClass = (status) => {
  return {
    "bg-warning": status === "pending",
    "bg-primary": status === "processed",
    "bg-success": status === "shipped",
    "bg-secondary": status === "completed",
  };
};
</script>

<style scoped>
.main-card {
  max-width: 1000px;
  padding: 2rem;
  margin: 2rem auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.order-card {
  transition: transform 0.2s;
  border-left: 4px solid;
}
.order-card.pending {
  border-color: #ffc107;
}
.order-card.processed {
  border-color: #0d6efd;
}
.order-card.shipped {
  border-color: #198754;
}
.order-card.completed {
  border-color: #6c757d;
}
</style>
