<script setup lang="ts">
import { RouterView } from 'vue-router'
import InstallHint from './components/InstallHint.vue'
</script>

<template>
  <InstallHint />
  <!-- Keyed by path: a new unit or subject always starts fresh, also between categories. -->
  <RouterView :key="$route.path" />
</template>
