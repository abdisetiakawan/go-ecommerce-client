<template>
  <div class="main-card">
    <h3 class="fw-bold mb-4">Checkout</h3>

    <div class="row g-4">
      <!-- Shipping Form -->
      <div class="col-md-7">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Shipping Details</h5>
            <form @submit.prevent="submitOrder">
              <div class="mb-3">
                <label class="form-label">Address</label>
                <input
                  v-model="shippingAddress.address"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-4">
                  <label class="form-label">City</label>
                  <input
                    v-model="shippingAddress.city"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Province</label>
                  <input
                    v-model="shippingAddress.province"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Postal Code</label>
                  <input
                    v-model="shippingAddress.postal_code"
                    type="text"
                    class="form-control"
                    pattern="[0-9]{5}"
                    required
                  />
                </div>
              </div>

              <h5 class="card-title mb-4 mt-4">Payment Method</h5>
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
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
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

    const response = await axios.post(
      "http://127.0.0.1:3000/api/buyer/orders",
      orderData,
      {
        headers: {
          Authorization: `Bearer ${authStore.authToken}`,
        },
      }
    );

    console.log("Checkout response:", response.data);

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
    alert("Failed to place order. Please try again.");
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
</style>
