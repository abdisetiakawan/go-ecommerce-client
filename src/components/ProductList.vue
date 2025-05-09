<template>
  <div class="product-grid">
    <div
      v-for="store in stores"
      :key="store.store_id"
      class="store-section mb-4"
    >
      <div class="store-header mb-3">
        <h4 class="store-name">
          <i class="bi bi-shop me-2"></i>{{ store.store }}
        </h4>
      </div>

      <div class="row g-4">
        <div
          v-for="product in store.products"
          :key="product.product_uuid"
          class="col-md-6 col-lg-4"
        >
          <div class="card product-card h-100">
            <!-- Product Image Placeholder -->
            <div class="product-image-placeholder">
              <i class="bi bi-box-seam"></i>
            </div>

            <div class="card-body">
              <h5 class="card-title">{{ product.product_name }}</h5>

              <!-- Product Description -->
              <p class="card-text description-text">
                {{ product.description }}
              </p>

              <div class="product-info">
                <div class="price-stock">
                  <h6 class="price mb-0">Rp{{ formatPrice(product.price) }}</h6>
                  <span
                    :class="[
                      'stock-badge',
                      product.stock > 0 ? 'in-stock' : 'out-of-stock',
                    ]"
                  >
                    {{
                      product.stock > 0
                        ? `Stock: ${product.stock}`
                        : "Out of Stock"
                    }}
                  </span>
                </div>

                <div class="quantity-controls" v-if="product.stock > 0">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="
                      updateQuantity(
                        product.product_uuid,
                        Math.max(1, product.quantity - 1)
                      )
                    "
                  >
                    <i class="bi bi-dash"></i>
                  </button>
                  <input
                    type="number"
                    class="form-control form-control-sm quantity-input"
                    v-model.number="product.quantity"
                    min="1"
                    :max="product.stock"
                    @change="
                      updateQuantity(product.product_uuid, product.quantity)
                    "
                  />
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="
                      updateQuantity(
                        product.product_uuid,
                        Math.min(product.stock, product.quantity + 1)
                      )
                    "
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>

              <button
                class="btn btn-primary w-100 mt-3"
                @click="$emit('add-to-cart', store.store, product)"
                :disabled="product.stock <= 0"
              >
                <i class="bi bi-cart-plus me-2"></i>Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  stores: Array,
});

const emit = defineEmits(["add-to-cart", "update-quantity"]);

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};

const updateQuantity = (productUuid, quantity) => {
  emit("update-quantity", { productUuid, quantity });
};
</script>

<style scoped>
.product-card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.store-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.store-name {
  color: #2c3e50;
  font-weight: 600;
}

.product-image-placeholder {
  background: #f8f9fa;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image-placeholder i {
  font-size: 3rem;
  color: #dee2e6;
}

.description-text {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 1rem;
  height: 3em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.price-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.price {
  color: #2c3e50;
  font-weight: 600;
}

.stock-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.in-stock {
  background-color: #d4edda;
  color: #155724;
}

.out-of-stock {
  background-color: #f8d7da;
  color: #721c24;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.quantity-input {
  width: 60px;
  text-align: center;
}

.btn-primary {
  background-color: #0d6efd;
  border: none;
}

.btn-primary:disabled {
  background-color: #6c757d;
  opacity: 0.65;
}

@media (max-width: 768px) {
  .product-image-placeholder {
    height: 150px;
  }
}
</style>
