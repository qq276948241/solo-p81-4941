<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  MessageCircle,
} from 'lucide-vue-next';
import type { Plant } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';
import { usePlants } from '@/composables/usePlants';
import { useUser } from '@/composables/useUser';
import { useFavorites } from '@/composables/useFavorites';
import { formatDate } from '@/utils/image';
import Modal from '@/components/Modal.vue';

const route = useRoute();
const router = useRouter();
const { getPlantById, loadPlants, isLoaded } = usePlants();
const { isInterested, addInterest } = useUser();
const { favoriteIds, toggleFavorite } = useFavorites();

const plantId = computed(() => route.params.id as string);
const plant = ref<Plant | null>(null);
const currentImageIndex = ref(0);
const showModal = ref(false);
const isAdded = ref(false);
const isFavoritedAnimating = ref(false);

const favoritedSet = computed(() => new Set(favoriteIds.value));
const isFavorited = computed(() => (plant.value ? favoritedSet.value.has(plant.value.id) : false));

const plantImages = computed(() => {
  if (plant.value?.images && plant.value.images.length > 0) {
    return plant.value.images;
  }
  const categoryImages: Record<string, string> = {
    succulent: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20succulent%20plant%20in%20ceramic%20pot%20on%20beige%20background&image_size=square',
    green: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20houseplant%20monstera%20in%20pot%20soft%20light&image_size=square',
    flower: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20pink%20roses%20bouquet%20soft%20aesthetic&image_size=square',
    tool: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gardening%20tools%20set%20on%20wooden%20table%20cozy&image_size=square',
  };
  return [categoryImages[plant.value?.category || 'succulent']];
});

const currentImage = computed(() => plantImages.value[currentImageIndex.value]);
const categoryLabel = computed(() => plant.value ? CATEGORY_LABELS[plant.value.category] : '');
const categoryIcon = computed(() => plant.value ? CATEGORY_ICONS[plant.value.category] : '');
const timeAgo = computed(() => (plant.value ? formatDate(plant.value.createdAt) : ''));
const isLiked = computed(() => (plant.value ? isInterested(plant.value.id) : false));

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = plantImages.value.length - 1;
  }
};

const nextImage = () => {
  if (currentImageIndex.value < plantImages.value.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0;
  }
};

const handleWant = () => {
  if (plant.value) {
    addInterest(plant.value.id);
    isAdded.value = true;
    showModal.value = true;
  }
};

const handleToggleFavorite = () => {
  if (!plant.value) return;
  toggleFavorite(plant.value.id);
  isFavoritedAnimating.value = true;
  setTimeout(() => {
    isFavoritedAnimating.value = false;
  }, 400);
};

const goBack = () => {
  router.back();
};

const closeModal = () => {
  showModal.value = false;
  setTimeout(() => {
    isAdded.value = false;
  }, 300);
};

onMounted(() => {
  if (!isLoaded.value) {
    loadPlants();
  }
  const found = getPlantById(plantId.value);
  if (found) {
    plant.value = found;
  }
});
</script>

<template>
  <div class="min-h-screen bg-rice-50">
    <div class="sticky top-0 z-40 bg-rice-50/95 backdrop-blur-sm border-b border-rice-200">
      <div class="container mx-auto px-4">
        <div class="flex items-center h-14">
          <button
            class="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500
                   hover:text-moss-600 hover:bg-rice-100 transition-all duration-300"
            @click="goBack"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h1 class="flex-1 text-center text-lg font-semibold text-gray-800 font-hand">
            植物详情
          </h1>
          <div class="w-10"></div>
        </div>
      </div>
    </div>

    <div v-if="!plant" class="container mx-auto px-4 py-16 text-center">
      <div class="w-24 h-24 mx-auto mb-4 bg-rice-100 rounded-full flex items-center justify-center">
        <Heart class="w-12 h-12 text-rice-300" />
      </div>
      <p class="text-gray-400 font-hand">植物不存在或已被删除</p>
      <button class="btn-outline mt-4" @click="goBack">返回首页</button>
    </div>

    <div v-else class="container mx-auto px-4 py-6 max-w-3xl">
      <div class="card overflow-hidden mb-6">
        <div class="relative">
          <div class="aspect-square md:aspect-[4/3] overflow-hidden bg-rice-100">
            <img
              :src="currentImage"
              :alt="plant.name"
              class="w-full h-full object-cover transition-opacity duration-300"
              key="currentImage"
            />
          </div>

          <button
            v-if="plantImages.length > 1"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm
                   rounded-full flex items-center justify-center shadow-soft text-gray-600
                   hover:bg-white hover:text-moss-600 transition-all duration-300"
            @click="prevImage"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>

          <button
            v-if="plantImages.length > 1"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm
                   rounded-full flex items-center justify-center shadow-soft text-gray-600
                   hover:bg-white hover:text-moss-600 transition-all duration-300"
            @click="nextImage"
          >
            <ChevronRight class="w-5 h-5" />
          </button>

          <div class="absolute top-3 left-3 tag bg-white/90 backdrop-blur-sm text-moss-600 shadow-soft">
            <span>{{ categoryIcon }}</span>
            <span class="text-xs font-medium">{{ categoryLabel }}</span>
          </div>

          <button
            class="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full
                   flex items-center justify-center shadow-soft transition-all duration-300
                   hover:scale-110 active:scale-95"
            :class="[
              isFavorited ? 'text-moss-500' : 'text-gray-400 hover:text-moss-400',
              isFavoritedAnimating ? 'animate-bounce-soft' : ''
            ]"
            @click="handleToggleFavorite"
          >
            <Heart class="w-5 h-5" :fill="isFavorited ? 'currentColor' : 'none'" />
          </button>

          <div
            v-if="plantImages.length > 1"
            class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
          >
            <button
              v-for="(_, index) in plantImages"
              :key="index"
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50'"
              @click="currentImageIndex = index"
            ></button>
          </div>
        </div>

        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-800 font-hand mb-1">
                {{ plant.name }}
              </h2>
              <p class="text-gray-500 font-hand">{{ plant.variety }}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-hand mb-6">
            <div class="flex items-center gap-1">
              <Clock class="w-4 h-4" />
              <span>{{ timeAgo }}</span>
            </div>
            <div class="flex items-center gap-1">
              <MapPin class="w-4 h-4" />
              <span>{{ plant.community }}</span>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-700 font-hand mb-2">植物描述</h3>
              <p class="text-gray-600 font-hand leading-relaxed">
                {{ plant.description }}
              </p>
            </div>

            <div class="p-4 bg-moss-50 rounded-2xl">
              <h3 class="text-sm font-medium text-moss-700 font-hand mb-2">
                💫 想换什么
              </h3>
              <p class="text-moss-600 font-hand">{{ plant.wantToExchange }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-5 mb-6">
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 bg-moss-100 rounded-2xl flex items-center justify-center
                   text-moss-600 text-xl font-bold font-hand"
          >
            {{ plant.publisher.charAt(0) }}
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 font-hand">{{ plant.publisher }}</h3>
            <p class="text-sm text-gray-400 font-hand flex items-center gap-1">
              <User class="w-3.5 h-3.5" />
              发布了 {{ plantImages.length }} 张图片
            </p>
          </div>
        </div>
      </div>

      <div class="sticky bottom-6 pt-4">
        <div class="flex gap-3">
          <button
            class="btn-secondary w-14 flex items-center justify-center"
            :class="[
              isFavorited ? 'bg-moss-50 border-moss-300 text-moss-500' : '',
              isFavoritedAnimating ? 'animate-bounce-soft' : ''
            ]"
            :title="isFavorited ? '取消收藏' : '收藏'"
            @click="handleToggleFavorite"
          >
            <Heart class="w-5 h-5" :fill="isFavorited ? 'currentColor' : 'none'" />
          </button>
          <button
            class="btn-secondary flex-1 flex items-center justify-center gap-2"
            :class="isLiked ? 'bg-moss-50 border-moss-300 text-moss-600' : ''"
            @click="handleWant"
          >
            <Heart class="w-5 h-5" :fill="isLiked ? 'currentColor' : 'none'" />
            <span>{{ isLiked ? '已想要' : '我也想要' }}</span>
          </button>
          <button class="btn-primary flex-1 flex items-center justify-center gap-2" @click="showModal = true">
            <MessageCircle class="w-5 h-5" />
            <span>联系换物</span>
          </button>
        </div>
      </div>
    </div>

    <Modal v-model:show="showModal" title="交换意向确认" @close="closeModal">
      <div class="text-center py-4">
        <div
          class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
          :class="isAdded ? 'bg-moss-100' : 'bg-rice-100'"
        >
          <Check v-if="isAdded" class="w-10 h-10 text-moss-500" />
          <Heart v-else class="w-10 h-10 text-moss-400" />
        </div>

        <h3 class="text-xl font-semibold text-gray-800 font-hand mb-2">
          {{ isAdded ? '已加入想要列表！' : '确认想要交换？' }}
        </h3>
        <p class="text-gray-500 font-hand mb-6">
          {{ isAdded ? '可以通过以下方式联系发布者哦~' : '确认后将添加到你的想要列表' }}
        </p>

        <div class="p-4 bg-rice-50 rounded-2xl text-left">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-moss-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <User class="w-5 h-5 text-moss-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500 font-hand mb-1">发布人</p>
              <p class="font-medium text-gray-800 font-hand">{{ plant?.publisher }}</p>
            </div>
          </div>
          <div class="border-t border-rice-200 my-3"></div>
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-moss-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle class="w-5 h-5 text-moss-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500 font-hand mb-1">联系方式</p>
              <p class="font-medium text-moss-600 font-hand">{{ plant?.contact }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <button class="btn-secondary flex-1" @click="closeModal">
            我知道了
          </button>
          <button
            v-if="!isAdded"
            class="btn-primary flex-1"
            @click="handleWant"
          >
            确认想要
          </button>
        </div>
      </template>
    </Modal>

    <div class="h-20"></div>
  </div>
</template>
