<template>
  <div>
    <!-- Navbar akan muncul otomatis dari App.vue -->
    <div class="main-card">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold">User Profile</h3>
        <button
          v-if="profileData"
          class="btn btn-primary"
          style="background: #6366f1; border: none"
          @click="showEditModal"
        >
          Edit Profile
        </button>
      </div>

      <!-- Profile Content -->
      <div v-if="profileData" class="row align-items-center mb-4">
        <div class="col-md-3 text-center">
          <img
            :src="profileData.avatar || 'https://placehold.co/400'"
            alt="avatar"
            class="profile-avatar mb-3"
          />
        </div>
        <div class="col-md-9">
          <h4 class="mb-3 text-capitalize">{{ profileData.name }}</h4>
          <div class="row">
            <div class="col-md-6">
              <p class="mb-2">
                <i class="bi bi-person-circle me-2 text-secondary"></i>@{{
                  profileData.username
                }}
              </p>
              <p class="mb-2">
                <i class="bi bi-telephone me-2"></i
                >{{ profileData.phone_number }}
              </p>
              <p class="mb-0">
                <i class="bi bi-geo-alt me-2 text-capitalize"></i
                >{{ profileData.address }}
              </p>
            </div>
            <div class="col-md-6">
              <span class="badge bg-info text-capitalize">{{
                profileData.gender
              }}</span>
              <div class="mt-3">
                <h6>About Me:</h6>
                <p class="bio-text text-muted text-lowercase">
                  {{ profileData.bio }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else-if="loading" class="text-center">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2">Loading profile...</p>
      </div>

      <!-- Error state -->
      <div v-else class="alert alert-danger">
        {{ errorMessage }}
        <button
          v-if="showCreateButton"
          class="btn btn-link p-0 ms-2"
          @click="showCreateModal"
        >
          Create Profile
        </button>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div class="modal fade" id="profileModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isCreating ? "Create Profile" : "Edit Profile" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              v-if="!isCreating"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
              <div class="form-floating mb-3">
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="editForm.name"
                  required
                />
                <label for="name">Full Name</label>
                <div v-if="validationErrors.name" class="text-danger">
                  {{ validationErrors.name }}
                </div>
              </div>

              <div class="form-floating mb-3">
                <input
                  type="tel"
                  class="form-control"
                  id="phone"
                  v-model="editForm.phone_number"
                  required
                />
                <label for="phone">Phone Number</label>
                <div v-if="validationErrors.phone_number" class="text-danger">
                  {{ validationErrors.phone_number }}
                </div>
              </div>

              <div class="form-floating mb-3">
                <textarea
                  class="form-control"
                  id="address"
                  style="height: 100px"
                  v-model="editForm.address"
                  required
                ></textarea>
                <label for="address">Address</label>
                <div v-if="validationErrors.address" class="text-danger">
                  {{ validationErrors.address }}
                </div>
              </div>

              <div class="form-floating mb-3">
                <select
                  class="form-select"
                  id="gender"
                  v-model="editForm.gender"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <label for="gender">Gender</label>
                <div v-if="validationErrors.gender" class="text-danger">
                  {{ validationErrors.gender }}
                </div>
              </div>

              <div class="form-floating mb-3">
                <input
                  type="url"
                  class="form-control"
                  id="avatar"
                  v-model="editForm.avatar"
                />
                <label for="avatar">Avatar URL</label>
                <div v-if="validationErrors.avatar" class="text-danger">
                  {{ validationErrors.avatar }}
                </div>
              </div>

              <div class="form-floating mb-3">
                <textarea
                  class="form-control"
                  id="bio"
                  style="height: 100px"
                  v-model="editForm.bio"
                ></textarea>
                <label for="bio">Bio</label>
                <div v-if="validationErrors.bio" class="text-danger">
                  {{ validationErrors.bio }}
                </div>
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
                  type="submit"
                  class="btn btn-primary"
                  :disabled="saving"
                >
                  {{ saving ? "Saving..." : "Save Changes" }}
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
import { ref, onMounted } from "vue";
import axios from "axios";
import { Modal } from "bootstrap";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const profileData = ref(null);
const editForm = ref({});
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");
const validationErrors = ref({});
const isCreating = ref(false);
const showCreateButton = ref(false);
let profileModal = null;

const fetchProfile = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:3000/api/user/profile", {
      headers: {
        Authorization: `Bearer ${authStore.authToken}`,
      },
    });

    if (response.data.status === "success") {
      profileData.value = response.data.data;
      editForm.value = { ...response.data.data };
      localStorage.setItem("profileData", JSON.stringify(response.data.data));
    }
  } catch (error) {
    if (error.response?.status === 401) {
      errorMessage.value = "Failed to load profile data";
    } else if (error.response?.status === 404) {
      showCreateButton.value = true;
      errorMessage.value = "Profile not found. Please create your profile.";
    } else {
      errorMessage.value = "Failed to load profile data";
    }
  } finally {
    loading.value = false;
  }
};

const showCreateModal = () => {
  isCreating.value = true;
  initModal(true);
  profileModal.show();
};

const showEditModal = () => {
  isCreating.value = false;
  initModal(false);
  profileModal.show();
};

const initModal = (isStatic) => {
  if (profileModal) profileModal.dispose();

  const options = isStatic ? { backdrop: "static", keyboard: false } : {};

  profileModal = new Modal(document.getElementById("profileModal"), options);
};

const handleSave = async () => {
  saving.value = true;
  validationErrors.value = {};

  try {
    const method = isCreating.value ? "post" : "put";
    const response = await axios[method](
      "http://127.0.0.1:3000/api/user/profile",
      editForm.value,
      {
        headers: {
          Authorization: `Bearer ${authStore.authToken}`,
        },
      }
    );

    profileData.value = response.data.data;
    isCreating.value = false;
    profileModal.hide();
    await fetchProfile();
  } catch (error) {
    if (error.response?.status === 400) {
      validationErrors.value = error.response.data.errors;
    } else {
      errorMessage.value = error.response?.data?.message || "Operation failed";
    }
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  if (!authStore.authToken) {
    errorMessage.value = "Failed to load profile data";
    loading.value = false;
    return;
  }

  await fetchProfile();
});
</script>

<style scoped>
body {
  background: #f8f9fa;
  min-height: 100vh;
}
.main-card {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  margin: 2rem auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
}

.bio-text {
  white-space: pre-line;
}

.nav-link.active {
  color: #6366f1 !important;
  border-bottom: 2px solid #6366f1;
}
</style>
