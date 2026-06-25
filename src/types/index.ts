export type PlantCategory = 'succulent' | 'green' | 'flower' | 'tool';

export interface Plant {
  id: string;
  name: string;
  variety: string;
  category: PlantCategory;
  description: string;
  images: string[];
  wantToExchange: string;
  contact: string;
  publisher: string;
  community: string;
  createdAt: number;
  userId: string;
}

export interface UserInterest {
  plantId: string;
  addedAt: number;
}

export interface PublishFormData {
  name: string;
  variety: string;
  category: PlantCategory;
  description: string;
  images: string[];
  wantToExchange: string;
  contact: string;
  publisher: string;
  community: string;
}

export const CATEGORY_LABELS: Record<PlantCategory, string> = {
  succulent: '多肉',
  green: '绿植',
  flower: '花卉',
  tool: '工具',
};

export const CATEGORY_ICONS: Record<PlantCategory, string> = {
  succulent: '🌵',
  green: '🌿',
  flower: '🌸',
  tool: '🧰',
};

export const STORAGE_KEYS = {
  PLANTS: 'plant_exchange_plants',
  USER_ID: 'plant_exchange_user_id',
  INTERESTED: 'plant_exchange_interested',
  PUBLISHED: 'plant_exchange_published',
} as const;
