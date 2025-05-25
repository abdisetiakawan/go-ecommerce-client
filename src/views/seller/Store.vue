<template>
  <div class="main-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading store...</p>
    </div>

    <div v-else>
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0"><i class="bi bi-shop me-3"></i>Store Management</h2>
        <button
          v-if="!store"
          class="btn btn-primary"
          @click="showRegisterModal"
        >
          <i class="bi bi-plus-circle me-2"></i>Register New Store
        </button>
        <button v-else class="btn btn-warning" @click="showUpdateModal">
          <i class="bi bi-pencil me-2"></i>Edit Store
        </button>
      </div>
      <!-- Store Card -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0"><i class="bi bi-list-ul me-2"></i>My Store</h5>
        </div>
        <div class="card-body">
          <div v-if="!store" class="no-stores">
            <i class="bi bi-shop"></i>
            <h4>No Store Found</h4>
            <p>
              You haven't registered a store yet. Click "Register New Store" to
              get started.
            </p>
          </div>
          <div v-else>
            <div class="store-card">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <div class="store-name">{{ store.store_name }}</div>
                  <div class="store-description">{{ store.description }}</div>
                  <div class="text-muted mt-2" style="font-size: 0.9em">
                    Created at: {{ store.created_at }}<br />
                    Updated at: {{ store.updated_at }}
                  </div>
                </div>
                <div class="ms-3">
                  <button
                    class="btn btn-warning btn-sm"
                    @click="showUpdateModal"
                  >
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Store Modal -->
    <div class="modal fade" id="registerStoreModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-shop me-2"></i>Register New Store
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="registerStore">
              <div class="mb-3">
                <label for="storeName" class="form-label">Store Name *</label>
                <input
                  type="text"
                  class="form-control"
                  id="storeName"
                  v-model="registerForm.store_name"
                  :class="{ 'is-invalid': validationErrors.store_name }"
                  required
                />
                <div class="invalid-feedback">
                  {{ validationErrors.store_name }}
                </div>
              </div>
              <div class="mb-3">
                <label for="storeDescription" class="form-label"
                  >Description *</label
                >
                <textarea
                  class="form-control"
                  id="storeDescription"
                  v-model="registerForm.description"
                  :class="{ 'is-invalid': validationErrors.description }"
                  rows="4"
                  required
                ></textarea>
                <div class="invalid-feedback">
                  {{ validationErrors.description }}
                </div>
              </div>
            </form>
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
              @click="registerStore"
              :disabled="registerLoading"
            >
              <span
                v-if="registerLoading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="bi bi-check-circle me-2"></i>
              Register Store
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Store Modal -->
    <div class="modal fade" id="updateStoreModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil-square me-2"></i>Update Store
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateStore">
              <div class="mb-3">
                <label for="updateStoreName" class="form-label"
                  >Store Name *</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="updateStoreName"
                  v-model="updateForm.store_name"
                  :class="{ 'is-invalid': validationErrors.store_name }"
                  required
                />
                <div class="invalid-feedback">
                  {{ validationErrors.store_name }}
                </div>
              </div>
              <div class="mb-3">
                <label for="updateStoreDescription" class="form-label"
                  >Description *</label
                >
                <textarea
                  class="form-control"
                  id="updateStoreDescription"
                  v-model="updateForm.description"
                  :class="{ 'is-invalid': validationErrors.description }"
                  rows="4"
                  required
                ></textarea>
                <div class="invalid-feedback">
                  {{ validationErrors.description }}
                </div>
              </div>
            </form>
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
              class="btn btn-success"
              @click="updateStore"
              :disabled="updateLoading"
            >
              <span
                v-if="updateLoading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="bi bi-check-circle me-2"></i>
              Update Store
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Modal } from "bootstrap";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import axiosInstance from "../../services/axios";
import Swal from "sweetalert2";

const authStore = useAuthStore();
const router = useRouter();

const loading = ref(true);
const registerLoading = ref(false);
const updateLoading = ref(false);
const store = ref(null);
const registerForm = ref({
  store_name: "",
  description: "",
});
const updateForm = ref({
  id: null,
  store_name: "",
  description: "",
});
const validationErrors = ref({});

let registerModal = null;
let updateModal = null;

// Fetch store from API
const fetchStore = async () => {
  try {
    loading.value = true;
    const response = await axiosInstance.get("/seller/store");
    if (response.data.status === "success" && response.data.data) {
      store.value = response.data.data;
    } else {
      store.value = null;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
    } else {
      store.value = null;
    }
  } finally {
    loading.value = false;
  }
};

const validateStoreData = (data) => {
  const errors = {};
  if (!data.store_name || data.store_name.trim().length < 3) {
    errors.store_name = "Store name must be at least 3 characters long";
  }
  if (!data.description || data.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters long";
  }
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const showRegisterModal = () => {
  registerForm.value = {
    store_name: "",
    description: "",
  };
  validationErrors.value = {};
  if (!registerModal) {
    registerModal = new Modal(document.getElementById("registerStoreModal"));
  }
  registerModal.show();
};

const showUpdateModal = () => {
  updateForm.value = {
    store_name: store.value.store_name,
    description: store.value.description,
  };
  validationErrors.value = {};
  if (!updateModal) {
    updateModal = new Modal(document.getElementById("updateStoreModal"));
  }
  updateModal.show();
};

const registerStore = async () => {
  if (!validateStoreData(registerForm.value)) return;
  try {
    registerLoading.value = true;
    const storeData = {
      store_name: registerForm.value.store_name.trim(),
      description: registerForm.value.description.trim(),
    };
    const response = await axiosInstance.post("/seller/store", storeData);
    if (response.data.status === "success") {
      registerModal.hide();
      await Swal.fire({
        title: "Success!",
        text: "Store registered successfully!",
        icon: "success",
        confirmButtonColor: "#28a745",
      });
      await fetchStore();
    } else {
      throw new Error(response.data.message || "Failed to register store");
    }
  } catch (error) {
    let errorMessage = "Failed to register store. Please try again.";
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
      return;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    await Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#dc3545",
    });
  } finally {
    registerLoading.value = false;
  }
};

const updateStore = async () => {
  if (!validateStoreData(updateForm.value)) return;
  try {
    updateLoading.value = true;
    const storeData = {
      store_name: updateForm.value.store_name.trim(),
      description: updateForm.value.description.trim(),
    };
    const response = await axiosInstance.put(`/seller/store`, storeData);
    if (response.data.status === "success") {
      updateModal.hide();
      await Swal.fire({
        title: "Success!",
        text: "Store updated successfully!",
        icon: "success",
        confirmButtonColor: "#28a745",
      });
      await fetchStore();
    } else {
      throw new Error(response.data.message || "Failed to update store");
    }
  } catch (error) {
    let errorMessage = "Failed to update store. Please try again.";
    if (error.response?.status === 401) {
      authStore.logout();
      router.push("/login");
      return;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    await Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#dc3545",
    });
  } finally {
    updateLoading.value = false;
  }
};

onMounted(() => {
  fetchStore();
});
</script>

<style scoped>
.main-container {
  max-width: 800px;
  padding: 1.5rem;
  margin: 1rem auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: #fff;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e5;
  padding: 1rem 1.25rem;
  font-weight: 600;
  color: #333;
}

.btn-primary {
  background: #007bff;
  border: 1px solid #007bff;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  border-color: #0056b3;
}

.btn-success {
  background: #28a745;
  border: 1px solid #28a745;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: #fff;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
  border-color: #1e7e34;
}

.btn-warning {
  background: #ffc107;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
  border-color: #e0a800;
}

.form-control {
  border-radius: 4px;
  border: 1px solid #ced4da;
  padding: 0.5rem 0.75rem;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.modal-content {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.modal-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e5;
}

.store-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e5e5;
}

.store-name {
  color: #333;
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.store-description {
  color: #666;
  font-size: 0.95rem;
}

.no-stores {
  text-align: center;
  padding: 2rem 1rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 6px;
}

.no-stores i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #ccc;
}

/* Responsive */
@media (max-width: 768px) {
  .main-container {
    padding: 1rem;
    margin: 0.5rem auto;
  }

  .card-header {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .store-card {
    padding: 0.75rem;
  }
}
</style>
