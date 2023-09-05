<template>
  <div class="flex flex-col overflow-y">
    <div v-for="c in root.children" :key="c.name">
      <div
        v-if="c.type === 'file'"
        class="flex items-center gap-1 w-full cursor-pointer hover:bg-zinc-200 hover:dark:bg-zinc-700 rounded-md"
        @click="$emit('clickItem', { path: c.path, type: 'file' })"
      >
        <UIcon name="i-heroicons-document" />
        <span>{{ c.name }}</span>
      </div>
      <div v-else>
        <div
          class="flex items-center cursor-pointer hover:bg-zinc-200 hover:dark:bg-zinc-700 rounded-md gap-1 w-full"
          @click="_loadDirectory(c)"
        >
          <UIcon v-if="isOpened[c.path]" name="i-heroicons-folder-open" />
          <UIcon v-else name="i-heroicons-folder-20-solid" />
          <span>{{ c.name }}</span>
        </div>
        <FileTreeFolder
          v-if="isOpened[c.path]"
          :root="c"
          class="ml-2"
          :load-directory="loadDirectory"
          @click-item="$emit('clickItem', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Directory } from './file-tree-utils';

const props = defineProps<{
  root: Directory;
  loadDirectory: (path: string) => Promise<Directory>;
}>();

const emit = defineEmits<{
  (event: 'clickItem', o: { path: string; type: 'file' | 'directory' }): void;
}>();

const isOpened = ref({} as Record<string, boolean>);

async function _loadDirectory(d: Directory) {
  if (d.children && d.children.length > 0) {
    isOpened.value[d.path] = !isOpened.value[d.path];
    emit('clickItem', { path: d.path, type: 'directory' });
    return;
  }

  await props.loadDirectory(d.path);
  isOpened.value[d.path] = true;
}
</script>
