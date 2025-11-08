export interface Product {
  id: string;
  name: string;
  nameKo: string;
  image: string;
  price: number;
  pricePerUnit: string; // e.g., "100g당 460원"
  rating: number;
  reviewCount: number;
  origin: string;
  weight: string;
  quantity: number;
}
