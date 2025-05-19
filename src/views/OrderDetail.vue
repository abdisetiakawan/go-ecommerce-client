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
          <span :class="statusBadgeClass">
            {{ formattedStatus }}
          </span>
          <div class="mt-3" v-if="orderData.status === 'pending'">
            <button
              class="btn btn-outline-danger btn-sm me-2"
              @click="cancelOrder"
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
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import axiosInstance from "../services/axios";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const orderData = ref({
  order_uuid: "",
  status: "",
  created_at: new Date().toISOString(),
  total_price: 0,
  payment: {},
  shipping: {},
  items: [],
});
const loading = ref(true);
const processingCheckout = ref(false);

const formattedStatus = computed(() => {
  return orderData.value.status?.toUpperCase() || "BELUM DIKETAHUI";
});

const statusBadgeClass = computed(() => {
  return ["status-pill", `status-${orderData.value.status || "unknown"}`];
});

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

    Swal.fire({
      title: "Error",
      text: `Gagal memuat pesanan: ${error.response?.data?.message || error.message}`,
      icon: "error",
      confirmButtonColor: "#3085d6",
    });

    // Redirect back to orders page if order not found
    if (error.response?.status === 404) {
      router.push("/buyer/orders");
    }
  } finally {
    loading.value = false;
  }
};

const cancelOrder = async () => {
  try {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, cancel order!",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await axiosInstance.patch(
            `/buyer/orders/${route.params.orderUuid}/cancel`
          );
          return response.data;
        } catch (error) {
          Swal.showValidationMessage(
            `Failed to cancel: ${error.response?.data?.message || error.message}`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed && result.value) {
      orderData.value = {
        ...result.value.data,
        payment: result.value.data.payment || {},
        shipping: result.value.data.shipping || {},
        items: result.value.data.items || [],
      };

      await Swal.fire({
        title: "Cancelled!",
        text: "Your order has been cancelled.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    Swal.fire({
      title: "Error!",
      text: error.response?.data?.message || "Failed to cancel order",
      icon: "error",
    });
  }
};

const checkoutOrder = async () => {
  try {
    processingCheckout.value = true;

    // Show loading dialog
    Swal.fire({
      title: "Processing Checkout",
      text: "Please wait...",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Make API call
    const response = await axiosInstance.patch(
      `/buyer/orders/${route.params.orderUuid}/checkout`
    );

    if (response.data.status === "success") {
      // Update order data
      orderData.value = {
        ...response.data.data,
        payment: response.data.data.payment || {},
        shipping: response.data.data.shipping || {},
        items: response.data.data.items || [],
      };

      // Show success message
      await Swal.fire({
        title: "Success!",
        text: "Checkout completed successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh order data
      await fetchOrder();
    }
  } catch (error) {
    console.error("Error during checkout:", error);

    // Show error message
    await Swal.fire({
      title: "Checkout Failed",
      text: error.response?.data?.message || "Failed to process checkout",
      icon: "error",
      confirmButtonColor: "#3085d6",
    });

    // Handle unauthorized error
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
    }
  } finally {
    processingCheckout.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "Date not available";

  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
};

onMounted(() => {
  if (route.params.orderUuid) {
    fetchOrder();
  }
});

watch(
  () => route.params.orderUuid,
  (newVal) => {
    if (newVal) fetchOrder();
  }
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

.status-shipped {
  background-color: #e8dbff;
  color: #6f42c1;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-unknown {
  background-color: #e2e3e5;
  color: #383d41;
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

/* Add these new styles for SweetAlert customization */
:deep(.swal2-popup) {
  border-radius: 15px;
  padding: 2rem;
}

:deep(.swal2-title) {
  font-size: 1.5rem;
  font-weight: 600;
}

:deep(.swal2-html-container) {
  font-size: 1rem;
}

:deep(.swal2-confirm) {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
}

:deep(.swal2-cancel) {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
}
</style>
