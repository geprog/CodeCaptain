<template>
  <div
    class="flex text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 rounded-lg text-sm mr-2 mb-2 font-semibold"
  >
    <a v-if="href" :href="href" :target="target" class="px-5 py-2.5">
      <slot />
    </a>
    <button v-else class="px-5 py-2.5">
      <slot />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ href?: string; target?: string }>();
</script>
