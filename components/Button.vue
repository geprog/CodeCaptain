<template>
  <div
    class="text-gray-900 bg-gray-200 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 font-semibold"
  >
    <a v-if="href" :href="href">
      <slot />
    </a>
    <button v-else>
      <slot />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ href?: string }>();
</script>
