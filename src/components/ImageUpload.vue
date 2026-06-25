<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Upload, Image as ImageIcon } from 'lucide-vue-next';
import {
  fileToBase64,
  compressImage,
  validateImageSize,
  validateTotalSize,
  MAX_SINGLE_IMAGE_MB,
  MAX_TOTAL_IMAGES_MB,
} from '@/utils/image';

const props = defineProps<{
  modelValue: string[];
  maxImages?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  error: [message: string];
}>();

const maxImages = computed(() => props.maxImages || 6);
const isDragging = ref(false);
const isProcessing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const canAddMore = computed(() => props.modelValue.length < maxImages.value);

const handleFiles = async (files: FileList | null) => {
  if (!files || files.length === 0) return;

  isProcessing.value = true;

  try {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        emit('error', '请选择图片文件');
        continue;
      }

      if (!validateImageSize(file)) {
        emit('error', `单张图片不能超过 ${MAX_SINGLE_IMAGE_MB}MB`);
        continue;
      }

      if (!canAddMore.value) {
        emit('error', `最多只能上传 ${maxImages.value} 张图片`);
        break;
      }

      const base64 = await fileToBase64(file);
      const compressed = await compressImage(base64);

      if (!validateTotalSize(props.modelValue, compressed)) {
        emit('error', `所有图片总大小不能超过 ${MAX_TOTAL_IMAGES_MB}MB`);
        continue;
      }

      emit('update:modelValue', [...props.modelValue, compressed]);
    }
  } catch (e) {
    emit('error', '图片处理失败，请重试');
  } finally {
    isProcessing.value = false;
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  handleFiles(target.files);
  target.value = '';
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
  handleFiles(e.dataTransfer?.files || null);
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const removeImage = (index: number) => {
  const newValue = [...props.modelValue];
  newValue.splice(index, 1);
  emit('update:modelValue', newValue);
};

const triggerFileInput = () => {
  if (canAddMore.value && !isProcessing.value) {
    fileInput.value?.click();
  }
};
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-gray-700 font-hand">
        植物图片
      </label>
      <span class="text-xs text-gray-400 font-hand">
        {{ modelValue.length }}/{{ maxImages }} 张
      </span>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div
        v-for="(img, index) in modelValue"
        :key="index"
        class="relative aspect-square rounded-2xl overflow-hidden bg-rice-100 group"
      >
        <img
          :src="img"
          :alt="`图片 ${index + 1}`"
          class="w-full h-full object-cover"
        />
        <button
          class="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full
                 flex items-center justify-center text-white opacity-0 group-hover:opacity-100
                 transition-all duration-300 hover:bg-rose-500"
          @click="removeImage(index)"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div
        v-if="canAddMore"
        class="aspect-square rounded-2xl border-2 border-dashed transition-all duration-300
               cursor-pointer flex flex-col items-center justify-center gap-2"
        :class="
          isDragging
            ? 'border-moss-400 bg-moss-50'
            : 'border-rice-300 bg-rice-50 hover:border-moss-300 hover:bg-rice-100'
        "
        @click="triggerFileInput"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <div
          v-if="isProcessing"
          class="w-8 h-8 border-3 border-moss-200 border-t-moss-500 rounded-full animate-spin"
        ></div>
        <template v-else>
          <Upload
            class="w-8 h-8 text-moss-400"
            :class="{ 'animate-bounce': isDragging }"
          />
          <span class="text-xs text-gray-500 font-hand">点击或拖拽上传</span>
        </template>
      </div>

      <div
        v-else-if="modelValue.length === 0"
        class="aspect-square rounded-2xl border-2 border-dashed border-rice-300 bg-rice-100
               flex flex-col items-center justify-center gap-2"
      >
        <ImageIcon class="w-8 h-8 text-rice-300" />
        <span class="text-xs text-gray-400 font-hand">请上传图片</span>
      </div>
    </div>

    <p class="text-xs text-gray-400 font-hand">
      支持 JPG、PNG 格式，单张不超过 {{ MAX_SINGLE_IMAGE_MB }}MB，总大小不超过
      {{ MAX_TOTAL_IMAGES_MB }}MB
    </p>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>
