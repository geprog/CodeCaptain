<template>
  <input
    :value="modelValue"
    @input="$emit('update:model-value', $event.target.value)"
    type="text"
    class="bg-gray-400 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  (event: "update:model-value", value: string): void;
}>();
</script>
