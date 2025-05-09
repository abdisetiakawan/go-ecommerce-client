<template>
  <div class="checkout-container animate__animated animate__fadeIn">
    <h3 class="fw-bold mb-4"><i class="bi bi-cart-check me-2"></i>Checkout</h3>

    <!-- Error Alert -->
    <div
      v-if="errorMessage"
      class="alert alert-danger alert-dismissible fade show mb-4"
    >
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
      <button
        @click="errorMessage = ''"
        type="button"
        class="btn-close"
      ></button>
    </div>

    <div class="row g-4">
      <!-- Shipping Form -->
      <div class="col-md-7">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h5 class="card-title mb-4">
              <i class="bi bi-truck me-2"></i>Shipping Details
            </h5>
            <form @submit.prevent="submitOrder">
              <div class="form-floating mb-3">
                <input
                  v-model="shippingAddress.address"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': validationErrors.address }"
                  id="address"
                  placeholder="Enter address"
                  required
                />
                <label for="address">Address</label>
                <div class="invalid-feedback" v-if="validationErrors.address">
                  {{ validationErrors.address }}
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-4">
                  <div class="form-floating">
                    <input
                      v-model="shippingAddress.city"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.city }"
                      id="city"
                      placeholder="Enter city"
                      required
                    />
                    <label for="city">City</label>
                    <div class="invalid-feedback" v-if="validationErrors.city">
                      {{ validationErrors.city }}
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-floating">
                    <input
                      v-model="shippingAddress.province"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.province }"
                      id="province"
                      placeholder="Enter province"
                      required
                    />
                    <label for="province">Province</label>
                    <div
                      class="invalid-feedback"
                      v-if="validationErrors.province"
                    >
                      {{ validationErrors.province }}
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-floating">
                    <input
                      v-model="shippingAddress.postal_code"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.postal_code }"
                      id="postal_code"
                      placeholder="Enter postal code"
                      pattern="[0-9]{5}"
                      required
                    />
                    <label for="postal_code">Postal Code</label>
                    <div
                      class="invalid-feedback"
                      v-if="validationErrors.postal_code"
                    >
                      {{ validationErrors.postal_code }}
                    </div>
                  </div>
                </div>
              </div>

              <h5 class="card-title mb-4 mt-5">
                <i class="bi bi-credit-card me-2"></i>Payment Method
              </h5>
              <div class="payment-options">
                <div
                  class="payment-option"
                  :class="{ active: paymentMethod === 'transfer' }"
                >
                  <input
                    v-model="paymentMethod"
                    type="radio"
                    value="transfer"
                    id="transfer"
                    class="visually-hidden"
                  />
                  <label class="payment-label" for="transfer">
                    <i class="bi bi-bank me-2"></i>
                    <span>Bank Transfer</span>
                  </label>
                </div>
                <div
                  class="payment-option"
                  :class="{ active: paymentMethod === 'cash' }"
                >
                  <input
                    v-model="paymentMethod"
                    type="radio"
                    value="cash"
                    id="cash"
                    class="visually-hidden"
                  />
                  <label class="payment-label" for="cash">
                    <i class="bi bi-cash-stack me-2"></i>
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>
              <div
                class="invalid-feedback"
                v-if="validationErrors.payment_method"
              >
                {{ validationErrors.payment_method }}
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h5 class="card-title mb-4">
              <i class="bi bi-receipt me-2"></i>Order Summary
            </h5>
            <div class="order-items">
              <div
                v-for="item in cartItems"
                :key="item.product_uuid"
                class="order-item"
              >
                <img
                  :src="item.image || 'https://placehold.co/50'"
                  class="rounded me-3"
                  width="80"
                  alt="product"
                />
                <div class="order-item-details">
                  <h6 class="mb-1">{{ item.product_name }}</h6>
                  <div class="text-muted">
                    Qty: {{ item.quantity }} ×
                    <span class="price">Rp{{ formatPrice(item.price) }}</span>
                  </div>
                  <div class="item-total">
                    Rp{{ formatPrice(item.quantity * item.price) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="total-section">
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted">Subtotal:</span>
                <span>Rp{{ formatPrice(cartTotal) }}</span>
              </div>
              <div
                class="d-flex justify-content-between align-items-center fw-bold total"
              >
                <span>Total:</span>
                <span class="total-amount">Rp{{ formatPrice(cartTotal) }}</span>
              </div>
            </div>
            <button
              class="btn btn-primary btn-lg w-100 mt-4"
              @click="submitOrder"
              :disabled="processing"
            >
              <i class="bi bi-lock me-2"></i>
              <span v-if="!processing">Place Order</span>
              <span v-else>
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Processing...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccess">
      <div class="modal-backdrop show"></div>
      <div class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 bg-transparent text-center">
            <div class="modal-body">
              <div class="success-checkmark">
                <i class="bi bi-check2 check-icon"></i>
              </div>
              <h4 class="mt-3 text-white">Order Placed Successfully!</h4>
              <p class="text-light">Redirecting to order details...</p>
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
import axiosInstance from "../services/axios";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const shippingAddress = ref({
  address: "",
  city: "",
  province: "",
  postal_code: "",
});

const paymentMethod = ref("transfer");
const processing = ref(false);
const showSuccess = ref(false);
const errorMessage = ref("");
const validationErrors = ref({});

const props = defineProps({
  cartItems: {
    type: Array,
    required: true,
  },
  cartTotal: {
    type: Number,
    required: true,
  },
});

const submitOrder = async () => {
  processing.value = true;
  validationErrors.value = {};
  errorMessage.value = "";

  try {
    const orderData = {
      items: props.cartItems.map((item) => ({
        product_uuid: item.product_uuid,
        quantity: item.quantity,
      })),
      shipping_address: shippingAddress.value,
      payments: {
        payment_method: paymentMethod.value,
      },
    };

    const response = await axiosInstance.post("/buyer/orders", orderData);

    if (response.data.status === "success") {
      showSuccess.value = true;
      setTimeout(() => {
        router.push({
          name: "OrderDetail",
          params: { orderUuid: response.data.data.order_uuid },
        });
      }, 2000);
    }
  } catch (error) {
    console.error("Checkout error:", error);
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
    } else if (error.response?.data?.errors?.errors) {
      // Map API validation errors to form fields
      const apiErrors = error.response.data.errors.errors;
      validationErrors.value = {
        address: apiErrors.Address?.message || "",
        city: apiErrors.City?.message || "",
        province: apiErrors.Province?.message || "",
        postal_code: apiErrors.PostalCode?.message || "",
        payment_method: apiErrors.PaymentMethod?.message || "",
      };
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value =
        error.response?.data?.message || "Failed to place order";
    }
  } finally {
    processing.value = false;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.card {
  border: none;
  border-radius: 15px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.form-floating > .form-control:focus,
.form-floating > .form-control:not(:placeholder-shown) {
  padding-top: 1.625rem;
  padding-bottom: 0.625rem;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.payment-option {
  position: relative;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.payment-option.active {
  border-color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.05);
}

.payment-label {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  font-weight: 500;
  margin: 0;
  width: 100%;
}

.order-items {
  max-height: 400px;
  overflow-y: auto;
  margin: -1rem;
  padding: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item-details {
  flex: 1;
}

.item-total {
  text-align: right;
  color: #0d6efd;
  font-weight: 500;
}

.total-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #f0f0f0;
}

.total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  font-size: 1.25rem;
}

.total-amount {
  color: #0d6efd;
  font-size: 1.5rem;
}

.price {
  color: #198754;
}

.btn-primary {
  padding: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Existing styles remain... */

.success-checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #28a745;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: scaleUp 0.5s ease-in-out;
}

@keyframes scaleUp {
  0% {
    transform: scale(0);
  }
  80% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.check-icon {
  color: white;
  font-size: 40px;
  animation: checkmark 0.5s ease-in-out;
}

@keyframes checkmark {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.modal-backdrop.show {
  background-color: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1050;
  backdrop-filter: blur(5px);
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* Animation classes */
.animate__animated {
  animation-duration: 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
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
