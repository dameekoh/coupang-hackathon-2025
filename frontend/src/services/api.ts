import type { Product, APIProductResponse } from '../types/product';

const API_URL = 'https://hungryai.asmirabdimazhit.com/chat';
const SESSION_ID = 'eats1';

/**
 * Maps API response to Product type
 */
function mapAPIResponseToProduct(apiProduct: APIProductResponse): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.title,
    image: apiProduct.imageUrl,
    price: apiProduct.priceKRW,
    description: apiProduct.description,
    brand: apiProduct.brand,
    mainFeatures: apiProduct.mainFeatures,
    tags: apiProduct.tags,
    deliveryDays: apiProduct.deliveryDays,
    category: apiProduct.category,
  };
}

/**
 * Fetches product recommendations based on voice input
 */
export async function fetchProductRecommendations(
  message: string
): Promise<Product | null> {
  try {
    console.log('[API] Fetching products for message:', message);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: SESSION_ID,
        message: message.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: APIProductResponse[] = await response.json();
    console.log('[API] Received response:', data);

    if (!data || data.length === 0) {
      console.log('[API] No products found');
      return null;
    }

    // Return first product from the array
    const product = mapAPIResponseToProduct(data[0]);
    console.log('[API] Mapped product:', product);

    return product;
  } catch (error) {
    console.error('[API] Error fetching products:', error);
    throw error;
  }
}
