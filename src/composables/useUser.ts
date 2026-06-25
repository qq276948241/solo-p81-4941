import { ref, computed } from 'vue';
import type { Plant } from '@/types';
import { STORAGE_KEYS } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { usePlants } from './usePlants';

const interestedIds = ref<string[]>([]);
const isLoaded = ref(false);

export function useUser() {
  const { getPlantById } = usePlants();

  const loadInterested = () => {
    const stored = getItem<string[]>(STORAGE_KEYS.INTERESTED);
    if (stored) {
      interestedIds.value = stored;
    }
    isLoaded.value = true;
  };

  const saveInterested = () => {
    setItem(STORAGE_KEYS.INTERESTED, interestedIds.value);
  };

  const isInterested = (plantId: string) => {
    if (!isLoaded.value) {
      loadInterested();
    }
    return interestedIds.value.includes(plantId);
  };

  const toggleInterest = (plantId: string) => {
    const index = interestedIds.value.indexOf(plantId);
    if (index > -1) {
      interestedIds.value.splice(index, 1);
    } else {
      interestedIds.value.unshift(plantId);
    }
    saveInterested();
  };

  const addInterest = (plantId: string) => {
    if (!interestedIds.value.includes(plantId)) {
      interestedIds.value.unshift(plantId);
      saveInterested();
    }
  };

  const removeInterest = (plantId: string) => {
    const index = interestedIds.value.indexOf(plantId);
    if (index > -1) {
      interestedIds.value.splice(index, 1);
      saveInterested();
    }
  };

  const getInterestedPlants = computed((): Plant[] => {
    if (!isLoaded.value) {
      loadInterested();
    }
    return interestedIds.value
      .map((id) => getPlantById(id))
      .filter((p): p is Plant => p !== undefined);
  });

  if (!isLoaded.value) {
    loadInterested();
  }

  return {
    interestedIds,
    isInterested,
    toggleInterest,
    addInterest,
    removeInterest,
    getInterestedPlants,
  };
}
