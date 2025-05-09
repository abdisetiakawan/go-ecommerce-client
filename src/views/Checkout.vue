<template>
  <div class="main-card">
    <h3 class="fw-bold mb-4">Checkout</h3>

    <!-- Show general error message if exists -->
    <div v-if="errorMessage" class="alert alert-danger mb-4">
      {{ errorMessage }}
    </div>

    <div class="row g-4">
      <!-- Shipping Form -->
      <div class="col-md-7">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Shipping Details</h5>
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

              <h5 class="card-title mb-4 mt-4">Payment Method</h5>
              <div
                class="form-group"
                :class="{ 'is-invalid': validationErrors.payment_method }"
              >
                <div class="form-check">
                  <input
                    v-model="paymentMethod"
                    class="form-check-input"
                    type="radio"
                    value="transfer"
                    id="transfer"
                    checked
                  />
                  <label class="form-check-label" for="transfer"
                    >Bank Transfer</label
                  >
                </div>
                <div class="form-check">
                  <input
                    v-model="paymentMethod"
                    class="form-check-input"
                    type="radio"
                    value="cash"
                    id="cash"
                  />
                  <label class="form-check-label" for="cash"
                    >Cash on Delivery</label
                  >
                </div>
                <div
                  class="invalid-feedback"
                  v-if="validationErrors.payment_method"
                >
                  {{ validationErrors.payment_method }}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="col-md-5">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Order Summary</h5>
            <div
              v-for="item in cartItems"
              :key="item.product_uuid"
              class="d-flex mb-3"
            >
              <img
                :src="item.image || 'https://placehold.co/50'"
                class="rounded me-3"
                width="80"
                alt="product"
              />
              <div>
                <h6>{{ item.product_name }}</h6>
                <div class="text-muted">
                  Qty: {{ item.quantity }} × Rp{{ item.price }} = Rp{{
                    item.quantity * item.price
                  }}
                </div>
              </div>
            </div>
            <hr />
            <div class="d-flex justify-content-between fw-bold">
              <span>Total:</span>
              <span>Rp{{ cartTotal }}</span>
            </div>
            <button
              class="btn btn-primary w-100 mt-4"
              @click="submitOrder"
              :disabled="processing"
            >
              <span v-if="!processing">Place Order</span>
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
</script>

<style scoped>
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
</style>
