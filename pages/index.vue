<template>
  <div class="flex flex-col w-full">
    <Markdown :source="news" />
  </div>
</template>

<script setup lang="ts">
import Markdown from '~/components/Markdown.vue';

const news = `
# Welcome to CodeCaptain 🚀

CodeCaptain is a code analysis tool that helps you understand your codebase better.

## Getting started

1. Login with a forge like GitHub or GitLab
2. Add your repositories and index it
3. Once indexed, you can ask questions about your codebase. For example:
   - What is this project about?
   - Which programming languages are used in this project?
   - Could you explain the technical project structure to me?

## How does it work?

CodeCaptain clones your repository and indexes the source code and issues using llm embeddings into a vector database.
This allows it to search for similar code snippets and provide you with insights into your codebase when you ask
it a question.

## Changelog

- Added chats
`;
</script>
