<template>
  <div class="main-container">
    <div class="row g-4">
      <!-- Product List -->
      <div class="col-lg-8">
        <div
          v-for="store in stores"
          :key="store.store_id"
          class="store-section"
        >
          <div
            class="d-flex justify-content-between align-items-center mb-4 text-capitalize"
          >
            <h4 class="fw-bold">{{ store.store }}</h4>
            <span class="badge bg-primary"
              >{{ store.products.length }} Products</span
            >
          </div>

          <div class="row row-cols-1 row-cols-md-2 g-4">
            <div
              v-for="product in store.products"
              :key="product.product_uuid"
              class="col"
            >
              <div class="card product-card h-100">
                <img
                  :src="product.image || 'https://via.placeholder.com/400x200'"
                  class="card-img-top product-image"
                  :alt="product.product_name"
                />
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 class="card-title">{{ product.product_name }}</h5>
                      <div class="d-flex gap-2 align-items-center">
                        <span class="badge bg-warning"
                          >Rp{{ product.price }}</span
                        >
                        <span class="badge bg-secondary"
                          >Stock: {{ product.stock }}</span
                        >
                        <span class="badge badge-category">{{
                          product.category
                        }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 d-flex gap-2">
                    <input
                      type="number"
                      class="form-control quantity-input"
                      v-model.number="product.quantity"
                      :min="1"
                      :max="product.stock"
                    />
                    <button
                      class="btn btn-outline-secondary btn-sm"
                      @click="addToCart(store.store, product)"
                    >
                      <i class="bi bi-cart-plus"></i> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Sidebar -->
      <div class="col-lg-4">
        <div class="cart-sidebar">
          <h4 class="fw-bold mb-4">Shopping Cart</h4>
          <div class="alert alert-info" v-if="currentStore">
            Currently shopping from: <strong>{{ currentStore }}</strong>
          </div>

          <!-- Cart Items -->
          <div class="mb-4" v-if="cartItems.length">
            <div
              v-for="item in cartItems"
              :key="item.product_uuid"
              class="d-flex justify-content-between mb-3"
            >
              <div>
                <h6>{{ item.product_name }}</h6>
                <div class="text-muted">
                  {{ item.quantity }} × Rp{{ item.price }}
                  <button
                    class="btn btn-link text-danger btn-sm"
                    @click="removeFromCart(item.product_uuid)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <div class="text-end">Rp{{ item.quantity * item.price }}</div>
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
            @click="proceedToCheckout"
            :disabled="!cartItems.length"
          >
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Store Change Modal -->
  <div class="modal fade" id="storeChangeModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Switch Store</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body">
          <p>
            You're about to add items from a different store. This will reset
            your current cart.
          </p>
          <p>Do you want to continue?</p>
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
            @click="confirmSwitchStore"
          >
            Switch Store
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { Modal } from "bootstrap";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
const stores = ref([]);
const currentStore = ref("");
const cartItems = ref([]);
const storeChangeModal = ref(null);

const cartTotal = computed(() => {
  return cartItems.value.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

const fetchProducts = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/product", {
      headers: {
        Authorization: `Bearer ${authStore.authToken}`,
      },
    });
    console.log("response", response);
    if (response.data.status === "success") {
      const products = response.data.data;
      const groupedProducts = products.reduce((acc, product) => {
        const store = acc.find((s) => s.store_id === product.store_id);
        if (store) {
          store.products.push({ ...product, quantity: 1 });
        } else {
          acc.push({
            store_id: product.store_id,
            store: product.store,
            products: [{ ...product, quantity: 1 }],
          });
        }
        return acc;
      }, []);
      stores.value = groupedProducts;
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
};

const addToCart = (store, product) => {
  if (currentStore.value && currentStore.value !== store) {
    if (!storeChangeModal.value) {
      storeChangeModal.value = new Modal(
        document.getElementById("storeChangeModal")
      );
    }
    storeChangeModal.value.show();
    return;
  }

  currentStore.value = store;
  const existingItem = cartItems.value.find(
    (item) => item.product_uuid === product.product_uuid
  );
  if (existingItem) {
    existingItem.quantity += product.quantity;
  } else {
    cartItems.value.push({ ...product });
  }
};

const removeFromCart = (product_uuid) => {
  cartItems.value = cartItems.value.filter(
    (item) => item.product_uuid !== product_uuid
  );
  if (cartItems.value.length === 0) {
    currentStore.value = "";
  }
};

const confirmSwitchStore = () => {
  cartItems.value = [];
  currentStore.value = "";
  storeChangeModal.value.hide();
};

const proceedToCheckout = () => {
  if (cartItems.value.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  // Proceed to checkout logic here
  alert("Proceeding to checkout...");
};

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.main-container {
  max-width: 1200px;
  padding: 2rem;
  margin: 2rem auto;
}
.store-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  padding: 1.5rem;
}
.product-card {
  transition: transform 0.2s;
  border: 1px solid #eee;
}
.product-card:hover {
  transform: translateY(-2px);
}
.cart-sidebar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  position: sticky;
  top: 1rem;
}
.quantity-input {
  width: 70px;
  text-align: center;
}
.product-image {
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}
.badge-category {
  background-color: #6366f1;
}
</style>
