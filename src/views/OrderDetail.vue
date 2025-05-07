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
    <!-- Header Section -->
    <div class="mb-4">
      <RouterLink to="/buyer/orders" class="btn btn-link text-decoration-none">
        <i class="bi bi-arrow-left me-2"></i>Kembali ke Pesanan
      </RouterLink>
      <div class="d-flex justify-content-between align-items-center mt-2">
        <h1 class="h3 mb-0">Order #{{ orderData.order_uuid }}</h1>
        <div>
          <button
            v-if="orderData.status === 'pending'"
            class="btn btn-outline-danger me-2"
            @click="showCancelModal = true"
          >
            Batalkan Pesanan
          </button>
          <button
            v-if="orderData.status === 'pending'"
            class="btn btn-outline-success"
            @click="checkoutOrder"
            :disabled="processingCheckout"
          >
            <span v-if="!processingCheckout">Checkout Now</span>
            <span v-else>
              <span
                class="spinner-border spinner-border-sm"
                role="status"
              ></span>
              Processing...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Order Content -->
    <div class="row g-4">
      <!-- Order Items -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Item Pesanan</h5>
            <div class="list-group list-group-flush">
              <div
                v-for="item in orderData.items"
                :key="item.order_item_uuid"
                class="list-group-item d-flex align-items-center py-3"
              >
                <img
                  :src="item.image || 'https://placehold.co/100'"
                  class="img-fluid rounded me-3"
                  alt="Gambar Produk"
                  style="width: 80px; height: 80px; object-fit: cover"
                />
                <div>
                  <h6 class="mb-1">{{ item.product_name }}</h6>
                  <small class="text-muted">Jumlah: {{ item.quantity }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Ringkasan Pesanan</h5>
            <dl class="row mb-0">
              <dt class="col-6">Status Pesanan:</dt>
              <dd class="col-6 text-end">
                <span :class="['badge', statusBadgeClass]">
                  {{ formattedStatus }}
                </span>
              </dd>

              <dt class="col-6">Metode Pembayaran:</dt>
              <dd class="col-6 text-end">{{ paymentMethod }}</dd>

              <dt class="col-12 mt-3">Alamat Pengiriman:</dt>
              <dd class="col-12 mt-1">
                <div class="text-muted whitespace-pre-line">
                  {{ shippingAddress }}
                </div>
              </dd>

              <div class="col-12 mt-4 pt-3 border-top">
                <dt class="d-inline">Total Pembayaran:</dt>
                <dd class="d-inline float-end fs-5 fw-bold text-success">
                  Rp{{ formattedTotalPrice }}
                </dd>
              </div>
            </dl>
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
</style>
