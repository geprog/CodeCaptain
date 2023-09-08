<template>
  <div class="flex gap-4">
    <div class="w-48 overflow flex-shrink-0">
      <FileTree :load-directory="loadDirectory" @click-item="clickTreeItem" />
    </div>
    <div v-if="code" class="flex-grow">
      <CodePanel :code="code" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  repoId: string;
}>();

const repoId = toRef(props, 'repoId');
const code = ref<string>();

async function loadDirectory(path: string) {
  return await $fetch(`/api/repos/${repoId.value}/files/tree`, {
    query: {
      path,
    },
  });
}

async function clickTreeItem({ path, type }: { path: string; type: 'file' | 'directory' }) {
  if (type === 'directory') {
    return;
  }

  code.value = undefined;

  const c = await $fetch(`/api/repos/${repoId.value}/files/file`, {
    query: {
      path,
    },
  });

  code.value = c;
}
</script>
