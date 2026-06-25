<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from '@/components/NavBar.vue';

const route = useRoute();
const searchQuery = ref('');

const showNavBar = computed(() => {
  return !['/publish', '/detail'].some((p) => route.path.startsWith(p));
});

const handleSearch = (query: string) => {
  searchQuery.value = query;
};
</script>

<template>
  <div class="min-h-screen bg-rice-50">
    <NavBar v-if="showNavBar" @search="handleSearch" />
    <router-view :search-query="searchQuery" @search="handleSearch" />
  </div>
</template>
