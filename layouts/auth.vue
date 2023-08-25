<template>
  <div
    class="relative grid min-h-screen grid-cols-1 overflow-hidden md:grid-cols-3 lg:grid-cols-2 divide-x divide-zinc-600"
  >
    <div
      class="container absolute flex items-center col-span-1 -translate-y-1/2 top-1/2 md:static md:top-0 md:col-span-2 md:flex md:translate-y-0 lg:col-span-1"
    >
      <div class="mx-auto flex w-full flex-col justify-center space-y-6 px-6 md:px-0 sm:w-[500px]">
        <slot />
      </div>
    </div>
    <div
      class="hidden relative md:flex items-center justify-center bg-white md:bg-black h-screen bg-gradient-to-t from-blue-400/0 to-blue-400/20"
    >
      <div class="absolute inset-0 h-screen" aria-hidden="true">
        <div />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
