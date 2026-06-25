<script setup lang="ts">
import { ref, computed } from 'vue';
import { MapPin, Clock, Heart } from 'lucide-vue-next';
import type { Plant } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';
import { formatDate } from '@/utils/image';

const props = defineProps<{
  plant: Plant;
  isFavorited?: boolean;
  showActions?: boolean;
  showDelete?: boolean;
}>();

const emit = defineEmits<{
  click: [plant: Plant];
  'toggle-favorite': [plantId: string];
  delete: [plantId: string];
}>();

const justToggled = ref(false);

const plantImage = computed(() => {
  if (props.plant.images && props.plant.images.length > 0) {
    return props.plant.images[0];
  }
  const categoryImages: Record<string, string> = {
    succulent: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20succulent%20plant%20in%20ceramic%20pot%20on%20beige%20background&image_size=square',
    green: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20houseplant%20monstera%20in%20pot%20soft%20light&image_size=square',
    flower: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20pink%20roses%20bouquet%20soft%20aesthetic&image_size=square',
    tool: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gardening%20tools%20set%20on%20wooden%20table%20cozy&image_size=square',
  };
  return categoryImages[props.plant.category] || categoryImages.succulent;
});

const categoryLabel = computed(() => CATEGORY_LABELS[props.plant.category]);
const categoryIcon = computed(() => CATEGORY_ICONS[props.plant.category]);
const timeAgo = computed(() => formatDate(props.plant.createdAt));

const handleCardClick = () => {
  emit('click', props.plant);
};

const handleFavoriteClick = (e: Event) => {
  e.stopPropagation();
  emit('toggle-favorite', props.plant.id);
  justToggled.value = true;
  setTimeout(() => {
    justToggled.value = false;
  }, 400);
};

const handleDeleteClick = (e: Event) => {
  e.stopPropagation();
  emit('delete', props.plant.id);
};
</script>

<template>
  <div
    class="card masonry-item cursor-pointer relative group animate-fade-in"
    @click="handleCardClick"
  >
    <div class="washi-tape" v-if="Math.random() > 0.5"></div>
    <div class="washi-tape-alt" v-else></div>

    <div class="relative overflow-hidden rounded-t-3xl">
      <img
        :src="plantImage"
        :alt="plant.name"
        class="w-full object-cover transition-transform duration-500 group-hover:scale-105"
        :class="plant.images?.length ? 'aspect-auto' : 'aspect-square'"
        loading="lazy"
      />
      <div
        class="absolute top-3 left-3 tag bg-white/90 backdrop-blur-sm text-moss-600 shadow-soft"
      >
        <span>{{ categoryIcon }}</span>
        <span class="text-xs font-medium">{{ categoryLabel }}</span>
      </div>

      <button
        v-if="showActions !== false"
        class="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full
               flex items-center justify-center shadow-soft transition-all duration-300
               hover:scale-110 active:scale-95"
        :class="[
          isFavorited ? 'text-moss-500' : 'text-gray-400 hover:text-moss-400',
          justToggled ? 'animate-bounce-soft' : ''
        ]"
        @click="handleFavoriteClick"
      >
        <Heart class="w-4 h-4" :fill="isFavorited ? 'currentColor' : 'none'" />
      </button>
    </div>

    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-800 font-hand mb-1 line-clamp-1">
        {{ plant.name }}
      </h3>
      <p class="text-sm text-gray-500 font-hand mb-3 line-clamp-1">
        {{ plant.variety }}
      </p>

      <div class="flex items-center gap-3 text-xs text-gray-400 font-hand">
        <div class="flex items-center gap-1">
          <Clock class="w-3.5 h-3.5" />
          <span>{{ timeAgo }}</span>
        </div>
        <div class="flex items-center gap-1">
          <MapPin class="w-3.5 h-3.5" />
          <span>{{ plant.community }}</span>
        </div>
      </div>

      <div class="mt-3 pt-3 border-t border-rice-100">
        <p class="text-xs text-moss-500 font-hand line-clamp-1">
          💫 想换: {{ plant.wantToExchange }}
        </p>
      </div>

      <button
        v-if="showDelete"
        class="mt-3 w-full py-2 bg-rose-50 text-rose-500 rounded-xl text-sm font-hand
               border border-rose-100 transition-all duration-300 hover:bg-rose-100"
        @click="handleDeleteClick"
      >
        撤销发布
      </button>
    </div>
  </div>
</template>
