import { CartItem, Product } from "./types";

interface ReservedItem {
  productId: string;
  quantity: number;
}

interface InventoryReservation {
  orderId: string;
  items: ReservedItem[];
  expiresAt: number;
}

// In-memory active reservation tracking (cleared on tab close, perfect for checkout duration)
let reservations: InventoryReservation[] = [];
const RESERVATION_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes reservation locks

const notifyStorageChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("greenmart-storage"));
  }
};

/**
 * Gets all current products from localStorage database.
 */
export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("greenmart_products");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse products database:", e);
    }
  }
  return [];
}

/**
 * Saves products array to localStorage database and triggers reactive rendering.
 */
export function saveStoredProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("greenmart_products", JSON.stringify(products));
  notifyStorageChanged();
}

/**
 * Checks if sufficient stock exists for an array of cart items.
 */
export function canReserveInventory(items: CartItem[]): boolean {
  const products = getStoredProducts();
  if (products.length === 0) return true; // Fallback if DB not loaded yet
  
  return items.every(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return false;
    return product.stockCount >= item.quantity;
  });
}

/**
 * Reserves inventory temporarily during payment processing. 
 * Subtracts quantities from available stock count instantly.
 */
export function reserveInventory(orderId: string, items: CartItem[]): boolean {
  if (!canReserveInventory(items)) {
    return false;
  }

  const products = getStoredProducts();
  const reservedItems: ReservedItem[] = [];

  // Deduct available stock
  const updatedProducts = products.map(product => {
    const cartItem = items.find(item => item.id === product.id);
    if (cartItem) {
      const quantityToDeduct = Math.min(product.stockCount, cartItem.quantity);
      reservedItems.push({ productId: product.id, quantity: quantityToDeduct });
      
      const newStockCount = product.stockCount - quantityToDeduct;
      return {
        ...product,
        stockCount: newStockCount,
        inStock: newStockCount > 0
      };
    }
    return product;
  });

  // Save updated product stock counts to DB
  saveStoredProducts(updatedProducts);

  // Add reservation lock
  reservations.push({
    orderId,
    items: reservedItems,
    expiresAt: Date.now() + RESERVATION_EXPIRY_MS
  });

  // Set timeout to auto-release if not confirmed
  setTimeout(() => {
    releaseExpiredReservations(orderId);
  }, RESERVATION_EXPIRY_MS);

  return true;
}

/**
 * Releases stock from a reservation lock if payment fails.
 * Adds quantities back to the product stock counts.
 */
export function releaseInventory(orderId: string): void {
  const index = reservations.findIndex(r => r.orderId === orderId);
  if (index === -1) return;

  const reservation = reservations[index];
  const products = getStoredProducts();

  // Restore available stock
  const updatedProducts = products.map(product => {
    const reserved = reservation.items.find(item => item.productId === product.id);
    if (reserved) {
      const newStockCount = product.stockCount + reserved.quantity;
      return {
        ...product,
        stockCount: newStockCount,
        inStock: newStockCount > 0
      };
    }
    return product;
  });

  saveStoredProducts(updatedProducts);
  
  // Remove reservation record
  reservations.splice(index, 1);
  console.log(`🔓 [Inventory Manager] - Released reservation for order: ${orderId}`);
}

/**
 * Confirms payment success and permanently consumes stock (removes reservation tracker).
 */
export function confirmInventoryReduction(orderId: string): void {
  const index = reservations.findIndex(r => r.orderId === orderId);
  if (index === -1) return;

  // Reservation confirmed, remove lock tracker without restoring stock
  reservations.splice(index, 1);
  console.log(`📦 [Inventory Manager] - Confirmed inventory reduction for order: ${orderId}`);
}

/**
 * Safe helper to release a reservation if it expired without payment confirmation.
 */
function releaseExpiredReservations(orderId: string) {
  const reservation = reservations.find(r => r.orderId === orderId);
  if (!reservation) return; // Already cleared by confirmation or release call
  
  if (Date.now() >= reservation.expiresAt) {
    console.log(`⏰ [Inventory Manager] - Reservation expired for order ${orderId}. Releasing stock...`);
    releaseInventory(orderId);
  }
}
