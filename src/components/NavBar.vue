<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Home, PlusCircle, User, Search, Leaf } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const searchQuery = ref('');

const emit = defineEmits<{
  search: [query: string];
}>();

const handleSearch = () => {
  emit('search', searchQuery.value);
  if (route.path !== '/') {
    router.push('/');
  }
};

const isActive = (path: string) => route.path === path;
</script>

<template>
  <nav class="sticky top-0 z-50 bg-rice-100/95 backdrop-blur-sm border-b border-rice-200">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <router-link to="/" class="flex items-center gap-2 group">
          <div class="w-10 h-10 bg-moss-500 rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
            <Leaf class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-bold text-moss-600 font-hand hidden sm:block">
            植换空间
          </span>
        </router-link>

        <div class="flex-1 max-w-md mx-4 hidden md:block">
          <div class="relative">
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="搜索植物、品种..."
              class="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-rice-200 rounded-full
                     text-sm text-gray-700 placeholder-gray-400 font-hand
                     focus:outline-none focus:border-moss-300 focus:bg-white
                     transition-all duration-300"
            />
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div class="flex items-center gap-1 sm:gap-2">
          <router-link
            to="/"
            class="flex flex-col sm:flex-row items-center gap-1 px-3 py-2 rounded-xl
                   transition-all duration-300"
            :class="isActive('/') ? 'text-moss-600 bg-moss-50' : 'text-gray-500 hover:text-moss-500 hover:bg-rice-100'"
          >
            <Home class="w-5 h-5" />
            <span class="text-xs font-hand hidden sm:inline">首页</span>
          </router-link>

          <router-link
            to="/publish"
            class="flex flex-col sm:flex-row items-center gap-1 px-3 py-2 rounded-xl
                   transition-all duration-300"
            :class="isActive('/publish') ? 'text-moss-600 bg-moss-50' : 'text-gray-500 hover:text-moss-500 hover:bg-rice-100'"
          >
            <PlusCircle class="w-5 h-5" />
            <span class="text-xs font-hand hidden sm:inline">发布</span>
          </router-link>

          <router-link
            to="/mine"
            class="flex flex-col sm:flex-row items-center gap-1 px-3 py-2 rounded-xl
                   transition-all duration-300"
            :class="isActive('/mine') ? 'text-moss-600 bg-moss-50' : 'text-gray-500 hover:text-moss-500 hover:bg-rice-100'"
          >
            <User class="w-5 h-5" />
            <span class="text-xs font-hand hidden sm:inline">我的</span>
          </router-link>
        </div>
      </div>

      <div class="md:hidden pb-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索植物、品种..."
            class="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-rice-200 rounded-full
                   text-sm text-gray-700 placeholder-gray-400 font-hand
                   focus:outline-none focus:border-moss-300 transition-all duration-300"
          />
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  </nav>
</template>
