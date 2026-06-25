<script setup lang="ts">
import { watch, ref } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  title?: string;
  closeOnOverlay?: boolean;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  close: [];
}>();

const isVisible = ref(false);
const isAnimating = ref(false);

watch(
  () => props.show,
  (val) => {
    if (val) {
      isVisible.value = true;
      requestAnimationFrame(() => {
        isAnimating.value = true;
      });
      document.body.style.overflow = 'hidden';
    } else {
      isAnimating.value = false;
      setTimeout(() => {
        isVisible.value = false;
        document.body.style.overflow = '';
      }, 300);
    }
  },
  { immediate: true }
);

const close = () => {
  emit('update:show', false);
  emit('close');
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay !== false) {
    close();
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    close();
  }
};

watch(
  () => props.show,
  (val) => {
    if (val) {
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.removeEventListener('keydown', handleKeydown);
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          :class="isAnimating ? 'opacity-100' : 'opacity-0'"
          @click="handleOverlayClick"
        ></div>

        <div
          class="relative w-full max-w-md bg-white rounded-3xl shadow-hover overflow-hidden
                 transform transition-all duration-300"
          :class="isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
        >
          <div
            v-if="title"
            class="flex items-center justify-between px-6 py-4 border-b border-rice-100"
          >
            <h3 class="text-lg font-semibold text-gray-800 font-hand">
              {{ title }}
            </h3>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full
                     text-gray-400 hover:text-gray-600 hover:bg-rice-100
                     transition-all duration-300"
              @click="close"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="p-6">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="px-6 py-4 border-t border-rice-100">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
</style>
