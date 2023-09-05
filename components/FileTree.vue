<template>
  <FileTreeFolder :root="root" :load-directory="loadDirectory" @click-item="$emit('clickItem', $event)" />
</template>

<script setup lang="ts">
import { Directory, setDirectoryRecursive } from './file-tree-utils';

const props = defineProps<{
  loadDirectory: (path: string) => Promise<Directory>;
}>();

defineEmits<{
  (event: 'clickItem', o: { path: string; type: 'file' | 'directory' }): void;
}>();

const root = ref<Directory>({
  path: '/',
  name: '/',
  type: 'directory',
  children: [],
});

async function loadDirectory(path: string) {
  const directory = await props.loadDirectory(path);
  root.value = setDirectoryRecursive(root.value, directory);
}

onMounted(async () => {
  await loadDirectory('/');
});
</script>
