<template>
  <div class="main-card">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">Order Management</h3>
      <div class="d-flex gap-3">
        <select
          class="form-select"
          style="width: 180px"
          v-model="statusFilter"
          @change="fetchOrders"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processed">Processed</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Order List -->
    <div class="row row-cols-1 g-3">
      <div v-for="order in orders" :key="order.order_uuid" class="col">
        <div :class="['card', 'order-card', order.status]">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div style="flex: 1">
                <div
                  class="d-flex justify-content-between align-items-center mb-2"
                >
                  <h5 class="mb-0">Order #{{ order.order_uuid }}</h5>
                  <span
                    :class="['status-badge', statusBadgeClass(order.status)]"
                    >{{ order.status }}</span
                  >
                </div>
                <div class="row">
                  <div class="col-md-4">
                    <p class="mb-1 text-muted">
                      <i class="bi bi-clock me-2"></i>{{ order.created_at }}
                    </p>
                    <p class="mb-1 text-muted">
                      <i class="bi bi-currency-dollar me-2"></i>Total: Rp{{
                        order.total_price.toLocaleString()
                      }}
                    </p>
                  </div>
                  <div class="col-md-4">
                    <p class="mb-1">{{ order.items.length }} items</p>
                    <p class="mb-1 text-muted">
                      Payment: {{ order.payment.payment_method }}
                    </p>
                  </div>
                  <div class="col-md-4">
                    <p class="mb-1">Customer: {{ order.user_name }}</p>
                  </div>
                </div>
              </div>
              <div class="dropdown ms-3">
                <button
                  class="btn btn-light rounded-circle"
                  type="button"
                  data-bs-toggle="dropdown"
                  style="width: 32px; height: 32px; padding: 0"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <RouterLink
                      :to="{
                        name: 'OrderDetail',
                        params: { orderUuid: order.order_uuid },
                      }"
                      class="dropdown-item"
                    >
                      <i class="bi bi-eye me-2"></i>View Details
                    </RouterLink>
                  </li>
                </ul>
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
          v-for="page in totalPages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
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
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { RouterLink, useRouter } from "vue-router";
import axiosInstance from "../../services/axios";

const router = useRouter();
const authStore = useAuthStore();
const orders = ref([]);
const statusFilter = ref("");
const currentPage = ref(1);
const totalPages = ref(1);

const fetchOrders = async () => {
  try {
    const response = await axiosInstance.get("/seller/orders", {
      params: {
        status: statusFilter.value,
        page: currentPage.value,
        limit: 10,
      },
    });

    if (response.data.status === "success") {
      orders.value = response.data.data;
      totalPages.value = response.data.paging.total_page;
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    // Handle unauthorized error
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
    }
  }
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchOrders();
};

const statusBadgeClass = (status) => {
  return {
    "bg-warning btn": status === "pending",
    "bg-success btn": status === "completed",
    "bg-danger btn": status === "cancelled",
  };
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.main-card {
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
  margin: 2rem auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.order-card {
  transition: transform 0.2s;
  border-left: 4px solid transparent;
}

.order-card.pending {
  border-left-color: #ffc107;
}

.order-card.completed {
  border-left-color: #198754;
}

.order-card.cancelled {
  border-left-color: #dc3545;
}

.status-badge {
  font-size: 0.9rem;
  padding: 0.35rem 0.75rem;
}
</style>
