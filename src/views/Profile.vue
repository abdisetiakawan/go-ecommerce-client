<template>
  <div>
    <!-- Navbar akan muncul otomatis dari App.vue -->
    <div class="main-card">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold">User Profile</h3>
        <button
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
            :src="profileData.avatar || '/default-avatar.png'"
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
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div class="modal fade" id="profileModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Profile</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
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
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Modal } from "bootstrap";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const profileData = ref(null);
const editForm = ref({});
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");
const validationErrors = ref({});
let profileModal = null;

const fetchProfile = async () => {
  try {
    const response = await axios.get("api/user/profile", {
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
    errorMessage.value = "Failed to load profile data";
    if (error.response?.status === 401) {
      router.push("/login");
    }
  } finally {
    loading.value = false;
  }
};

const showEditModal = () => {
  if (!profileModal) {
    profileModal = new Modal(document.getElementById("profileModal"));
  }
  profileModal.show();
};

const handleSave = async () => {
  saving.value = true;
  validationErrors.value = {};
  try {
    const response = await axios.put("api/user/profile", editForm.value, {
      headers: {
        Authorization: `Bearer ${authStore.authToken}`,
      },
    });

    if (response.data.status === "success") {
      profileData.value = response.data.data;
      localStorage.setItem("profileData", JSON.stringify(response.data.data));
      await authStore.fetchName();
      if (profileModal) profileModal.hide();
    }
  } catch (error) {
    if (error.response?.status === 400) {
      if (error.response.data.errors.PhoneNumber) {
        validationErrors.value.phone_number = "Invalid phone number format";
      }
    } else {
      errorMessage.value =
        error.response?.data?.message || "Failed to update profile";
    }
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (!authStore.authToken) {
    router.push("/login");
  } else {
    const storedProfileData = localStorage.getItem("profileData");
    if (storedProfileData) {
      profileData.value = JSON.parse(storedProfileData);
      editForm.value = { ...profileData.value };
      loading.value = false;
    } else {
      fetchProfile();
    }
  }
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
