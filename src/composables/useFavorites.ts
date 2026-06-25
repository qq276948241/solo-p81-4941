import { ref, computed } from 'vue';
import type { Plant } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { usePlants } from './usePlants';

const STORAGE_KEY = 'plant_exchange_favorites';

const favoriteIds = ref<string[]>([]);
const isLoaded = ref(false);

function loadFromStorage() {
  if (isLoaded.value) return;
  const stored = getItem<string[]>(STORAGE_KEY);
  favoriteIds.value = stored || [];
  isLoaded.value = true;
}

loadFromStorage();

export function useFavorites() {
  const { getPlantById } = usePlants();

  const save = () => {
    setItem(STORAGE_KEY, favoriteIds.value);
  };

  const isFavorited = (plantId: string): boolean => {
    return favoriteIds.value.includes(plantId);
  };

  const toggleFavorite = (plantId: string) => {
    const index = favoriteIds.value.indexOf(plantId);
    if (index > -1) {
      favoriteIds.value.splice(index, 1);
    } else {
      favoriteIds.value.unshift(plantId);
    }
    save();
  };

  const addFavorite = (plantId: string) => {
    if (!favoriteIds.value.includes(plantId)) {
      favoriteIds.value.unshift(plantId);
      save();
    }
  };

  const removeFavorite = (plantId: string) => {
    const index = favoriteIds.value.indexOf(plantId);
    if (index > -1) {
      favoriteIds.value.splice(index, 1);
      save();
    }
  };

  const favoritedPlants = computed((): Plant[] => {
    return favoriteIds.value
      .map((id) => getPlantById(id))
      .filter((p): p is Plant => p !== undefined);
  });

  return {
    favoriteIds,
    isLoaded,
    isFavorited,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    favoritedPlants,
  };
}
