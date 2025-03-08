<template>
  <div class="main-container">
    <div class="row g-4">
      <!-- Product List -->
      <div class="col-lg-8">
        <ProductList
          :stores="stores"
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
import { useRouter } from "vue-router";
import ProductList from "../../components/ProductList.vue";
import CartSidebar from "../../components/CartSidebar.vue";

const authStore = useAuthStore();
const stores = ref([]);
const currentStore = ref("");
const cartItems = ref([]);
const storeChangeModal = ref(null);
const router = useRouter();

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

const handleQuantityUpdate = ({ productUuid, quantity }) => {
  stores.value.forEach((store) => {
    const product = store.products.find((p) => p.product_uuid === productUuid);
    if (product) {
      product.quantity = quantity;
    }
  });
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
</style>
