<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Sprout, Leaf, Sparkles } from 'lucide-vue-next';
import type { PlantCategory, Plant } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';
import { usePlants } from '@/composables/usePlants';
import { useFavorites } from '@/composables/useFavorites';
import PlantCard from '@/components/PlantCard.vue';

const props = defineProps<{
  searchQuery?: string;
}>();

const emit = defineEmits<{
  search: [query: string];
}>();

const router = useRouter();
const { plants, filterPlants, isLoaded, loadPlants } = usePlants();
const { isFavorited, toggleFavorite } = useFavorites();

const activeCategory = ref<PlantCategory | 'all'>('all');
const localSearch = ref('');

const categories = [
  { value: 'all' as const, label: '全部', icon: '🌿' },
  { value: 'succulent' as const, label: CATEGORY_LABELS.succulent, icon: CATEGORY_ICONS.succulent },
  { value: 'green' as const, label: CATEGORY_LABELS.green, icon: CATEGORY_ICONS.green },
  { value: 'flower' as const, label: CATEGORY_LABELS.flower, icon: CATEGORY_ICONS.flower },
  { value: 'tool' as const, label: CATEGORY_LABELS.tool, icon: CATEGORY_ICONS.tool },
];

const displayPlants = computed(() => {
  const keyword = props.searchQuery || localSearch.value;
  if (activeCategory.value === 'all' && !keyword) {
    return plants.value;
  }
  return filterPlants(
    activeCategory.value === 'all' ? undefined : activeCategory.value,
    keyword
  ).value;
});

const setCategory = (category: PlantCategory | 'all') => {
  activeCategory.value = category;
};

const goToDetail = (plant: Plant) => {
  router.push(`/detail/${plant.id}`);
};

const handleToggleFavorite = (plantId: string) => {
  toggleFavorite(plantId);
};

const checkIsFavorited = (plantId: string) => {
  return isFavorited(plantId);
};

onMounted(() => {
  if (!isLoaded.value) {
    loadPlants();
  }
});

watch(
  () => props.searchQuery,
  (val) => {
    if (val !== undefined) {
      localSearch.value = val;
    }
  }
);
</script>

<template>
  <div class="min-h-screen bg-rice-50">
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6 text-center md:text-left">
        <h1 class="text-2xl md:text-3xl font-bold text-moss-600 font-hand mb-2 flex items-center justify-center md:justify-start gap-2">
          <Sparkles class="w-6 h-6 text-moss-400" />
          发现邻居的小植物
          <Sprout class="w-6 h-6 text-moss-400" />
        </h1>
        <p class="text-gray-500 font-hand text-sm">
          让闲置的植物找到新的家，交换一份绿意与好心情 🌱
        </p>
      </div>

      <div class="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="tag transition-all duration-300"
          :class="activeCategory === cat.value ? 'tag-active' : 'tag-inactive'"
          @click="setCategory(cat.value)"
        >
          <span>{{ cat.icon }}</span>
          <span class="font-hand">{{ cat.label }}</span>
        </button>
      </div>

      <div v-if="displayPlants.length === 0" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-4 bg-rice-100 rounded-full flex items-center justify-center">
          <Leaf class="w-12 h-12 text-rice-300" />
        </div>
        <p class="text-gray-400 font-hand mb-2">暂无相关植物</p>
        <p class="text-gray-300 font-hand text-sm">试试其他分类或搜索关键词吧~</p>
      </div>

      <div v-else class="masonry-grid">
        <PlantCard
          v-for="plant in displayPlants"
          :key="plant.id"
          :plant="plant"
          :is-favorited="checkIsFavorited(plant.id)"
          @click="goToDetail(plant)"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>
    </div>

    <div class="h-20"></div>
  </div>
</template>
