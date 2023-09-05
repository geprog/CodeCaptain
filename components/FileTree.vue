<template>
  <UVerticalNavigation
    :links="fileTree"
    :ui="{
      label: 'truncate relative text-gray-900 dark:text-white flex-initial text-left',
    }"
    @click="clickTree"
  >
    <template #default="{ link }">
      <div class="relative text-left w-full">
        <div class="mb-2">
          {{ link.label }}
        </div>
        <UVerticalNavigation v-if="link.children" :links="link.children" />
      </div>
    </template>
    <!-- <template #badge="{ link }">
      <div class="flex-1 flex justify-between relative truncate">
        <div>{{ link.badge }}</div>
        <div>{{ link.time }}</div>
      </div>
    </template> -->
  </UVerticalNavigation>
</template>

<script setup lang="ts">
type File = {
  path: string;
  name: string;
  type: 'file';
};

type Directory = {
  path: string;
  name: string;
  type: 'directory';
  children?: (Directory | File)[];
};

type Link = {
  label: string;
  icon?: string;
  badge?: string;
  time?: string;
  children?: Link[];
};

const props = defineProps<{
  loadPath: (path: string) => Promise<Directory>;
}>();

const root = ref<Directory>({
  path: '/',
  name: '/',
  type: 'directory',
  children: [],
});

function directoryToLink(d: Directory | File): Link {
  return {
    label: d.name,
    icon: d.type === 'directory' ? 'i-heroicons-folder-20-solid' : 'i-heroicons-document-20-solid',
    children: d.type === 'directory' ? d.children?.map((child) => directoryToLink(child)) : undefined,
  };
}

const fileTree = computed(() => root.value.children?.map((c) => directoryToLink(c)) || []);

function setDirectoryRecursive(parent: Directory, directory: Directory): Directory {
  let children = parent.children || [];

  if (children.find((c) => directory.path.startsWith(c.path))) {
    children = children.map((c) => {
      if (c.type === 'file' || directory.path.startsWith(c.path)) {
        return c;
      }

      if (parent.path === directory.path) {
        return directory;
      }

      return setDirectoryRecursive(c, directory);
    });
  } else {
    children.push(directory);
  }

  return { ...parent, children };
}

async function loadPath(path: string) {
  const directory = await props.loadPath(path);
  console.log(directory);
  console.log(root.value);
  root.value = setDirectoryRecursive(root.value, directory);
  console.log(root.value);
}

onMounted(async () => {
  await loadPath('/');
});

function clickTree(e) {
  console.log(e);
}
</script>
