<template>
  <div class="main-card">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">Product Management</h3>
      <button
        @click="showAddModal = true"
        class="btn btn-primary"
        style="background: #6366f1; border: none"
      >
        + Add Product
      </button>
    </div>

    <!-- Filters -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <input
          type="text"
          class="form-control"
          placeholder="Search products..."
          v-model="searchQuery"
        />
      </div>
      <div class="col-md-2">
        <select class="form-select" v-model="selectedCategory">
          <option value="">All Categories</option>
          <option
            v-for="category in categories"
            :value="category"
            :key="category"
          >
            {{ category }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <input
          type="number"
          class="form-control"
          placeholder="Min Price"
          v-model="minPrice"
        />
      </div>
      <div class="col-md-3">
        <input
          type="number"
          class="form-control"
          placeholder="Max Price"
          v-model="maxPrice"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <div v-if="filteredProducts.length === 0" class="alert alert-info">
        No products found.
      </div>
      <div v-else class="row row-cols-1 row-cols-md-2 g-4">
        <div
          v-for="product in filteredProducts"
          :key="product.product_uuid"
          class="col"
        >
          <div class="card product-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h5 class="card-title">{{ product.product_name }}</h5>
                  <p class="card-text text-muted">
                    {{ product.description || "No description" }}
                  </p>
                  <div class="d-flex gap-2">
                    <span class="badge bg-primary">{{ product.category }}</span>
                    <span class="badge bg-success">
                      Stock: {{ product.stock }}
                    </span>
                    <span class="badge bg-warning">Rp{{ product.price }}</span>
                  </div>
                </div>
                <div class="dropdown">
                  <button
                    class="btn btn-light rounded-circle"
                    type="button"
                    data-bs-toggle="dropdown"
                    style="width: 32px; height: 32px; padding: 0"
                  >
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <RouterLink
                        :to="{
                          name: 'EditProduct',
                          params: { productUuid: product.product_uuid },
                        }"
                        class="dropdown-item"
                      >
                        <i class="bi bi-pencil me-2"></i>Edit
                      </RouterLink>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <button
                        @click="deleteProduct(product.product_uuid)"
                        class="dropdown-item text-danger"
                      >
                        <i class="bi bi-trash me-2"></i>Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div
      class="modal fade"
      :class="{ show: showAddModal }"
      tabindex="-1"
      v-if="showAddModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Product</h5>
            <button
              type="button"
              class="btn-close"
              @click="showAddModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleAddProduct">
              <div class="form-floating mb-3">
                <input
                  type="text"
                  class="form-control"
                  id="productName"
                  v-model="newProduct.name"
                  required
                />
                <label for="productName">Product Name</label>
              </div>
              <div class="form-floating mb-3">
                <textarea
                  class="form-control"
                  id="productDesc"
                  style="height: 100px"
                  v-model="newProduct.description"
                ></textarea>
                <label for="productDesc">Description</label>
              </div>
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="number"
                      class="form-control"
                      id="productPrice"
                      step="0.01"
                      v-model="newProduct.price"
                      required
                    />
                    <label for="productPrice">Price</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="number"
                      class="form-control"
                      id="productStock"
                      v-model="newProduct.stock"
                      required
                    />
                    <label for="productStock">Stock</label>
                  </div>
                </div>
              </div>
              <div class="form-floating mb-3">
                <select
                  class="form-select"
                  id="productCategory"
                  v-model="newProduct.category"
                  required
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Accessories">Accessories</option>
                </select>
                <label for="productCategory">Category</label>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="showAddModal = false"
                >
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const products = ref([]);
const loading = ref(true);
const showAddModal = ref(false);
const searchQuery = ref("");
const selectedCategory = ref("");
const minPrice = ref(null);
const maxPrice = ref(null);

const newProduct = ref({
  name: "",
  description: "",
  price: 0,
  stock: 0,
  category: "Electronics",
});

const categories = computed(() => {
  const uniqueCategories = new Set(products.value.map((p) => p.category));
  return Array.from(uniqueCategories);
});

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesSearch = product.product_name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value
      ? product.category === selectedCategory.value
      : true;
    const matchesMinPrice = minPrice.value
      ? product.price >= minPrice.value
      : true;
    const matchesMaxPrice = maxPrice.value
      ? product.price <= maxPrice.value
      : true;
    return (
      matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
    );
  });
});

const fetchProducts = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:3000/api/product", {
      headers: {
        Authorization: `Bearer ${authStore.authToken}`,
      },
    });
    if (response.data.status === "success") {
      products.value = response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    loading.value = false;
  }
};

const deleteProduct = async (productUuid) => {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await axios.delete(
        `http://127.0.0.1:3000/api/seller/products/${productUuid}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.authToken}`,
          },
        }
      );
      products.value = products.value.filter(
        (product) => product.product_uuid !== productUuid
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  }
};

const handleAddProduct = async () => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:3000/api/seller/products",
      newProduct.value,
      {
        headers: {
          Authorization: `Bearer ${authStore.authToken}`,
        },
      }
    );
    products.value.push(response.data.data);
    showAddModal.value = false;
    newProduct.value = {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "Electronics",
    };
  } catch (error) {
    console.error("Failed to add product:", error);
  }
};

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.main-card {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  margin: 2rem auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.product-card {
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
}

.bi-three-dots-vertical {
  font-size: 1.2rem;
  color: #6c757d;
}

.btn-light:hover {
  background-color: #f8f9fa !important;
}

.modal.show {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
