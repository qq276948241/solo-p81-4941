<script setup lang="ts">
import { ref, computed, onMounted, h, type Component } from 'vue';
import { useRouter } from 'vue-router';
import {
  Leaf,
  Heart,
  Trash2,
  PlusCircle,
  Sprout,
  Bookmark,
} from 'lucide-vue-next';
import type { Plant } from '@/types';
import { usePlants } from '@/composables/usePlants';
import { useUser } from '@/composables/useUser';
import { useFavorites } from '@/composables/useFavorites';
import PlantCard from '@/components/PlantCard.vue';
import Modal from '@/components/Modal.vue';

type TabKey = 'published' | 'interested' | 'favorited';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: Component;
  iconBg: string;
  iconColor: string;
  emptyIcon: Component;
  emptyText: string;
  emptySubText?: string;
  emptyAction?: { label: string; onClick: () => void };
  deleteText: string;
  showPublisher?: boolean;
  showContact?: boolean;
}

const router = useRouter();
const { getMyPublished, deletePlant, loadPlants, isLoaded } = usePlants();
const { getInterestedPlants, removeInterest } = useUser();
const { favoritedPlants, removeFavorite } = useFavorites();

const activeTab = ref<TabKey>('published');
const showDeleteModal = ref(false);
const deleteTargetId = ref('');
const deleteType = ref<TabKey>('published');

const goToPublish = () => router.push('/publish');

const getPlantsByTab = (key: TabKey) => {
  switch (key) {
    case 'published': return getMyPublished.value;
    case 'interested': return getInterestedPlants.value;
    case 'favorited': return favoritedPlants.value;
  }
};

const handleRemoveByTab = (key: TabKey, id: string) => {
  switch (key) {
    case 'published': deletePlant(id); break;
    case 'interested': removeInterest(id); break;
    case 'favorited': removeFavorite(id); break;
  }
};

const tabs: TabConfig[] = [
  {
    key: 'published',
    label: '我发布的',
    icon: Leaf,
    iconBg: 'bg-moss-100',
    iconColor: 'text-moss-600',
    emptyIcon: Sprout,
    emptyText: '还没有发布过植物',
    emptyAction: { label: '去发布第一株吧~', onClick: goToPublish },
    deleteText: '撤销发布',
  },
  {
    key: 'interested',
    label: '我想要的',
    icon: Heart,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-500',
    emptyIcon: Heart,
    emptyText: '还没有想要的植物',
    emptySubText: '去首页逛逛吧~',
    deleteText: '取消想要',
    showPublisher: true,
    showContact: true,
  },
  {
    key: 'favorited',
    label: '我收藏的',
    icon: Bookmark,
    iconBg: 'bg-moss-100',
    iconColor: 'text-moss-500',
    emptyIcon: Bookmark,
    emptyText: '还没有收藏过植物',
    emptySubText: '点卡片上的爱心试试~',
    deleteText: '取消收藏',
  },
];

const currentTabData = computed(() => tabs.find(t => t.key === activeTab.value)!);

const getDeleteModalTitle = computed(() => {
  const map: Record<TabKey, string> = {
    published: '确认撤销发布',
    interested: '确认取消想要',
    favorited: '确认取消收藏',
  };
  return map[deleteType.value];
});

const getDeleteModalMessage = computed(() => {
  const map: Record<TabKey, string> = {
    published: '确定要撤销发布这株植物吗？',
    interested: '确定要取消想要这株植物吗？',
    favorited: '确定要取消收藏这株植物吗？',
  };
  return map[deleteType.value];
});

const getDeleteModalSubText = computed(() => {
  return deleteType.value === 'published'
    ? '撤销后将从列表中移除'
    : '取消后可以重新添加';
});

const handleDeleteClick = (key: TabKey, id: string, e: Event) => {
  e.stopPropagation();
  deleteTargetId.value = id;
  deleteType.value = key;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  handleRemoveByTab(deleteType.value, deleteTargetId.value);
  showDeleteModal.value = false;
};

const goToDetail = (plant: Plant) => {
  router.push(`/detail/${plant.id}`);
};

onMounted(() => {
  if (!isLoaded.value) {
    loadPlants();
  }
});
</script>

<template>
  <div class="min-h-screen bg-rice-50">
    <div class="sticky top-0 z-40 bg-rice-50/95 backdrop-blur-sm border-b border-rice-200">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-14">
          <h1 class="text-lg font-semibold text-gray-800 font-hand">我的小窝</h1>
          <button
            class="btn-outline py-2 px-4 flex items-center gap-1.5 text-sm"
            @click="goToPublish"
          >
            <PlusCircle class="w-4 h-4" />
            <span>发布新植物</span>
          </button>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-6">
      <div class="card p-1.5 mb-6 inline-flex bg-rice-100">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl font-hand transition-all duration-300"
          :class="
            activeTab === tab.key
              ? 'bg-white text-moss-600 shadow-soft'
              : 'text-gray-500 hover:text-moss-500'
          "
          @click="activeTab = tab.key"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            :class="
              activeTab === tab.key
                ? 'bg-moss-100 text-moss-600'
                : 'bg-rice-200 text-gray-500'
            "
          >
            {{ getPlantsByTab(tab.key).length }}
          </span>
        </button>
      </div>

      <div class="hidden md:grid md:grid-cols-3 md:gap-6">
        <div
          v-for="(tab, index) in tabs"
          :key="tab.key"
          :class="index > 0 ? 'md:border-l md:border-rice-200 md:pl-6' : ''"
        >
          <h2 class="text-lg font-semibold text-gray-800 font-hand mb-4 flex items-center gap-2">
            <div :class="['w-8 h-8 rounded-xl flex items-center justify-center', tab.iconBg]">
              <component :is="tab.icon" :class="['w-4 h-4', tab.iconColor]" />
            </div>
            {{ tab.label }}
            <span class="text-sm text-gray-400 font-normal">
              ({{ getPlantsByTab(tab.key).length }})
            </span>
          </h2>

          <div
            v-if="getPlantsByTab(tab.key).length === 0"
            class="text-center py-12 bg-white rounded-3xl"
          >
            <div class="w-20 h-20 mx-auto mb-4 bg-rice-100 rounded-full flex items-center justify-center">
              <component :is="tab.emptyIcon" class="w-10 h-10 text-rice-300" />
            </div>
            <p class="text-gray-400 font-hand mb-2">{{ tab.emptyText }}</p>
            <p v-if="tab.emptySubText" class="text-gray-300 font-hand text-sm">
              {{ tab.emptySubText }}
            </p>
            <button
              v-if="tab.emptyAction" class="btn-outline mt-2" @click="tab.emptyAction.onClick">
              {{ tab.emptyAction.label }}
            </button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="plant in getPlantsByTab(tab.key)"
              :key="plant.id"
              class="card overflow-hidden animate-fade-in"
            >
              <div class="flex gap-4 p-4">
                <div
                  class="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-rice-100 cursor-pointer"
                  @click="goToDetail(plant)"
                >
                  <img
                    v-if="plant.images?.length"
                    :src="plant.images[0]"
                    :alt="plant.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full bg-rice-100 flex items-center justify-center">
                    <Leaf class="w-8 h-8 text-rice-300" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3
                    class="font-semibold text-gray-800 font-hand line-clamp-1 cursor-pointer hover:text-moss-600 transition-colors"
                    @click="goToDetail(plant)"
                  >
                    {{ plant.name }}
                  </h3>
                  <p class="text-sm text-gray-500 font-hand line-clamp-1 mb-2">
                    <template v-if="tab.showPublisher">发布者: {{ plant.publisher }}</template>
                    <template v-else>{{ plant.variety }}</template>
                  </p>
                  <p class="text-xs text-moss-500 font-hand line-clamp-1 mb-3">
                    <template v-if="tab.showContact">
                      📍 {{ plant.community }} · {{ plant.contact }}
                    </template>
                    <template v-else-if="tab.key === 'published'">
                      💫 {{ plant.wantToExchange }}
                    </template>
                    <template v-else>
                      📍 {{ plant.community }}
                    </template>
                  </p>
                  <button
                    class="text-sm font-hand flex items-center gap-1 transition-colors"
                    :class="
                      tab.key === 'published'
                        ? 'text-rose-500 hover:text-rose-600'
                        : 'text-gray-400 hover:text-moss-500'
                    "
                    @click="handleDeleteClick(tab.key, plant.id, $event)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    {{ tab.deleteText }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="md:hidden">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          v-show="activeTab === tab.key"
        >
          <div
            v-if="getPlantsByTab(tab.key).length === 0"
            class="text-center py-12 bg-white rounded-3xl"
          >
            <div class="w-20 h-20 mx-auto mb-4 bg-rice-100 rounded-full flex items-center justify-center">
              <component :is="tab.emptyIcon" class="w-10 h-10 text-rice-300" />
            </div>
            <p class="text-gray-400 font-hand mb-2">{{ tab.emptyText }}</p>
            <p v-if="tab.emptySubText" class="text-gray-300 font-hand text-sm">
              {{ tab.emptySubText }}
            </p>
            <button
              v-if="tab.emptyAction" class="btn-outline mt-2" @click="tab.emptyAction.onClick">
              {{ tab.emptyAction.label }}
            </button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="plant in getPlantsByTab(tab.key)"
              :key="plant.id"
              class="card overflow-hidden animate-fade-in"
            >
              <div class="flex gap-4 p-4">
                <div
                  class="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-rice-100 cursor-pointer"
                  @click="goToDetail(plant)"
                >
                  <img
                    v-if="plant.images?.length"
                    :src="plant.images[0]"
                    :alt="plant.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full bg-rice-100 flex items-center justify-center">
                    <Leaf class="w-8 h-8 text-rice-300" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3
                    class="font-semibold text-gray-800 font-hand line-clamp-1 cursor-pointer hover:text-moss-600 transition-colors"
                    @click="goToDetail(plant)"
                  >
                    {{ plant.name }}
                  </h3>
                  <p class="text-sm text-gray-500 font-hand line-clamp-1 mb-2">
                    <template v-if="tab.showPublisher">发布者: {{ plant.publisher }}</template>
                    <template v-else>{{ plant.variety }}</template>
                  </p>
                  <p class="text-xs text-moss-500 font-hand line-clamp-1 mb-3">
                    <template v-if="tab.showContact">
                      📍 {{ plant.community }} · {{ plant.contact }}
                    </template>
                    <template v-else-if="tab.key === 'published'">
                      💫 {{ plant.wantToExchange }}
                    </template>
                    <template v-else>
                      📍 {{ plant.community }}
                    </template>
                  </p>
                  <button
                    class="text-sm font-hand flex items-center gap-1 transition-colors"
                    :class="
                      tab.key === 'published'
                        ? 'text-rose-500 hover:text-rose-600'
                        : 'text-gray-400 hover:text-moss-500'
                    "
                    @click="handleDeleteClick(tab.key, plant.id, $event)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    {{ tab.deleteText }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal v-model:show="showDeleteModal" :title="getDeleteModalTitle">
      <div class="text-center py-4">
        <div class="w-16 h-16 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center">
          <Trash2 class="w-8 h-8 text-rose-500" />
        </div>
        <p class="text-gray-600 font-hand">{{ getDeleteModalMessage }}</p>
        <p class="text-gray-400 font-hand text-sm mt-1">{{ getDeleteModalSubText }}</p>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <button class="btn-secondary flex-1" @click="showDeleteModal = false">
            再想想
          </button>
          <button class="btn-primary flex-1 !bg-rose-500 !hover:bg-rose-600" @click="confirmDelete">
            确认删除
          </button>
        </div>
      </template>
    </Modal>

    <div class="h-20"></div>
  </div>
</template>
