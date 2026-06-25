<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Send, AlertCircle } from 'lucide-vue-next';
import type { PlantCategory, PublishFormData } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';
import { usePlants } from '@/composables/usePlants';
import ImageUpload from '@/components/ImageUpload.vue';

const router = useRouter();
const { addPlant } = usePlants();

const categories: { value: PlantCategory; label: string; icon: string }[] = [
  { value: 'succulent', label: CATEGORY_LABELS.succulent, icon: CATEGORY_ICONS.succulent },
  { value: 'green', label: CATEGORY_LABELS.green, icon: CATEGORY_ICONS.green },
  { value: 'flower', label: CATEGORY_LABELS.flower, icon: CATEGORY_ICONS.flower },
  { value: 'tool', label: CATEGORY_LABELS.tool, icon: CATEGORY_ICONS.tool },
];

const form = reactive<PublishFormData>({
  name: '',
  variety: '',
  category: 'succulent',
  description: '',
  images: [],
  wantToExchange: '',
  contact: '',
  publisher: '',
  community: '',
});

const error = ref('');
const isSubmitting = ref(false);

const handleImageError = (msg: string) => {
  error.value = msg;
  setTimeout(() => {
    error.value = '';
  }, 3000);
};

const handleSubmit = async () => {
  error.value = '';

  if (!form.name.trim()) {
    error.value = '请输入植物名称';
    return;
  }
  if (!form.variety.trim()) {
    error.value = '请输入植物品种';
    return;
  }
  if (!form.description.trim()) {
    error.value = '请输入植物描述';
    return;
  }
  if (!form.wantToExchange.trim()) {
    error.value = '请输入想换什么';
    return;
  }
  if (!form.contact.trim()) {
    error.value = '请输入联系方式';
    return;
  }
  if (!form.publisher.trim()) {
    error.value = '请输入您的昵称';
    return;
  }
  if (!form.community.trim()) {
    error.value = '请输入小区名称';
    return;
  }

  try {
    isSubmitting.value = true;
    const newPlant = addPlant(form);
    router.push('/');
  } catch (e) {
    error.value = '发布失败，可能是图片太大了，请减少图片数量或压缩后重试';
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.back();
};
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
            发布植物
          </h1>
          <div class="w-10"></div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-6 max-w-2xl">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div
          v-if="error"
          class="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-hand animate-fade-in"
        >
          <AlertCircle class="w-5 h-5 flex-shrink-0" />
          <span>{{ error }}</span>
        </div>

        <div class="card p-5 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 font-hand mb-2">
              植物名称 <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="例如：玉露、龟背竹"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 font-hand mb-2">
              植物品种 <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.variety"
              type="text"
              placeholder="例如：十二卷属、蓬莱蕉"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 font-hand mb-2">
              分类 <span class="text-rose-400">*</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in categories"
                :key="cat.value"
                type="button"
                class="tag transition-all duration-300"
                :class="form.category === cat.value ? 'tag-active' : 'tag-inactive'"
                @click="form.category = cat.value"
              >
                <span>{{ cat.icon }}</span>
                <span class="font-hand">{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 font-hand mb-2">
              植物描述 <span class="text-rose-400">*</span>
            </label>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="介绍一下你的植物，比如养了多久、状态如何、有什么特别的故事..."
              class="textarea-field"
            ></textarea>
          </div>

          <ImageUpload
            v-model="form.images"
            :max-images="6"
            @error="handleImageError"
          />
        </div>

        <div class="card p-5 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 font-hand mb-2">
              想换什么 <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.wantToExchange"
              type="text"
              placeholder="例如：想换其他品种的多肉、园艺工具等"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 font-hand mb-2">
              联系方式 <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.contact"
              type="text"
              placeholder="例如：微信: xxx、电话: xxx"
              class="input-field"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 font-hand mb-2">
                您的昵称 <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="form.publisher"
                type="text"
                placeholder="例如：小花"
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 font-hand mb-2">
                小区名称 <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="form.community"
                type="text"
                placeholder="拼音或缩写，例如：JYXQ"
                class="input-field"
              />
            </div>
          </div>
        </div>

        <div class="sticky bottom-6 pt-4">
          <button
            type="submit"
            class="btn-primary w-full flex items-center justify-center gap-2"
            :disabled="isSubmitting"
          >
            <Send class="w-4 h-4" />
            <span v-if="!isSubmitting">发布交换</span>
            <span v-else>发布中...</span>
          </button>
        </div>
      </form>
    </div>

    <div class="h-20"></div>
  </div>
</template>
