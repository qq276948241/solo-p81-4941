import { ref, computed, onMounted } from 'vue';
import type { Plant, PlantCategory, PublishFormData } from '@/types';
import { STORAGE_KEYS } from '@/types';
import { getItem, setItem, generateId, getOrCreateUserId } from '@/utils/storage';

const MOCK_PLANTS: Omit<Plant, 'id' | 'userId' | 'createdAt'>[] = [
  {
    name: '玉露',
    variety: '十二卷属',
    category: 'succulent',
    description: '养了两年的玉露，晶莹剔透的，最近爆了很多小崽，想换点其他品种的多肉。窗面很透，状态很好，连盆带土一起出。',
    images: [],
    wantToExchange: '想换仙人球或者生石花',
    contact: '微信: xiaohua123',
    publisher: '小花',
    community: 'JYXQ',
  },
  {
    name: '龟背竹',
    variety: '蓬莱蕉',
    category: 'green',
    description: '大棵龟背竹，已经开背了，叶片很大很漂亮。家里放不下了，找个爱花的邻居收留。带北欧风水泥盆。',
    images: [],
    wantToExchange: '想换琴叶榕或者天堂鸟小苗',
    contact: '电话: 138****5678',
    publisher: '绿洲主人',
    community: 'LDGY',
  },
  {
    name: '月季',
    variety: '粉龙沙宝石',
    category: 'flower',
    description: '粉色龙沙宝石，大花型，淡香。三年苗，今年已经开过一波花了，长势很好。想换其他颜色的欧月。',
    images: [],
    wantToExchange: '想换红色或黄色系欧月',
    contact: '微信: rose_lover',
    publisher: '月季迷',
    community: 'JYXQ',
  },
  {
    name: '园艺工具套装',
    variety: '全新',
    category: 'tool',
    description: '买多了的园艺工具套装，包含小铲子、耙子、修枝剪、喷壶。质量很好，不锈钢材质，手感舒适。',
    images: [],
    wantToExchange: '想换多肉土或者缓释肥',
    contact: '微信: green_thumb',
    publisher: '园丁小王',
    community: 'THHY',
  },
  {
    name: '熊童子',
    variety: '景天科',
    category: 'succulent',
    description: '超萌的熊童子，红爪子已经出来了！毛茸茸的特别可爱。老桩群生，状态一级棒。',
    images: [],
    wantToExchange: '想换碧光环或者小兔子',
    contact: '微信: cactus_fan',
    publisher: '仙人球控',
    community: 'LDGY',
  },
  {
    name: '绿萝',
    variety: '大叶绿萝',
    category: 'green',
    description: '超级好养的绿萝，已经爬藤了，净化空气小能手。水培土培都可以，剪几根枝条就能活。',
    images: [],
    wantToExchange: '想换常春藤或者吊兰',
    contact: '电话: 139****1234',
    publisher: '绿手指',
    community: 'THHY',
  },
  {
    name: '绣球花',
    variety: '无尽夏',
    category: 'flower',
    description: '无尽夏绣球，可以调蓝调粉，花球很大。两加仑盆，带很多花苞，马上就要开了！',
    images: [],
    wantToExchange: '想换绣球花手鞠或者万华镜',
    contact: '微信: hydrangea_love',
    publisher: '绣球姐姐',
    community: 'JYXQ',
  },
];

const plants = ref<Plant[]>([]);
const isLoaded = ref(false);

const favoriteIds = ref<string[]>([]);
const favLoaded = ref(false);

const FAVORITES_KEY = 'plant_exchange_favorites';

export function usePlants() {
  const userId = getOrCreateUserId();

  const loadPlants = () => {
    const stored = getItem<Plant[]>(STORAGE_KEYS.PLANTS);
    if (stored && stored.length > 0) {
      plants.value = stored;
    } else {
      const mockWithIds: Plant[] = MOCK_PLANTS.map((plant, index) => ({
        ...plant,
        id: generateId(),
        userId: `mock_user_${index % 3}`,
        createdAt: Date.now() - (index * 3600000 + Math.random() * 86400000),
      }));
      plants.value = mockWithIds;
      savePlants();
    }
    isLoaded.value = true;
  };

  const savePlants = () => {
    try {
      setItem(STORAGE_KEYS.PLANTS, plants.value);
    } catch (e) {
      console.error('存储空间不足，请删除一些旧数据');
    }
  };

  const allPlants = computed(() => {
    return [...plants.value].sort((a, b) => b.createdAt - a.createdAt);
  });

  const getPlantById = (id: string) => {
    return plants.value.find((p) => p.id === id);
  };

  const filterPlants = (category?: PlantCategory | 'all', keyword?: string) => {
    return computed(() => {
      let result = allPlants.value;
      if (category && category !== 'all') {
        result = result.filter((p) => p.category === category);
      }
      if (keyword && keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(kw) ||
            p.variety.toLowerCase().includes(kw) ||
            p.description.toLowerCase().includes(kw)
        );
      }
      return result;
    });
  };

  const addPlant = (formData: PublishFormData) => {
    const newPlant: Plant = {
      ...formData,
      id: generateId(),
      userId,
      createdAt: Date.now(),
    };
    plants.value.unshift(newPlant);
    savePlants();

    const published = getItem<string[]>(STORAGE_KEYS.PUBLISHED) || [];
    published.unshift(newPlant.id);
    setItem(STORAGE_KEYS.PUBLISHED, published);

    return newPlant;
  };

  const deletePlant = (id: string) => {
    const index = plants.value.findIndex((p) => p.id === id);
    if (index > -1) {
      plants.value.splice(index, 1);
      savePlants();
    }
  };

  const getMyPublished = computed(() => {
    const publishedIds = getItem<string[]>(STORAGE_KEYS.PUBLISHED) || [];
    return plants.value
      .filter((p) => publishedIds.includes(p.id) || p.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  });

  const loadFavorites = () => {
    const stored = getItem<string[]>(FAVORITES_KEY);
    if (stored) {
      favoriteIds.value = stored;
    }
    favLoaded.value = true;
  };

  const saveFavorites = () => {
    setItem(FAVORITES_KEY, favoriteIds.value);
  };

  const isFavorited = (plantId: string) => {
    if (!favLoaded.value) {
      loadFavorites();
    }
    return favoriteIds.value.includes(plantId);
  };

  const toggleFavorite = (plantId: string) => {
    if (!favLoaded.value) {
      loadFavorites();
    }
    const index = favoriteIds.value.indexOf(plantId);
    if (index > -1) {
      favoriteIds.value.splice(index, 1);
    } else {
      favoriteIds.value.unshift(plantId);
    }
    saveFavorites();
  };

  const removeFavorite = (plantId: string) => {
    const index = favoriteIds.value.indexOf(plantId);
    if (index > -1) {
      favoriteIds.value.splice(index, 1);
      saveFavorites();
    }
  };

  const getFavoritedPlants = computed(() => {
    if (!favLoaded.value) {
      loadFavorites();
    }
    return favoriteIds.value
      .map((id) => getPlantById(id))
      .filter((p): p is Plant => p !== undefined);
  });

  onMounted(() => {
    if (!isLoaded.value) {
      loadPlants();
    }
    if (!favLoaded.value) {
      loadFavorites();
    }
  });

  return {
    plants: allPlants,
    isLoaded,
    loadPlants,
    getPlantById,
    filterPlants,
    addPlant,
    deletePlant,
    getMyPublished,
    userId,
    favoriteIds,
    isFavorited,
    toggleFavorite,
    removeFavorite,
    getFavoritedPlants,
  };
}
