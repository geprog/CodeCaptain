<template>
  <div
    class="flex flex-col min-h-screen w-screen lg:flex-row bg-gradient-to-tl from-stone-200 to-stone-100 dark:from-neutral-950 dark:to-neutral-900"
  >
    <Menu />

    <main
      class="flex p-4 m-2 bg-white shadow dark:shadow-none lg:w-full lg:p-6 dark:bg-neutral-950 lg:ml-72 rounded-xl dark:rounded-none dark:m-0 dark:lg:ml-72"
    >
      <slot />
    </main>
  </div>
</template>

<style>
* {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
