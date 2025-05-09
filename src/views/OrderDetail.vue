<template>
  <!-- Loading State -->
  <div
    v-if="loading"
    class="position-fixed top-0 start-0 end-0 bottom-0 bg-white d-flex justify-content-center align-items-center"
    style="z-index: 1050"
  >
    <div class="text-center">
      <div
        class="spinner-border text-primary"
        style="width: 3rem; height: 3rem"
        role="status"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Memuat detail pesanan...</p>
    </div>
  </div>

  <!-- Main Content -->
  <div v-else class="container-lg py-4 animate__animated animate__fadeIn">
    <div class="mb-4">
      <RouterLink to="/buyer/orders" class="btn btn-link text-decoration-none">
        <i class="bi bi-arrow-left me-2"></i>Back to Orders
      </RouterLink>

      <!-- Order Header -->
      <div
        class="d-flex justify-content-between align-items-center mt-3 bg-light p-4 rounded-3"
      >
        <div>
          <span class="text-muted fs-6">Order ID</span>
          <h2 class="mb-0 fw-bold">#{{ orderData.order_uuid }}</h2>
          <p class="text-muted mb-0 mt-2">
            <i class="bi bi-calendar3 me-2"></i>
            {{ formatDate(orderData.created_at) }}
          </p>
        </div>
        <div class="text-end">
          <span :class="['status-pill', `status-${orderData.status}`]">
            {{ formattedStatus }}
          </span>
          <div class="mt-3" v-if="orderData.status === 'pending'">
            <button
              class="btn btn-outline-danger btn-sm me-2"
              @click="showCancelModal = true"
            >
              <i class="bi bi-x-circle me-1"></i>Cancel Order
            </button>
            <button
              class="btn btn-primary btn-sm"
              @click="checkoutOrder"
              :disabled="processingCheckout"
            >
              <i class="bi bi-credit-card me-1"></i>
              {{ processingCheckout ? "Processing..." : "Checkout Now" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Content -->
    <div class="row g-4">
      <!-- Order Items Card -->
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-cart3 me-2"></i>Order Items
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div
                v-for="item in orderData.items"
                :key="item.order_item_uuid"
                class="list-group-item p-3"
              >
                <div class="d-flex align-items-center">
                  <div class="flex-shrink-0">
                    <div class="item-image-placeholder">
                      <i class="bi bi-box-seam"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <h6 class="mb-1">{{ item.product_name }}</h6>
                    <span class="text-muted">
                      <i class="bi bi-x me-1"></i>{{ item.quantity }} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary Card -->
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-info-circle me-2"></i>Order Summary
            </h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled mb-0">
              <li
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <span class="text-muted">Payment Method</span>
                <span class="badge bg-light text-dark">
                  <i class="bi bi-cash me-1"></i>{{ paymentMethod }}
                </span>
              </li>

              <li class="mb-3">
                <span class="text-muted d-block mb-2">Shipping Address</span>
                <div class="p-3 bg-light rounded">
                  <p class="mb-1 fw-medium">
                    {{ orderData.shipping?.address }}
                  </p>
                  <p class="mb-0 text-muted small">
                    {{ orderData.shipping?.city }},
                    {{ orderData.shipping?.province }} <br />{{
                      orderData.shipping?.postal_code
                    }}
                  </p>
                </div>
              </li>

              <li class="pt-3 mt-3 border-top">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-bold">Total Amount</span>
                  <span class="fs-5 fw-bold text-primary">
                    Rp {{ formattedTotalPrice }}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Cancel Order Modal -->
  <div
    v-if="showCancelModal"
    class="modal d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Konfirmasi Pembatalan</h5>
          <button
            type="button"
            class="btn-close"
            @click="showCancelModal = false"
          ></button>
        </div>
        <div class="modal-body">
          <p>Anda yakin ingin membatalkan pesanan ini?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCancelModal = false">
            Tutup
          </button>
          <button class="btn btn-danger" @click="cancelOrder">
            Batalkan Pesanan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import axiosInstance from "../services/axios";

const route = useRoute();
const authStore = useAuthStore();

const orderData = ref({
  payment: {},
  shipping: {},
  items: [],
});
const loading = ref(true);
const showCancelModal = ref(false);
const processingCheckout = ref(false);

const formattedStatus = computed(() => {
  return orderData.value.status?.toUpperCase() || "BELUM DIKETAHUI";
});

const statusBadgeClass = computed(() => ({
  "status-badge": true,
  "bg-primary": orderData.value.status === "processed",
  "bg-warning": orderData.value.status === "pending",
  "bg-success": orderData.value.status === "completed",
  "bg-danger": orderData.value.status === "cancelled",
  "bg-secondary": !orderData.value.status,
}));

const paymentMethod = computed(() => {
  return (
    orderData.value.payment?.payment_method?.toUpperCase() || "Belum dipilih"
  );
});

const shippingAddress = computed(() => {
  const shipping = orderData.value.shipping || {};
  return `
    ${shipping.address || "Alamat tidak tersedia"}\n
    ${shipping.city || ""}, ${shipping.province || ""} ${shipping.postal_code || ""}
  `
    .trim()
    .replace(/\n\s+/g, "\n");
});

const formattedTotalPrice = computed(() => {
  return Number(orderData.value.total_price || 0).toLocaleString("id-ID");
});

const fetchOrder = async () => {
  try {
    loading.value = true;
    const response = await axiosInstance.get(
      `/buyer/orders/${route.params.orderUuid}`
    );

    if (response.data.status === "success") {
      orderData.value = {
        ...response.data.data,
        payment: response.data.data.payment || {},
        shipping: response.data.data.shipping || {},
        items: response.data.data.items || [],
      };
    }
  } catch (error) {
    console.error("Error fetching order:", {
      message: error.message,
      response: error.response?.data,
      code: error.code,
    });
    alert(
      `Gagal memuat pesanan: ${error.response?.data?.message || error.message}`
    );
  } finally {
    loading.value = false;
  }
};

const cancelOrder = async () => {
  try {
    const response = await axiosInstance.patch(
      `/buyer/orders/${route.params.orderUuid}/cancel`
    );

    if (response.data.status === "success") {
      orderData.value = {
        ...response.data.data,
        payment: response.data.data.payment || {},
        shipping: response.data.data.shipping || {},
        items: response.data.data.items || [],
      };
      showCancelModal.value = false;
      alert("Pesanan berhasil dibatalkan");
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    alert(
      `Gagal membatalkan pesanan: ${error.response?.data?.message || error.message}`
    );
  }
};

const checkoutOrder = async () => {
  try {
    processingCheckout.value = true;
    const response = await axiosInstance.patch(
      `/buyer/orders/${route.params.orderUuid}/checkout`
    );

    if (response.data.status === "success") {
      orderData.value = {
        ...response.data.data,
        payment: response.data.data.payment || {},
        shipping: response.data.data.shipping || {},
        items: response.data.data.items || [],
      };
      alert("Checkout berhasil");
    }
  } catch (error) {
    console.error("Error during checkout:", error);
    alert(
      `Gagal melakukan checkout: ${error.response?.data?.message || error.message}`
    );
  } finally {
    processingCheckout.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

watch(
  () => route.params.orderUuid,
  (newVal) => {
    if (newVal) fetchOrder();
  },
  { immediate: true }
);
</script>

<style scoped>
.whitespace-pre-line {
  white-space: pre-line;
}

.animate__animated {
  animation-duration: 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate__fadeIn {
  animation-name: fadeIn;
}

.status-pill {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 500;
  font-size: 0.875rem;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-processed {
  background-color: #cce5ff;
  color: #004085;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.item-image-placeholder {
  width: 64px;
  height: 64px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image-placeholder i {
  font-size: 1.5rem;
  color: #6c757d;
}

.card {
  border: none;
  border-radius: 10px;
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.badge {
  padding: 0.5em 1em;
}
</style>
