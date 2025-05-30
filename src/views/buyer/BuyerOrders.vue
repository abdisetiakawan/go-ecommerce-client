<template>
  <div class="main-card">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">My Orders</h3>
      <div class="search-container">
        <input
          type="text"
          class="form-control search-input"
          v-model="searchQuery"
          placeholder="Search orders..."
        />
        <i class="bi bi-search search-icon"></i>
      </div>
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs nav-fill mb-4">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: statusFilter === '' }"
          @click.prevent="handleStatusChange('')"
          href="#"
        >
          All Orders
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: statusFilter === 'pending' }"
          @click.prevent="handleStatusChange('pending')"
          href="#"
        >
          <i class="bi bi-clock-history me-1"></i>Pending
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: statusFilter === 'processed' }"
          @click.prevent="handleStatusChange('processed')"
          href="#"
        >
          <i class="bi bi-box-seam me-1"></i>Processed
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: statusFilter === 'shipped' }"
          @click.prevent="handleStatusChange('shipped')"
          href="#"
        >
          <i class="bi bi-truck me-1"></i>Shipped
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: statusFilter === 'completed' }"
          @click.prevent="handleStatusChange('completed')"
          href="#"
        >
          <i class="bi bi-check-circle me-1"></i>Completed
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: statusFilter === 'cancelled' }"
          @click.prevent="handleStatusChange('cancelled')"
          href="#"
        >
          <i class="bi bi-x-circle me-1"></i>Cancelled
        </a>
      </li>
    </ul>

    <!-- Display per page selector -->
    <div class="d-flex justify-content-end mb-3">
      <select
        class="form-select form-select-sm w-auto"
        v-model="limit"
        @change="handleLimitChange"
      >
        <option value="5">5 per page</option>
        <option value="10">10 per page</option>
        <option value="20">20 per page</option>
      </select>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!orders.length" class="empty-state">
      <i class="bi bi-inbox display-1 text-muted"></i>
      <h4 class="mt-3">No Orders Found</h4>
      <p class="text-muted">
        {{ getEmptyStateMessage() }}
      </p>
      <RouterLink to="/buyer/products" class="btn btn-primary">
        Browse Products
      </RouterLink>
    </div>

    <!-- Order List -->
    <div v-else class="row g-4">
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
                  <span :class="['badge', statusBadgeClass(order.status)]">
                    {{ order.status }}
                  </span>
                </div>
                <div class="d-flex gap-4 text-muted">
                  <div>
                    <i class="bi bi-clock-history me-1"></i>
                    <span>{{ formatDate(order.date) }}</span>
                  </div>
                  <div>
                    <i class="bi bi-currency-dollar me-1"></i>
                    <span>Total: Rp{{ formatPrice(order.total_price) }}</span>
                  </div>
                </div>
              </div>
              <RouterLink
                :to="{
                  name: 'OrderDetail',
                  params: { orderUuid: order.order_uuid },
                }"
                class="btn btn-outline-primary"
              >
                View Details
              </RouterLink>
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
          >
            <i class="bi bi-chevron-left"></i>
          </a>
        </li>
        <li
          class="page-item"
          :class="{ active: page === currentPage }"
          v-for="page in pageRange"
          :key="page"
        >
          <a class="page-link" href="#" @click.prevent="changePage(page)">
            {{ page }}
          </a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" @click.prevent="changePage(currentPage + 1)">
            <i class="bi bi-chevron-right"></i>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RouterLink } from "vue-router";
import axiosInstance from "../../services/axios"; // Import axios instance
import { useAuthStore } from "../../stores/auth"; // Import auth store

const authStore = useAuthStore();
const orders = ref([]);
const statusFilter = ref("");
const currentPage = ref(1);
const limit = ref(10);
const totalPages = ref(1);
const isLoading = ref(false);

// Add new ref for search
const searchQuery = ref("");

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
    // Menggunakan axiosInstance yang sudah dikonfigurasi
    const response = await axiosInstance.get("/buyer/orders", {
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

    // Handle unauthorized error
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
    }
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

const handleStatusChange = (status) => {
  router.push({
    name: "BuyerOrders",
    query: {
      ...route.query,
      page: 1,
      status: status,
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
    "bg-primary": status === "processed",
    "bg-purple": status === "shipped",
    "bg-success": status === "completed",
  };
};

// Add computed property for filtered orders
const filteredOrders = computed(() => {
  if (!searchQuery.value) return orders.value;

  const query = searchQuery.value.toLowerCase();
  return orders.value.filter(
    (order) =>
      order.order_uuid.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.total_price.toString().includes(query)
  );
});

// Add date formatter
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Add price formatter
const formatPrice = (price) => {
  return Number(price).toLocaleString("id-ID");
};

// Add empty state message helper
const getEmptyStateMessage = () => {
  if (statusFilter.value) {
    return `No ${statusFilter.value} orders found`;
  }
  if (searchQuery.value) {
    return "No orders match your search criteria";
  }
  return "You haven't placed any orders yet";
};
</script>

<style scoped>
/* Add new styles */
.search-container {
  position: relative;
  width: 300px;
}

.search-input {
  padding-left: 35px;
  border-radius: 20px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  padding: 0.75rem 1rem;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.1);
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-bottom: 2px solid #0d6efd;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.order-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Status-specific card borders */
.order-card.pending {
  border-left: 4px solid #ffc107;
}
.order-card.processed {
  border-left: 4px solid #0d6efd;
}
.order-card.shipped {
  border-left: 4px solid #6f42c1;
}
.order-card.completed {
  border-left: 4px solid #198754;
}
.order-card.cancelled {
  border-left: 4px solid #dc3545;
}

.bg-purple {
  background-color: #6f42c1 !important;
  color: white;
}

/* Existing pagination styles */
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
</style>
