<template>
  <div class="main-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading products...</p>
    </div>

    <div v-else class="row g-4">
      <!-- Product List -->
      <div class="col-lg-8">
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <h3 class="mb-0">Products</h3>
            <div class="d-flex gap-3">
              <div class="search-container">
                <input
                  type="text"
                  class="form-control search-input"
                  v-model="searchQuery"
                  placeholder="Search products..."
                />
                <i class="bi bi-search search-icon"></i>
              </div>
              <select v-model="categoryFilter" class="form-select">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <ProductList
          :stores="filteredStores"
          @add-to-cart="addToCart"
          @update-quantity="handleQuantityUpdate"
        />
      </div>

      <!-- Cart Sidebar -->
      <div class="col-lg-4">
        <CartSidebar
          :currentStore="currentStore"
          :cartItems="cartItems"
          :cartTotal="cartTotal"
          @removeFromCart="removeFromCart"
          @proceedToCheckout="proceedToCheckout"
        />
      </div>
    </div>
  </div>

  <!-- Store Change Modal -->
  <div class="modal fade" id="storeChangeModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title">Switch Store</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-warning">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Warning:</strong> Changing stores will clear your current
            cart.
          </div>
          <p class="mb-0">
            Are you sure you want to switch to a different store?
          </p>
        </div>
        <div class="modal-footer border-0">
          <button
            type="button"
            class="btn btn-outline-secondary"
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

  <!-- Stock Warning Modal -->
  <div class="modal fade" id="stockWarningModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title text-danger">
            <i class="bi bi-exclamation-circle me-2"></i>Stock Warning
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body">
          <p>The requested quantity exceeds available stock:</p>
          <div class="stock-info p-3 bg-light rounded">
            <p class="mb-2">
              <strong>{{ stockWarningProduct?.product_name }}</strong>
            </p>
            <p class="mb-0 text-danger">
              Available: {{ stockWarningProduct?.stock }} units
            </p>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            Okay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Modal } from "bootstrap";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import ProductList from "../../components/ProductList.vue";
import CartSidebar from "../../components/CartSidebar.vue";
import axiosInstance from "../../services/axios";

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(true);
const stores = ref([]);
const currentStore = ref("");
const cartItems = ref([]);
const searchQuery = ref("");
const categoryFilter = ref("");
const storeChangeModal = ref(null);
const stockWarningModal = ref(null);
const stockWarningProduct = ref(null);

// Computed properties
const cartTotal = computed(() => {
  return cartItems.value.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

const categories = computed(() => {
  const cats = new Set();
  stores.value.forEach((store) => {
    store.products.forEach((product) => {
      cats.add(product.category);
    });
  });
  return Array.from(cats);
});

const filteredStores = computed(() => {
  return stores.value
    .map((store) => ({
      ...store,
      products: store.products.filter((product) => {
        const matchesSearch = product.product_name
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase());
        const matchesCategory =
          !categoryFilter.value || product.category === categoryFilter.value;
        return matchesSearch && matchesCategory;
      }),
    }))
    .filter((store) => store.products.length > 0);
});

// Methods
const fetchProducts = async () => {
  try {
    loading.value = true;
    const response = await axiosInstance.get("/product");

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
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
    }
  } finally {
    loading.value = false;
  }
};

const validateStock = (product, requestedQuantity) => {
  if (requestedQuantity > product.stock) {
    stockWarningProduct.value = product;
    if (!stockWarningModal.value) {
      stockWarningModal.value = new Modal(
        document.getElementById("stockWarningModal")
      );
    }
    stockWarningModal.value.show();
    return false;
  }
  return true;
};

const addToCart = (store, product) => {
  // Validate stock first
  if (!validateStock(product, product.quantity)) {
    return;
  }

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
    const newQuantity = existingItem.quantity + product.quantity;
    if (!validateStock(product, newQuantity)) {
      return;
    }
    existingItem.quantity = newQuantity;
  } else {
    cartItems.value.push({ ...product });
  }
};

const handleQuantityUpdate = ({ productUuid, quantity }) => {
  // Find the product in stores
  let targetProduct = null;
  stores.value.forEach((store) => {
    const product = store.products.find((p) => p.product_uuid === productUuid);
    if (product) {
      targetProduct = product;
      if (validateStock(product, quantity)) {
        product.quantity = quantity;
      }
    }
  });

  // Update cart item if exists
  const cartItem = cartItems.value.find(
    (item) => item.product_uuid === productUuid
  );
  if (cartItem && targetProduct) {
    if (validateStock(targetProduct, quantity)) {
      cartItem.quantity = quantity;
    }
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

  router.push({
    name: "Checkout",
    query: {
      cartItems: JSON.stringify(cartItems.value),
      cartTotal: cartTotal.value,
    },
  });
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

.modal-content {
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stock-info {
  border-left: 4px solid #dc3545;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .search-container {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 1rem;
  }
}
</style>
