<template>
  <div class="cart-sidebar">
    <h4 class="fw-bold mb-4">Shopping Cart</h4>
    <div class="alert alert-info" v-if="currentStore">
      Currently shopping from: <strong>{{ currentStore }}</strong>
    </div>
    <div class="mb-4" v-if="cartItems.length">
      <div
        v-for="item in cartItems"
        :key="item.product_uuid"
        class="d-flex justify-content-between mb-3"
      >
        <div>
          <h6>{{ item.product_name }}</h6>
          <div class="text-muted">
            {{ item.quantity }} × Rp{{ formatPrice(item.price) }}
            <button
              class="btn btn-link text-danger btn-sm p-0 ms-2"
              @click="$emit('removeFromCart', item.product_uuid)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <div class="text-end">
          Rp{{ formatPrice(item.quantity * item.price) }}
        </div>
      </div>
    </div>
    <hr v-if="cartItems.length" />
    <div
      class="d-flex justify-content-between fw-bold mb-3"
      v-if="cartItems.length"
    >
      <span>Total:</span>
      <span>Rp{{ cartTotal }}</span>
    </div>
    <button
      class="btn btn-primary w-100"
      @click="$emit('proceedToCheckout')"
      :disabled="!cartItems.length"
    >
      Proceed to checkout
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  currentStore: String,
  cartItems: Array,
  cartTotal: Number,
});

const emit = defineEmits(["removeFromCart", "proceedToCheckout"]);

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};
</script>

<style scoped>
.cart-sidebar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  position: sticky;
  top: 1rem;
}

.btn-link {
  text-decoration: none;
}

.btn-link:hover {
  opacity: 0.8;
}
</style>
