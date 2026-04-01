export interface Favorites {
  userId: string;
  productIds: string[];
  updatedAt: number;
}

export interface FavoriteUpdate {
  productId: string;
  action: 'add' | 'remove';
}

export interface FavoriteListItem {
  id: string;
  name: string;
  category: 'bikes' | 'accessory' | 'souvenir' | 'tool';
  price: number;
  image: string;
  stock: number;
}
