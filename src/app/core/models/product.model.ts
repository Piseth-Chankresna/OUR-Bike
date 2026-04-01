export interface Product {
  id: string;
  name: string;
  category: 'bikes' | 'accessory' | 'souvenir' | 'tool';
  price: number;
  description: string;
  images: string[];
  stock: number;
  dateAdded: number;
  specifications: ProductSpecifications;
  rating?: number;
}

export interface ProductSpecifications {
  brand: string;
  model: string;
  engineSize?: string;
  color?: string;
  size?: string;
  weight?: string;
  material?: string;
  features?: string[];
  dimensions?: string;
  warranty?: string;
  [key: string]: any;
}

export interface ProductCreate {
  name: string;
  category: 'bikes' | 'accessory' | 'souvenir' | 'tool';
  price: number;
  description: string;
  images: string[];
  stock: number;
  specifications: ProductSpecifications;
}

export interface ProductUpdate {
  name?: string;
  category?: 'bikes' | 'accessory' | 'souvenir' | 'tool';
  price?: number;
  description?: string;
  images?: string[];
  stock?: number;
  specifications?: ProductSpecifications;
}

export interface ProductFilter {
  category?: 'bikes' | 'accessory' | 'souvenir' | 'tool' | 'all';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchQuery?: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  category: 'bikes' | 'accessory' | 'souvenir' | 'tool';
  price: number;
  image: string;
  stock: number;
  dateAdded: number;
}
