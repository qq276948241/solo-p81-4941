<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Leaf, Heart, Trash2, PlusCircle, Sprout } from 'lucide-vue-next';
import { usePlants } from '@/composables/usePlants';
import { useUser } from '@/composables/useUser';
import PlantCard from '@/components/PlantCard.vue';
import Modal from '@/components/Modal.vue';

const router = useRouter();
const { getMyPublished, deletePlant, loadPlants, isLoaded } = usePlants();
const { getInterestedPlants, removeInterest } = useUser();

const activeTab = ref<'published' | 'interested'>('published');
const showDeleteModal = ref(false);
const deleteTargetId = ref('');
const deleteType = ref<'published' | 'interested'>('published');

const publishedPlants = computed(() => getMyPublished.value);
const interestedPlants = computed(() => getInterestedPlants.value);

const handleDeletePublished = (id: string) => {
  deleteTargetId.value = id;
  deleteType.value = 'published';
  showDeleteModal.value = true;
};

const handleDeleteInterested = (id: string, e: Event) => {
  e.stopPropagation();
  deleteTargetId.value = id;
  deleteType.value = 'interested';
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (deleteType.value === 'published') {
    deletePlant(deleteTargetId.value);
  } else {
    removeInterest(deleteTargetId.value);
  }
  showDeleteModal.value = false;
};

const goToPublish = () => {
  router.push('/publish');
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
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl font-hand transition-all duration-300"
          :class="
            activeTab === 'published'
              ? 'bg-white text-moss-600 shadow-soft'
              : 'text-gray-500 hover:text-moss-500'
          "
          @click="activeTab = 'published'"
        >
          <Leaf class="w-4 h-4" />
          <span>我发布的</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            :class="
              activeTab === 'published' ? 'bg-moss-100 text-moss-600' : 'bg-rice-200 text-gray-500'
            "
          >
            {{ publishedPlants.length }}
          </span>
        </button>
        <button
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl font-hand transition-all duration-300"
          :class="
            activeTab === 'interested'
              ? 'bg-white text-moss-600 shadow-soft'
              : 'text-gray-500 hover:text-moss-500'
          "
          @click="activeTab = 'interested'"
        >
          <Heart class="w-4 h-4" />
          <span>我想要的</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            :class="
              activeTab === 'interested' ? 'bg-moss-100 text-moss-600' : 'bg-rice-200 text-gray-500'
            "
          >
            {{ interestedPlants.length }}
          </span>
        </button>
      </div>

      <div class="hidden md:grid md:grid-cols-2 md:gap-6">
        <div>
          <h2 class="text-lg font-semibold text-gray-800 font-hand mb-4 flex items-center gap-2">
            <div class="w-8 h-8 bg-moss-100 rounded-xl flex items-center justify-center">
              <Leaf class="w-4 h-4 text-moss-600" />
            </div>
            我发布的
            <span class="text-sm text-gray-400 font-normal">({{ publishedPlants.length }})</span>
          </h2>

          <div v-if="publishedPlants.length === 0" class="text-center py-12 bg-white rounded-3xl">
            <div class="w-20 h-20 mx-auto mb-4 bg-rice-100 rounded-full flex items-center justify-center">
              <Sprout class="w-10 h-10 text-rice-300" />
            </div>
            <p class="text-gray-400 font-hand mb-2">还没有发布过植物</p>
            <button class="btn-outline mt-2" @click="goToPublish">
              去发布第一株吧~
            </button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="plant in publishedPlants"
              :key="plant.id"
              class="card overflow-hidden animate-fade-in"
            >
              <div class="flex gap-4 p-4">
                <div
                  class="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-rice-100 cursor-pointer"
                  @click="$router.push(`/detail/${plant.id}`)"
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
                    @click="$router.push(`/detail/${plant.id}`)"
                  >
                    {{ plant.name }}
                  </h3>
                  <p class="text-sm text-gray-500 font-hand line-clamp-1 mb-2">
                    {{ plant.variety }}
                  </p>
                  <p class="text-xs text-moss-500 font-hand line-clamp-1 mb-3">
                    💫 {{ plant.wantToExchange }}
                  </p>
                  <button
                    class="text-sm text-rose-500 font-hand flex items-center gap-1 hover:text-rose-600 transition-colors"
                    @click="handleDeletePublished(plant.id)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    撤销发布
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="md:border-l md:border-rice-200 md:pl-6">
          <h2 class="text-lg font-semibold text-gray-800 font-hand mb-4 flex items-center gap-2">
            <div class="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
              <Heart class="w-4 h-4 text-rose-500" />
            </div>
            我想要的
            <span class="text-sm text-gray-400 font-normal">({{ interestedPlants.length }})</span>
          </h2>

          <div v-if="interestedPlants.length === 0" class="text-center py-12 bg-white rounded-3xl">
            <div class="w-20 h-20 mx-auto mb-4 bg-rice-100 rounded-full flex items-center justify-center">
              <Heart class="w-10 h-10 text-rice-300" />
            </div>
            <p class="text-gray-400 font-hand mb-2">还没有想要的植物</p>
            <p class="text-gray-300 font-hand text-sm">去首页逛逛吧~</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="plant in interestedPlants"
              :key="plant.id"
              class="card overflow-hidden animate-fade-in"
            >
              <div class="flex gap-4 p-4">
                <div
                  class="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-rice-100 cursor-pointer"
                  @click="$router.push(`/detail/${plant.id}`)"
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
                    @click="$router.push(`/detail/${plant.id}`)"
                  >
                    {{ plant.name }}
                  </h3>
                  <p class="text-sm text-gray-500 font-hand line-clamp-1 mb-2">
                    发布者: {{ plant.publisher }}
                  </p>
                  <p class="text-xs text-moss-500 font-hand line-clamp-1 mb-3">
                    📍 {{ plant.community }} · {{ plant.contact }}
                  </p>
                  <button
                    class="text-sm text-gray-400 font-hand flex items-center gap-1 hover:text-rose-500 transition-colors"
                    @click="handleDeleteInterested(plant.id, $event)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    取消想要
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="md:hidden">
        <div v-if="activeTab === 'published'">
          <div v-if="publishedPlants.length === 0" class="text-center py-12 bg-white rounded-3xl">
            <div class="w-20 h-20 mx-auto mb-4 bg-rice-100 rounded-full flex items-center justify-center">
              <Sprout class="w-10 h-10 text-rice-300" />
            </div>
            <p class="text-gray-400 font-hand mb-2">还没有发布过植物</p>
            <button class="btn-outline mt-2" @click="goToPublish">
              去发布第一株吧~
            </button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="plant in publishedPlants"
              :key="plant.id"
              class="card overflow-hidden animate-fade-in"
            >
              <div class="flex gap-4 p-4">
                <div
                  class="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-rice-100 cursor-pointer"
                  @click="$router.push(`/detail/${plant.id}`)"
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
                    @click="$router.push(`/detail/${plant.id}`)"
                  >
                    {{ plant.name }}
                  </h3>
                  <p class="text-sm text-gray-500 font-hand line-clamp-1 mb-2">
                    {{ plant.variety }}
                  </p>
                  <p class="text-xs text-moss-500 font-hand line-clamp-1 mb-3">
                    💫 {{ plant.wantToExchange }}
                  </p>
                  <button
                    class="text-sm text-rose-500 font-hand flex items-center gap-1 hover:text-rose-600 transition-colors"
                    @click="handleDeletePublished(plant.id)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    撤销发布
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <div v-if="interestedPlants.length === 0" class="text-center py-12 bg-white rounded-3xl">
            <div class="w-20 h-20 mx-auto mb-4 bg-rice-100 rounded-full flex items-center justify-center">
              <Heart class="w-10 h-10 text-rice-300" />
            </div>
            <p class="text-gray-400 font-hand mb-2">还没有想要的植物</p>
            <p class="text-gray-300 font-hand text-sm">去首页逛逛吧~</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="plant in interestedPlants"
              :key="plant.id"
              class="card overflow-hidden animate-fade-in"
            >
              <div class="flex gap-4 p-4">
                <div
                  class="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-rice-100 cursor-pointer"
                  @click="$router.push(`/detail/${plant.id}`)"
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
                    @click="$router.push(`/detail/${plant.id}`)"
                  >
                    {{ plant.name }}
                  </h3>
                  <p class="text-sm text-gray-500 font-hand line-clamp-1 mb-2">
                    发布者: {{ plant.publisher }}
                  </p>
                  <p class="text-xs text-moss-500 font-hand line-clamp-1 mb-3">
                    📍 {{ plant.community }}
                  </p>
                  <button
                    class="text-sm text-gray-400 font-hand flex items-center gap-1 hover:text-rose-500 transition-colors"
                    @click="handleDeleteInterested(plant.id, $event)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    取消想要
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal v-model:show="showDeleteModal" :title="deleteType === 'published' ? '确认撤销发布' : '确认取消想要'">
      <div class="text-center py-4">
        <div class="w-16 h-16 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center">
          <Trash2 class="w-8 h-8 text-rose-500" />
        </div>
        <p class="text-gray-600 font-hand">
          {{ deleteType === 'published' ? '确定要撤销发布这株植物吗？' : '确定要取消想要这株植物吗？' }}
        </p>
        <p class="text-gray-400 font-hand text-sm mt-1">
          {{ deleteType === 'published' ? '撤销后将从列表中移除' : '取消后可以重新添加' }}
        </p>
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
