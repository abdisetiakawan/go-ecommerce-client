<template>
  <div class="col">
    <div class="card product-card h-100">
      <img
        :src="product.image || 'https://placehold.co/100'"
        class="card-img-top product-image"
        :alt="product.product_name"
      />
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="card-title">{{ product.product_name }}</h5>
            <div class="d-flex gap-2 align-items-center">
              <span class="badge bg-warning">Rp{{ product.price }}</span>
              <span class="badge bg-secondary">Stock: {{ product.stock }}</span>
              <span class="badge badge-category">{{ product.category }}</span>
            </div>
          </div>
        </div>
        <div class="mt-3 d-flex gap-2">
          <input
            type="number"
            class="form-control quantity-input"
            :value="product.quantity"
            @input="updateQuantity($event.target.value)"
            :min="1"
            :max="product.stock"
          />
          <button
            class="btn btn-outline-secondary btn-sm"
            @click="emitAddToCart"
          >
            <i class="bi bi-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: Object,
  store: String,
});

const emit = defineEmits(["add-to-cart", "update-quantity"]);

const updateQuantity = (value) => {
  const quantity = Math.max(
    1,
    Math.min(props.product.stock, parseInt(value) || 1)
  );
  emit("update-quantity", {
    productUuid: props.product.product_uuid,
    quantity: quantity,
  });
};

const emitAddToCart = () => {
  emit("add-to-cart", props.store, props.product);
};
</script>

<style scoped>
.product-card {
  transition: transform 0.2s;
  border: 1px solid #eee;
}
.product-card:hover {
  transform: translateY(-2px);
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
