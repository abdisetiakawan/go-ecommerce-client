<template>
  <div v-if="hasStore" class="main-card">
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
                      <button
                        @click="openEditModal(product)"
                        class="dropdown-item"
                      >
                        <i class="bi bi-pencil me-2"></i>Edit
                      </button>
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
                  v-model="newProduct.product_name"
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
                  <option value="electronics">Electronics</option>
                  <option value="clothes">Clothes</option>
                  <option value="accessories">Accessories</option>
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

    <!-- Edit Product Modal -->
    <div
      class="modal fade"
      :class="{ show: showEditModal }"
      tabindex="-1"
      v-if="showEditModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Product</h5>
            <button
              type="button"
              class="btn-close"
              @click="showEditModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleEditProduct">
              <div class="form-floating mb-3">
                <input
                  type="text"
                  class="form-control"
                  id="editProductName"
                  v-model="editProduct.product_name"
                  required
                />
                <label for="editProductName">Product Name</label>
              </div>
              <div class="form-floating mb-3">
                <textarea
                  class="form-control"
                  id="editProductDesc"
                  style="height: 100px"
                  v-model="editProduct.description"
                ></textarea>
                <label for="editProductDesc">Description</label>
              </div>
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="number"
                      class="form-control"
                      id="editProductPrice"
                      step="0.01"
                      v-model="editProduct.price"
                      required
                    />
                    <label for="editProductPrice">Price</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="number"
                      class="form-control"
                      id="editProductStock"
                      v-model="editProduct.stock"
                      required
                    />
                    <label for="editProductStock">Stock</label>
                  </div>
                </div>
              </div>
              <div class="form-floating mb-3">
                <select
                  class="form-select"
                  id="editProductCategory"
                  v-model="editProduct.category"
                  required
                >
                  <option value="electronics">Electronics</option>
                  <option value="clothes">Clothes</option>
                  <option value="accessories">Accessories</option>
                </select>
                <label for="editProductCategory">Category</label>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="showEditModal = false"
                >
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="d-flex flex-column align-items-center justify-content-center"
    style="min-height: 60vh"
  >
    <i class="bi bi-shop text-primary" style="font-size: 4rem"></i>
    <h3 class="mt-3 mb-2 text-secondary fw-bold">No Store Registered</h3>
    <p
      class="mb-4 text-muted text-center"
      style="max-width: 400px; line-height: 1.5"
    >
      You need to register your store before you can add or manage products.
    </p>
    <button
      class="btn btn-primary px-4 py-2"
      @click="router.push('/seller/store')"
    >
      <i class="bi bi-plus-circle me-2"></i>Register Store Now
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import axiosInstance from "../services/axios";
import Swal from "sweetalert2";

const router = useRouter();
const authStore = useAuthStore();
const products = ref([]);
const loading = ref(true);
const showAddModal = ref(false);
const showEditModal = ref(false);
const searchQuery = ref("");
const selectedCategory = ref("");
const minPrice = ref(null);
const maxPrice = ref(null);

const hasStore = ref(true); // Tambahkan state ini

const newProduct = ref({
  product_name: "",
  description: "",
  price: 0,
  stock: 0,
  category: "Electronics",
});

const editProduct = ref({
  product_uuid: "",
  product_name: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
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

// Cek store seller sebelum fetch produk
const checkStore = async () => {
  try {
    const response = await axiosInstance.get("/seller/store");
    if (response.data.status === "success" && response.data.data) {
      hasStore.value = true;
    } else {
      hasStore.value = false;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
    } else {
      hasStore.value = false;
    }
  }
};

const fetchProducts = async () => {
  try {
    const response = await axiosInstance.get("/product");
    if (response.data.status === "success") {
      products.value = response.data.data;
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

const deleteProduct = async (productUuid) => {
  const result = await Swal.fire({
    title: "Delete Product",
    text: "Are you sure you want to delete this product?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    try {
      await axiosInstance.delete(`/seller/products/${productUuid}`);
      products.value = products.value.filter(
        (product) => product.product_uuid !== productUuid
      );

      await Swal.fire({
        title: "Deleted!",
        text: "Product has been deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to delete product:", error);
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to delete product",
        icon: "error",
      });
      if (error.response?.status === 401) {
        authStore.logout();
        router.push("/login");
      }
    }
  }
};

const handleAddProduct = async () => {
  try {
    Swal.fire({
      title: "Adding Product...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await axiosInstance.post(
      "/seller/products",
      newProduct.value
    );
    products.value.push(response.data.data);
    showAddModal.value = false;
    newProduct.value = {
      product_name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "Electronics",
    };

    await Swal.fire({
      title: "Success!",
      text: "Product added successfully",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Failed to add product:", error);
    await Swal.fire({
      title: "Error!",
      text: error.response?.data?.message || "Failed to add product",
      icon: "error",
    });
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
    }
  }
};

const openEditModal = (product) => {
  editProduct.value = { ...product };
  showEditModal.value = true;
};

const handleEditProduct = async () => {
  try {
    const response = await axiosInstance.put(
      `/seller/products/${editProduct.value.product_uuid}`,
      editProduct.value
    );
    const index = products.value.findIndex(
      (p) => p.product_uuid === editProduct.value.product_uuid
    );
    products.value[index] = response.data.data;
    showEditModal.value = false;
  } catch (error) {
    console.error("Failed to edit product:", error);
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
    }
  }
};

onMounted(async () => {
  await checkStore();
  if (!hasStore.value) {
    // Redirect ke halaman store jika belum punya store
    await Swal.fire({
      title: "No Store Registered",
      text: "You must register your store before managing products.",
      icon: "info",
      confirmButtonText: "Go to Store Registration",
      confirmButtonColor: "#6366f1",
      allowOutsideClick: false,
    });
    router.push("/seller/store");
    return;
  }
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
