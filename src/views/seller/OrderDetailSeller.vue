<template>
  <!-- Loading State -->
  <div
    v-if="loading"
    class="d-flex justify-content-center align-items-center min-vh-100"
  >
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- Main Content -->
  <div v-else class="main-card">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <RouterLink
          to="/seller/orders"
          class="btn btn-link text-decoration-none mb-2"
        >
          <i class="bi bi-arrow-left me-2"></i>Back to Orders
        </RouterLink>
        <h3 class="fw-bold mb-2">Order #{{ orderData.order_uuid }}</h3>
        <span :class="['status-badge', `status-${orderData.shipping?.status}`]">
          {{ orderData.shipping?.status?.toUpperCase() }}
        </span>
      </div>
      <button
        v-if="canUpdateStatus"
        @click="showUpdateStatusModal"
        class="btn btn-primary"
      >
        Update Status
      </button>
    </div>

    <div class="row g-4">
      <div class="col-md-8">
        <!-- Order Summary -->
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title mb-4">Order Summary</h5>
            <div class="row mb-3">
              <div class="col-md-6">
                <p class="mb-1">
                  <strong>Order Date:</strong>
                  {{ formatDate(orderData.created_at) }}
                </p>
                <p class="mb-1">
                  <strong>Customer:</strong> {{ orderData.user_name }}
                </p>
              </div>
              <div class="col-md-6">
                <p class="mb-1">
                  <strong>Total Price:</strong> Rp{{
                    formatPrice(orderData.total_price)
                  }}
                </p>
                <p class="mb-1">
                  <strong>Payment Method:</strong>
                  {{ orderData.payment?.method?.toUpperCase() }}
                </p>
                <p class="mb-1">
                  <strong>Payment Status:</strong>
                  <span
                    :class="[
                      'badge',
                      {
                        'bg-success': orderData.payment?.status === 'paid',
                        'bg-warning': orderData.payment?.status === 'pending',
                        'bg-danger': orderData.payment?.status === 'cancelled',
                      },
                    ]"
                  >
                    {{ orderData.payment?.status?.toUpperCase() }}
                  </span>
                </p>
              </div>
            </div>

            <h6 class="mb-3">Shipping Address</h6>
            <div class="card bg-light">
              <div class="card-body">
                <p class="mb-0">
                  {{ orderData.shipping?.address }}<br />
                  {{ orderData.shipping?.city }},
                  {{ orderData.shipping?.province }}<br />
                  {{ orderData.shipping?.postal_code }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Order Items</h5>
            <div class="list-group">
              <div
                v-for="item in orderData.items"
                :key="item.id"
                class="list-group-item product-item"
              >
                <div class="d-flex align-items-center gap-3">
                  <div class="product-image">
                    <img
                      :src="item.product_image || 'https://placehold.co/80'"
                      :alt="item.product_name"
                      class="rounded"
                    />
                  </div>
                  <div class="flex-grow-1">
                    <div
                      class="d-flex justify-content-between align-items-start"
                    >
                      <div>
                        <h6 class="product-name mb-1">
                          {{ item.product_name }}
                        </h6>
                        <small class="text-muted d-block"
                          >SKU: {{ item.product_uuid }}</small
                        >
                      </div>
                      <div class="text-end">
                        <p class="price mb-1">
                          {{ item.quantity }} x
                          <span class="fw-bold"
                            >Rp{{ formatPrice(item.price) }}</span
                          >
                        </p>
                        <p class="total-price mb-0">
                          Total:
                          <span class="fw-bold"
                            >Rp{{
                              formatPrice(item.quantity * item.price)
                            }}</span
                          >
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Timeline -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Order Timeline</h5>
            <div class="timeline-wrapper">
              <div class="timeline-item">
                <div class="timeline-marker done">
                  <i class="bi bi-cart-check-fill"></i>
                </div>
                <div class="timeline-content">
                  <h6 class="mb-0">Order Placed</h6>
                  <small class="text-muted">{{
                    formatDate(orderData.created_at)
                  }}</small>
                </div>
              </div>

              <div class="timeline-item">
                <div
                  :class="[
                    'timeline-marker',
                    { done: isShipped, current: isPending },
                  ]"
                >
                  <i class="bi bi-box-seam-fill"></i>
                </div>
                <div class="timeline-content">
                  <h6 class="mb-0">Order Shipped</h6>
                  <small
                    :class="[
                      'status-text',
                      { 'text-primary': isShipped, 'text-muted': !isShipped },
                    ]"
                  >
                    {{ shippedDate }}
                  </small>
                </div>
              </div>

              <div class="timeline-item">
                <div :class="['timeline-marker', { done: isDelivered }]">
                  <i class="bi bi-house-check-fill"></i>
                </div>
                <div class="timeline-content">
                  <h6 class="mb-0">Order Delivered</h6>
                  <small
                    :class="[
                      'status-text',
                      {
                        'text-success': isDelivered,
                        'text-muted': !isDelivered,
                      },
                    ]"
                  >
                    {{ deliveredDate }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Status Update Modal -->
  <div
    class="modal fade"
    id="updateStatusModal"
    tabindex="-1"
    ref="updateStatusModal"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Update Order Status</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info mb-3">
            <small>
              <i class="bi bi-info-circle me-2"></i>
              Status can only progress forward: pending → shipped → delivered
            </small>
          </div>
          <div class="mb-3">
            <label class="form-label">New Status</label>
            <select v-model="selectedStatus" class="form-select">
              <option value="">Select status</option>
              <option v-if="canShip" value="shipped">Shipped</option>
              <option v-if="canDeliver" value="delivered">Delivered</option>
            </select>
          </div>
          <div v-if="updateError" class="alert alert-danger">
            {{ updateError }}
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="updateStatus"
            :disabled="!selectedStatus"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axiosInstance from "../../services/axios";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const orderData = ref({});
const updateError = ref("");
const selectedStatus = ref("");
const modal = ref(null);
const updateStatusModal = ref(null);

// Computed properties
const canUpdateStatus = computed(() => {
  const shipping = orderData.value.shipping;
  return (
    shipping?.status !== "delivered" &&
    orderData.value.payment?.status === "paid"
  );
});

const canShip = computed(() => {
  return orderData.value.shipping?.status === "pending";
});

const canDeliver = computed(() => {
  return orderData.value.shipping?.status === "shipped";
});

const shippedIconClass = computed(() => {
  const status = orderData.value.shipping?.status;
  return status === "pending" ? "bi-box" : "bi-box-seam-fill";
});

const deliveredIconClass = computed(() => {
  const status = orderData.value.shipping?.status;
  return status === "delivered" ? "bi-check-circle-fill" : "bi-circle";
});

const shippedDate = computed(() => {
  return orderData.value.shipping?.status === "pending"
    ? "Pending"
    : formatDate(orderData.value.shipping?.updated_at);
});

const deliveredDate = computed(() => {
  return orderData.value.shipping?.status === "delivered"
    ? formatDate(orderData.value.shipping?.updated_at)
    : "Not yet delivered";
});

const isShipped = computed(() => {
  return ["shipped", "delivered"].includes(orderData.value.shipping?.status);
});

const isDelivered = computed(() => {
  return orderData.value.shipping?.status === "delivered";
});

const isPending = computed(() => {
  return orderData.value.shipping?.status === "pending";
});

// Methods
const fetchOrder = async () => {
  try {
    loading.value = true;
    const response = await axiosInstance.get(
      `/seller/orders/${route.params.orderUuid}`
    );

    if (response.data.status === "success") {
      orderData.value = response.data.data;
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    Swal.fire({
      title: "Error",
      text: error.response?.data?.message || "Failed to load order details",
      icon: "error",
    });
    router.push("/seller/orders");
  } finally {
    loading.value = false;
  }
};

const showUpdateStatusModal = () => {
  updateError.value = "";
  selectedStatus.value = "";
  modal.value.show();
};

const updateStatus = async () => {
  try {
    updateError.value = "";

    const response = await axiosInstance.patch(
      `/seller/orders/${route.params.orderUuid}/shipping`,
      {
        status: selectedStatus.value,
      }
    );

    if (response.data.status === "success") {
      modal.value.hide();
      await fetchOrder();

      Swal.fire({
        title: "Success!",
        text: `Order has been marked as ${selectedStatus.value}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    let errorMessage =
      error.response?.data?.message || "Failed to update status";

    // Handle specific error cases from backend
    if (error.response?.status === 409) {
      errorMessage = error.response.data.message;
    }

    updateError.value = errorMessage;
  }
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price) => {
  return Number(price).toLocaleString("id-ID");
};

onMounted(async () => {
  await fetchOrder();
  modal.value = new Modal(updateStatusModal.value);
});
</script>

<style scoped>
.main-card {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 500;
  font-size: 0.875rem;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-shipped {
  background-color: #cce5ff;
  color: #004085;
}

.status-delivered {
  background-color: #d4edda;
  color: #155724;
}

.btn-link {
  text-decoration: none;
  color: #6c757d;
}

.btn-link:hover {
  color: #000;
}

.list-group-item {
  border-left: none;
  border-right: none;
  border-radius: 0;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

.product-item {
  padding: 1.25rem;
  transition: background-color 0.2s ease;
}

.product-item:hover {
  background-color: #f8f9fa;
}

.product-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid #dee2e6;
}

.product-name {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.price {
  color: #6c757d;
}

.total-price {
  color: #2c3e50;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.status-badge {
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #f8f9fa;
  padding-bottom: 1rem;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.timeline-item {
  position: relative;
  padding-left: 2rem;
}

.timeline-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e9ecef;
}

.badge {
  padding: 0.5em 1em;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 50px;
}

.bg-warning {
  background-color: #ffc107 !important;
  color: #664d03;
}

.bg-success {
  background-color: #198754 !important;
  color: #ffffff;
}

.bg-danger {
  background-color: #dc3545 !important;
  color: #ffffff;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.timeline-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.timeline-list::before {
  content: "";
  position: absolute;
  left: 16px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  padding-left: 50px;
  margin-bottom: 1.5rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.timeline-marker i {
  font-size: 1rem;
  color: #6c757d;
  transition: all 0.3s ease;
}

.timeline-marker.done {
  border-color: #198754;
  background: #198754;
}

.timeline-marker.done i {
  color: #fff;
}

.timeline-content {
  background: #fff;
  padding: 0.5rem 0;
}

.timeline-content h6 {
  color: #2c3e50;
  font-weight: 600;
}

.timeline-content small {
  color: #6c757d;
}

@media (max-width: 768px) {
  .timeline-item {
    padding-left: 40px;
  }

  .timeline-marker {
    width: 28px;
    height: 28px;
  }

  .timeline-marker i {
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .main-card {
    margin: 1rem;
    padding: 1rem;
  }

  .product-image {
    width: 60px;
    height: 60px;
  }
}

.timeline-wrapper {
  position: relative;
  padding: 1rem 0;
}

.timeline-wrapper::before {
  content: "";
  position: absolute;
  left: 17px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  padding-left: 50px;
  margin-bottom: 1.5rem;
  z-index: 1;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.timeline-marker i {
  font-size: 1rem;
  color: #6c757d;
  transition: all 0.3s ease;
}

.timeline-marker.done {
  border-color: #198754;
  background: #198754;
}

.timeline-marker.done i {
  color: #fff;
}

.timeline-marker.current {
  border-color: #0d6efd;
  background: #fff;
}

.timeline-marker.current i {
  color: #0d6efd;
}

.timeline-content {
  background: #fff;
  padding: 0.5rem 0;
}

.timeline-content h6 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.status-text {
  display: block;
  font-size: 0.875rem;
}

.text-primary {
  color: #0d6efd !important;
}

.text-success {
  color: #198754 !important;
}

@media (max-width: 768px) {
  .timeline-item {
    padding-left: 45px;
  }

  .timeline-marker {
    width: 32px;
    height: 32px;
  }

  .timeline-marker i {
    font-size: 0.875rem;
  }

  .timeline-wrapper::before {
    left: 15px;
  }
}
</style>
