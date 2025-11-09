export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;

  // New API fields
  description?: string;
  brand?: string;
  mainFeatures?: string[];
  tags?: string[];
  deliveryDays?: number;
  category?: string;

  // Optional fields (not provided by API)
  nameKo?: string;
  pricePerUnit?: string;
  rating?: number;
  reviewCount?: number;
  origin?: string;
  weight?: string;
  quantity?: number;
}

// API Response type
export interface APIProductResponse {
  id: string;
  title: string;
  description: string;
  brand: string;
  mainFeatures: string[];
  tags: string[];
  priceKRW: number;
  deliveryDays: number;
  category: string;
  imageUrl: string;
}
