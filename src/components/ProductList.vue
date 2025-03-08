<template>
  <div>
    <div v-for="store in stores" :key="store.store_id" class="store-section">
      <div
        class="d-flex justify-content-between align-items-center mb-4 text-capitalize"
      >
        <h4 class="fw-bold">{{ store.store }}</h4>
        <span class="badge bg-primary"
          >{{ store.products.length }} Products</span
        >
      </div>
      <div class="row row-cols-1 row-cols-md-2 g-4">
        <ProductCard
          v-for="product in store.products"
          :key="product.product_uuid"
          :product="product"
          :store="store.store"
          @add-to-cart="(s, p) => $emit('add-to-cart', s, p)"
          @update-quantity="$emit('update-quantity', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductCard from "./ProductCard.vue";

const props = defineProps({
  stores: Array,
});

const emit = defineEmits(["add-to-cart", "update-quantity"]);
</script>
