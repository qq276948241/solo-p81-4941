import { ref, computed, onMounted } from 'vue';
import type { Plant } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { usePlants } from './usePlants';

const STORAGE_KEY = 'plant_exchange_favorites';

const favoriteIds = ref<string[]>([]);
const isLoaded = ref(false);

export function useFavorites() {
  const { getPlantById } = usePlants();

  const load = () => {
    const stored = getItem<string[]>(STORAGE_KEY);
    if (stored) {
      favoriteIds.value = stored;
    }
    isLoaded.value = true;
  };

  const save = () => {
    setItem(STORAGE_KEY, favoriteIds.value);
  };

  const ensureLoaded = () => {
    if (!isLoaded.value) {
      load();
    }
  };

  const isFavorited = (plantId: string): boolean => {
    ensureLoaded();
    return favoriteIds.value.includes(plantId);
  };

  const toggleFavorite = (plantId: string) => {
    ensureLoaded();
    const index = favoriteIds.value.indexOf(plantId);
    if (index > -1) {
      favoriteIds.value.splice(index, 1);
    } else {
      favoriteIds.value.unshift(plantId);
    }
    save();
  };

  const addFavorite = (plantId: string) => {
    ensureLoaded();
    if (!favoriteIds.value.includes(plantId)) {
      favoriteIds.value.unshift(plantId);
      save();
    }
  };

  const removeFavorite = (plantId: string) => {
    ensureLoaded();
    const index = favoriteIds.value.indexOf(plantId);
    if (index > -1) {
      favoriteIds.value.splice(index, 1);
      save();
    }
  };

  const favoritedPlants = computed((): Plant[] => {
    ensureLoaded();
    return favoriteIds.value
      .map((id) => getPlantById(id))
      .filter((p): p is Plant => p !== undefined);
  });

  onMounted(() => {
    if (!isLoaded.value) {
      load();
    }
  });

  return {
    favoriteIds,
    isFavorited,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    favoritedPlants,
  };
}
