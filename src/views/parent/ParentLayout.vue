<script setup lang="ts">
import { ref } from 'vue'
import ParentGate from '@/components/ParentGate.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const unlocked = ref(store.isParentUnlocked())

function pass() {
  store.unlockParent()
  unlocked.value = true
}
</script>

<template>
  <main class="page parent">
    <RouterView v-if="unlocked" />
    <template v-else>
      <RouterLink class="icon-btn" :to="store.active ? { name: 'home' } : { name: 'profiles' }"
        >🏠</RouterLink
      >
      <ParentGate @pass="pass" />
    </template>
  </main>
</template>

<style scoped>
.parent {
  font-size: 18px;
}
</style>
