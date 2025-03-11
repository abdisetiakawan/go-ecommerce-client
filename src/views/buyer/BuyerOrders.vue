<template>
  <div class="main-card">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">My Orders</h3>
      <div class="d-flex gap-2">
        <div class="col-md-3">
          <select
            class="form-select"
            v-model="statusFilter"
            @change="handleStatusChange"
          >
            <option value="">All Status</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <div class="col-md-3">
          <select
            class="form-select"
            v-model="limit"
            @change="handleLimitChange"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Order List -->
    <div v-else class="row g-4">
      <div v-for="order in orders" :key="order.order_uuid" class="col-12">
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
    <nav v-if="totalPages > 0" class="mt-4">
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
          v-for="page in pageRange"
          :key="page"
        >
          <a class="page-link" href="#" @click.prevent="changePage(page)">{{
            page
          }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" @click.prevent="changePage(currentPage + 1)"
            >Next</a
          >
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { RouterLink } from "vue-router";

const orders = ref([]);
const statusFilter = ref("");
const currentPage = ref(1);
const limit = ref(10);
const totalPages = ref(1);
const isLoading = ref(false);

const route = useRoute();
const router = useRouter();

const pageRange = computed(() => {
  const range = [];
  const maxVisiblePages = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
  let end = Math.min(totalPages.value, start + maxVisiblePages - 1);

  if (end - start < maxVisiblePages - 1) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
});

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get("http://localhost:3000/api/buyer/orders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      params: {
        status: statusFilter.value,
        page: currentPage.value,
        limit: limit.value,
      },
    });

    if (response.data.status === "success") {
      orders.value = response.data.data;
      totalPages.value = Math.max(1, response.data.paging.total_page || 1);

      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
        router.replace({
          query: { ...route.query, page: totalPages.value },
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    orders.value = [];
    totalPages.value = 1;
  } finally {
    isLoading.value = false;
  }
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;

  router.push({
    name: "BuyerOrders",
    query: {
      ...route.query,
      page: page,
    },
  });
};

const handleStatusChange = () => {
  router.push({
    name: "BuyerOrders",
    query: {
      ...route.query,
      page: 1,
      status: statusFilter.value,
    },
  });
};

const handleLimitChange = () => {
  router.push({
    name: "BuyerOrders",
    query: {
      ...route.query,
      page: 1,
      limit: limit.value,
    },
  });
};

onMounted(() => {
  currentPage.value = parseInt(route.query.page) || 1;
  limit.value = parseInt(route.query.limit) || 10;
  statusFilter.value = route.query.status || "";
});

watch(
  () => route.query,
  (newQuery) => {
    currentPage.value = parseInt(newQuery.page) || 1;
    limit.value = parseInt(newQuery.limit) || 10;
    statusFilter.value = newQuery.status || "";
    fetchOrders();
  },
  { immediate: true }
);

const statusBadgeClass = (status) => {
  return {
    "bg-danger": status === "cancelled",
    "bg-warning text-dark": status === "pending",
    "bg-primary": status === "processing",
    "bg-success": status === "delivered",
  };
};
</script>

<style scoped>
.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.pagination .page-link {
  color: #0d6efd;
  cursor: pointer;
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
}

.order-card {
  transition: transform 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
}

.bg-warning.text-dark {
  color: var(--bs-dark) !important;
}
</style>
