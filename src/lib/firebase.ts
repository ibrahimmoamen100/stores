// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy, where, Timestamp, runTransaction } from 'firebase/firestore';
import { Product } from '@/types/product';
import {
  Employee,
  AttendanceRecord,
  MonthlySummary,
  ExcuseStatus,
  DeductionType,
  AttendanceStatus,
  AttendanceSettings,
  ExcusedAbsencePolicy,
  DEFAULT_ATTENDANCE_SETTINGS,
  SalaryAdvance,
  calculateDelayDeduction,
  calculateOvertime,
  calculateDelay,
  getEmployeeDailyWage,
} from '@/types/attendance';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARpBTCmOVdyxusXnUT_KPn4G0qG4Fp7Hc",
  authDomain: "stores-d9edb.firebaseapp.com",
  projectId: "stores-d9edb",
  storageBucket: "stores-d9edb.firebasestorage.app",
  messagingSenderId: "568557679847",
  appId: "1:568557679847:web:6b704f845317e0e87c1e42",
  measurementId: "G-YDHVYLER1L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Analytics with proper async support check
// This will be null if Analytics is not supported (e.g., server-side rendering, ad blockers)
export let analytics: Analytics | null = null;

// Async initialization of Analytics
(async () => {
  if (typeof window !== 'undefined') {
    try {
      const supported = await isSupported();
      if (supported) {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized successfully');
      } else {
        console.warn('⚠️ Firebase Analytics is not supported in this environment');
      }
    } catch (error) {
      console.warn('⚠️ Analytics initialization failed:', error);
    }
  }
})();

// Firebase Products Service
export class FirebaseProductsService {
  private collectionName = 'products';

  private replaceUndefinedWithNull<T>(value: T): T {
    if (Array.isArray(value)) {
      return (value as any).map((item: any) =>
        this.replaceUndefinedWithNull(item)
      ) as T;
    }

    if (value instanceof Date) {
      return value;
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, any>).map(([key, val]) => [
          key,
          this.replaceUndefinedWithNull(val === undefined ? null : val),
        ])
      ) as T;
    }

    return (value === undefined ? (null as any) : value) as T;
  }

  // Generate a URL-friendly slug from a product name
  private slugifyProductName(name: string): string {
    const maxWords = 25;
    const normalized = name
      .trim()
      // Replace underscores with spaces first
      .replace(/[_]+/g, ' ')
      // Collapse multiple whitespace
      .replace(/\s+/g, ' ');

    // Limit to first N words
    const words = normalized.split(' ').slice(0, maxWords);
    const limited = words.join(' ');

    // Convert to lowercase for consistency
    const lower = limited.toLowerCase();

    // Keep letters (including non-latin), numbers and spaces; replace others with a space
    const cleaned = lower.replace(/[^\p{L}\p{N}\s-]+/gu, ' ');

    // Replace spaces and consecutive dashes with single dash, and trim
    const dashed = cleaned
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Optionally cap total length for nicer URLs
    const maxLen = 120;
    return dashed.length > maxLen ? dashed.slice(0, maxLen).replace(/-+$/g, '') : dashed;
  }

  // Ensure unique slug by checking Firestore doc IDs and appending a counter if needed
  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let candidate = baseSlug || 'product';
    let attempt = 1;

    // Check if a document with this ID already exists
    // Try a reasonable number of attempts to avoid infinite loops
    while (attempt <= 100) {
      const ref = doc(db, this.collectionName, candidate);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return candidate;
      }
      attempt += 1;
      candidate = `${baseSlug}-${attempt}`;
    }
    // Fallback: timestamp-based suffix
    return `${baseSlug}-${Date.now().toString(36)}`;
  }

  // Get all products
  async getAllProducts(): Promise<Product[]> {
    // Try Firebase first
    try {
      const productsRef = collection(db, this.collectionName);
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          offerEndsAt: data.offerEndsAt?.toDate?.()?.toISOString() || data.offerEndsAt,
          expirationDate: data.expirationDate?.toDate?.()?.toISOString() || data.expirationDate,
        } as Product);
      });

      // Also load products from localStorage fallback and merge
      try {
        const localProductsKey = 'local_products_fallback';
        const localProductsJson = localStorage.getItem(localProductsKey);
        if (localProductsJson) {
          const localProducts: Product[] = JSON.parse(localProductsJson);
          console.log('📦 Found', localProducts.length, 'products in localStorage fallback');
          // Merge local products with Firebase products (avoid duplicates)
          const firebaseIds = new Set(products.map(p => p.id));
          const uniqueLocalProducts = localProducts.filter(p => !firebaseIds.has(p.id));

          if (uniqueLocalProducts.length > 0) {
            console.log('🚀 Syncing ' + uniqueLocalProducts.length + ' local products to Firebase...');

            // Background sync (don't block the UI return)
            (async () => {
              try {
                // Keep track of which ones were successfully synced
                const successfullySyncedIds = new Set<string>();

                for (const p of uniqueLocalProducts) {
                  try {
                    const docRef = doc(db, this.collectionName, p.id);

                    const { id, _savedLocally, ...productDataWithoutId } = p as any;

                    const productData = {
                      ...productDataWithoutId,
                      createdAt: productDataWithoutId.createdAt ? Timestamp.fromDate(new Date(productDataWithoutId.createdAt)) : Timestamp.now(),
                      offerEndsAt: productDataWithoutId.offerEndsAt ? Timestamp.fromDate(new Date(productDataWithoutId.offerEndsAt)) : null,
                      expirationDate: productDataWithoutId.expirationDate ? Timestamp.fromDate(new Date(productDataWithoutId.expirationDate)) : null,
                    };

                    // Remove undefined values
                    const cleanData = Object.fromEntries(
                      Object.entries(productData).filter(([_, v]) => v !== undefined)
                    );

                    await setDoc(docRef, cleanData);
                    console.log('✅ Auto-synced product to Firebase:', p.id);
                    successfullySyncedIds.add(p.id);
                  } catch (syncError) {
                    console.error('❌ Failed to auto-sync product ' + p.id + ' to Firebase:', syncError);
                  }
                }

                // Update localStorage to remove synced products
                if (successfullySyncedIds.size > 0) {
                  const currentLocalJson = localStorage.getItem(localProductsKey);
                  if (currentLocalJson) {
                    const currentLocal: Product[] = JSON.parse(currentLocalJson);
                    const remainingLocalProducts = currentLocal.filter(p => !successfullySyncedIds.has(p.id));

                    if (remainingLocalProducts.length === 0) {
                      localStorage.removeItem(localProductsKey);
                      console.log('✅ All local products synced and removed from localStorage fallback.');
                    } else {
                      localStorage.setItem(localProductsKey, JSON.stringify(remainingLocalProducts));
                      console.warn('⚠️ Some products still remaining in localStorage fallback:', remainingLocalProducts.length);
                    }
                  }
                }
              } catch (e) {
                console.error('Auto-sync process failed:', e);
              }
            })();

            // Add to current UI immediately
            products.push(...uniqueLocalProducts);
          }
        }
      } catch (localError) {
        console.warn('⚠️ Error loading local products:', localError);
      }

      return products;
    } catch (error: any) {
      console.warn('⚠️ Failed to load products from Firebase (falling back to localStorage):', error?.message || error);

      // Fallback to localStorage
      try {
        const localProductsKey = 'local_products_fallback';
        const localProductsJson = localStorage.getItem(localProductsKey);
        if (localProductsJson) {
          const localProducts: Product[] = JSON.parse(localProductsJson);
          console.log('✅ Loaded', localProducts.length, 'products from localStorage fallback');
          return localProducts;
        }
        return [];
      } catch (localError) {
        console.error('❌ Error loading products from localStorage:', localError);
        return [];
      }
    }
  }

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          offerEndsAt: data.offerEndsAt?.toDate?.()?.toISOString() || data.offerEndsAt,
          expirationDate: data.expirationDate?.toDate?.()?.toISOString() || data.expirationDate,
        } as Product;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  // Add new product
  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const normalizedProduct = this.replaceUndefinedWithNull(product);

    // Clean the product data by removing undefined values
    const cleanProduct = Object.fromEntries(
      Object.entries(normalizedProduct).filter(([_, value]) => value !== undefined)
    );

    // Build slug from product name and ensure uniqueness
    const baseSlug = this.slugifyProductName((cleanProduct as any).name || 'product');

    // Try Firebase first
    try {
      const productsRef = collection(db, this.collectionName);

      // Convert dates to Firestore Timestamps
      const productData = {
        ...cleanProduct,
        createdAt: (cleanProduct as any).createdAt ? Timestamp.fromDate(new Date((cleanProduct as any).createdAt)) : Timestamp.now(),
        offerEndsAt: (cleanProduct as any).offerEndsAt ? Timestamp.fromDate(new Date((cleanProduct as any).offerEndsAt)) : null,
        expirationDate: (cleanProduct as any).expirationDate ? Timestamp.fromDate(new Date((cleanProduct as any).expirationDate)) : null,
      };

      const uniqueSlug = await this.ensureUniqueSlug(baseSlug);

      // Create document with custom ID equal to the slug
      const docRef = doc(productsRef, uniqueSlug);
      await setDoc(docRef, productData);

      console.log('✅ Product added to Firebase successfully:', uniqueSlug);

      return {
        ...(cleanProduct as any),
        createdAt: (cleanProduct as any).createdAt || new Date().toISOString(),
        id: uniqueSlug,
      } as Product;
    } catch (error: any) {
      console.warn('⚠️ Failed to add product to Firebase (falling back to localStorage):', error?.message || error);

      // Fallback to localStorage
      try {
        const uniqueSlug = baseSlug + '-' + Date.now();
        const productWithId = {
          ...(cleanProduct as any),
          createdAt: (cleanProduct as any).createdAt || new Date().toISOString(),
          id: uniqueSlug,
        } as Product;

        // Save to localStorage
        const localProductsKey = 'local_products_fallback';
        const existingProducts = localStorage.getItem(localProductsKey);
        const products = existingProducts ? JSON.parse(existingProducts) : [];
        products.push(productWithId);
        localStorage.setItem(localProductsKey, JSON.stringify(products));

        console.log('✅ Product saved to localStorage as fallback:', uniqueSlug);
        console.warn('⚠️ Product saved locally due to Firebase permissions issue. Product will be available but not synced to Firebase.');

        // Add a flag to indicate this was saved locally
        (productWithId as any)._savedLocally = true;

        return productWithId;
      } catch (localError) {
        console.error('❌ Error saving product to localStorage:', localError);
        throw new Error('فشل في إضافة المنتج. يرجى المحاولة مرة أخرى.');
      }
    }
  }

  // Update product
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
      console.log(`Firebase: Updating product ${id} with data:`, product);
      const docRef = doc(db, this.collectionName, id);

      const normalizedProduct = this.replaceUndefinedWithNull(product);

      // Clean the product data by removing undefined values
      const cleanProduct = Object.fromEntries(
        Object.entries(normalizedProduct).filter(([_, value]) => value !== undefined)
      );

      // Convert dates to Firestore Timestamps
      const updateData: any = { ...cleanProduct };
      if ((cleanProduct as any).createdAt) {
        updateData.createdAt = Timestamp.fromDate(new Date((cleanProduct as any).createdAt));
      }
      if ((cleanProduct as any).offerEndsAt) {
        updateData.offerEndsAt = Timestamp.fromDate(new Date((cleanProduct as any).offerEndsAt));
      }
      if ((cleanProduct as any).expirationDate) {
        updateData.expirationDate = Timestamp.fromDate(new Date((cleanProduct as any).expirationDate));
      }

      console.log(`Firebase: Final update data:`, updateData);
      await updateDoc(docRef, updateData);
      console.log(`Firebase: Document updated successfully`);

      const updatedProduct = await this.getProductById(id) as Product;
      console.log(`Firebase: Retrieved updated product:`, updatedProduct);
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const productsRef = collection(db, this.collectionName);
      const q = query(
        productsRef,
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          offerEndsAt: data.offerEndsAt?.toDate?.()?.toISOString() || data.offerEndsAt,
          expirationDate: data.expirationDate?.toDate?.()?.toISOString() || data.expirationDate,
        } as Product);
      });

      return products;
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  }

  // Get active products (not archived)
  async getActiveProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, this.collectionName);
      const q = query(
        productsRef,
        where('isArchived', '==', false),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          offerEndsAt: data.offerEndsAt?.toDate?.()?.toISOString() || data.offerEndsAt,
          expirationDate: data.expirationDate?.toDate?.()?.toISOString() || data.expirationDate,
        } as Product);
      });

      return products;
    } catch (error) {
      console.error('Error getting active products:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const productsRef = collection(db, this.collectionName);
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const product = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          offerEndsAt: data.offerEndsAt?.toDate?.()?.toISOString() || data.offerEndsAt,
          expirationDate: data.expirationDate?.toDate?.()?.toISOString() || data.expirationDate,
        } as Product;

        // Filter by search term
        if (
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          products.push(product);
        }
      });

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

// Create and export the products service instance
export const productsService = new FirebaseProductsService();

// Check if tracking is globally enabled
export const isTrackingEnabled = async (): Promise<boolean> => {
  try {
    const snap = await getDoc(doc(db, "admin_config", "settings"));
    if (snap.exists()) {
      return snap.data().trackingEnabled !== false;
    }
    return true;
  } catch (error) {
    console.error("Error checking tracking status:", error);
    return true; // Default to true on error
  }
};

// Firebase Sales Service
export interface CashierSale {
  id: string;
  items: {
    product: {
      id: string;
      name: string;
      price: number;
      wholesaleInfo?: {
        purchasePrice: number;
        quantity: number;
      };
    };
    quantity: number;
    selectedSize?: {
      id: string;
      label: string;
      price: number;
    };
    selectedAddons: {
      id: string;
      label: string;
      price_delta: number;
    }[];
    unitFinalPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  timestamp: Date;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: 'vodafone_cash' | 'instaPay' | 'cash';
}

export class FirebaseSalesService {
  private collectionName = 'cashier-sales';

  // Get all sales
  async getAllSales(): Promise<CashierSale[]> {
    try {
      const salesRef = collection(db, this.collectionName);
      const q = query(salesRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);

      const sales: CashierSale[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sales.push({
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        } as CashierSale);
      });

      return sales;
    } catch (error) {
      console.error('Error getting sales:', error);
      throw error;
    }
  }

  // Add new sale
  async addSale(sale: Omit<CashierSale, 'id'>): Promise<CashierSale> {
    try {
      const trackingEnabled = await isTrackingEnabled();
      if (!trackingEnabled) {
        console.warn('⚠️ Tracking is manually disabled. Skipping Firebase write for cashier sale.');
        throw new Error('Tracking manually disabled'); // Throw error to trigger Cashier's localStorage backup
      }

      const salesRef = collection(db, this.collectionName);

      // Convert timestamp to Firestore Timestamp
      const saleData = {
        ...sale,
        timestamp: Timestamp.fromDate(sale.timestamp),
      };

      const docRef = await addDoc(salesRef, saleData);

      return {
        ...sale,
        id: docRef.id,
      } as CashierSale;
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  }

  // Get sales by date range
  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<CashierSale[]> {
    try {
      const salesRef = collection(db, this.collectionName);
      const q = query(
        salesRef,
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const sales: CashierSale[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sales.push({
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        } as CashierSale);
      });

      return sales;
    } catch (error) {
      console.error('Error getting sales by date range:', error);
      throw error;
    }
  }

  // Delete sale
  async deleteSale(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  }

  // Clear all sales
  async clearAllSales(): Promise<void> {
    try {
      const salesRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(salesRef);

      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing all sales:', error);
      throw error;
    }
  }
}

// Create and export the sales service instance
export const salesService = new FirebaseSalesService();

// Atomic quantity update interface
interface QuantityUpdate {
  productId: string;
  quantityToDeduct: number;
}

// Atomic quantity restore interface
interface QuantityRestore {
  productId: string;
  quantityToRestore: number;
}

// Atomic quantity update function for preventing race conditions
export const updateProductQuantitiesAtomically = async (updates: QuantityUpdate[]): Promise<void> => {
  return runTransaction(db, async (transaction) => {
    // First, read all product documents
    const productDocs = await Promise.all(
      updates.map(update => {
        const productRef = doc(db, 'products', update.productId);
        return transaction.get(productRef);
      })
    );

    // Check if all products exist and have sufficient quantities
    const updatedQuantities: { [key: string]: number } = {};

    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      const productDoc = productDocs[i];

      if (!productDoc.exists()) {
        throw new Error(`المنتج ${update.productId} غير موجود`);
      }

      const productData = productDoc.data() as Product;
      const currentQuantity = productData.wholesaleInfo?.quantity || 0;
      const newQuantity = Math.max(0, currentQuantity - update.quantityToDeduct);

      if (currentQuantity < update.quantityToDeduct) {
        console.warn(`تحذير: الكمية المطلوبة (${update.quantityToDeduct}) أكبر من المتوفر (${currentQuantity}) للمنتج ${productData.name}`);
      }

      updatedQuantities[update.productId] = newQuantity;
    }

    // Now update all products atomically
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      const productDoc = productDocs[i];
      const productData = productDoc.data() as Product;
      const newQuantity = updatedQuantities[update.productId];

      const productRef = doc(db, 'products', update.productId);
      transaction.update(productRef, {
        'wholesaleInfo.quantity': newQuantity
      });

      console.log(`Transaction: تحديث المنتج ${productData.name} من ${productData.wholesaleInfo?.quantity || 0} إلى ${newQuantity}`);
    }
  });
};

// Atomic quantity restore function for restoring quantities back to products
export const restoreProductQuantitiesAtomically = async (restores: QuantityRestore[]): Promise<void> => {
  return runTransaction(db, async (transaction) => {
    // First, read all product documents
    const productDocs = await Promise.all(
      restores.map(restore => {
        const productRef = doc(db, 'products', restore.productId);
        return transaction.get(productRef);
      })
    );

    // Check if all products exist and calculate new quantities
    const updatedQuantities: { [key: string]: number } = {};

    for (let i = 0; i < restores.length; i++) {
      const restore = restores[i];
      const productDoc = productDocs[i];

      if (!productDoc.exists()) {
        throw new Error(`المنتج ${restore.productId} غير موجود`);
      }

      const productData = productDoc.data() as Product;
      const currentQuantity = productData.wholesaleInfo?.quantity || 0;
      const newQuantity = currentQuantity + restore.quantityToRestore;

      updatedQuantities[restore.productId] = newQuantity;
    }

    // Now update all products atomically
    for (let i = 0; i < restores.length; i++) {
      const restore = restores[i];
      const productDoc = productDocs[i];
      const productData = productDoc.data() as Product;
      const newQuantity = updatedQuantities[restore.productId];

      const productRef = doc(db, 'products', restore.productId);
      transaction.update(productRef, {
        'wholesaleInfo.quantity': newQuantity
      });

      console.log(`Transaction: استعادة المنتج ${productData.name} من ${productData.wholesaleInfo?.quantity || 0} إلى ${newQuantity}`);
    }
  });
};

// Create an order document and update product quantities atomically in a single
// Firestore transaction. This prevents races where orders are created but stock
// isn't deducted (or vice versa).
export const createOrderAndUpdateProductQuantitiesAtomically = async (
  orderPayload: any,
  quantityUpdates: QuantityUpdate[]
): Promise<{ orderId: string }> => {
  return runTransaction(db, async (transaction) => {
    // Create a new order doc with an auto-generated ID
    const ordersRef = collection(db, 'orders');
    const newOrderRef = doc(ordersRef); // create a DocumentReference with auto ID

    // Read product docs to validate and compute new quantities
    const productDocs = await Promise.all(
      quantityUpdates.map(u => transaction.get(doc(db, 'products', u.productId)))
    );

    for (let i = 0; i < quantityUpdates.length; i++) {
      const update = quantityUpdates[i];
      const productDoc = productDocs[i];
      if (!productDoc.exists()) {
        throw new Error(`المنتج ${update.productId} غير موجود`);
      }

      const productData = productDoc.data() as Product;
      const currentQuantity = productData.wholesaleInfo?.quantity || 0;

      if (currentQuantity < update.quantityToDeduct) {
        throw new Error(`عذراً، الكمية المتوفرة للمنتج ${productData.name} هي ${currentQuantity}، ولكن طلبت ${update.quantityToDeduct}`);
      }

      const newQuantity = currentQuantity - update.quantityToDeduct;

      // Update product quantity in transaction
      transaction.update(doc(db, 'products', update.productId), {
        'wholesaleInfo.quantity': newQuantity
      });
    }

    // Write the order document
    transaction.set(newOrderRef, {
      ...orderPayload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Transaction: Order created with ID:', newOrderRef.id);
    console.log('✅ Transaction: Product quantities updated for', quantityUpdates.length, 'products');

    return { orderId: newOrderRef.id };
  });
};

// Firebase Employees Service
export class FirebaseEmployeesService {
  private collectionName = 'employees';

  // Get all employees
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const employeesRef = collection(db, this.collectionName);
      const q = query(employeesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const employees: Employee[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employees.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Employee);
      });

      return employees;
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  }

  // Get employee by ID
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Employee;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting employee:', error);
      throw error;
    }
  }

  // Add new employee
  async addEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    try {
      const employeesRef = collection(db, this.collectionName);

      const employeeData = {
        ...employee,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(employeesRef, employeeData);

      return {
        ...employee,
        id: docRef.id,
        createdAt: employeeData.createdAt.toDate().toISOString(),
        updatedAt: employeeData.updatedAt.toDate().toISOString(),
      } as Employee;
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  // Update employee
  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    try {
      const docRef = doc(db, this.collectionName, id);

      const updateData: any = { ...employee };
      delete updateData.id;
      delete updateData.createdAt;
      updateData.updatedAt = Timestamp.now();

      await updateDoc(docRef, updateData);

      const updatedEmployee = await this.getEmployeeById(id) as Employee;
      return updatedEmployee;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  // Delete employee
  async deleteEmployee(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
}

// Create and export the employees service instance
export const employeesService = new FirebaseEmployeesService();

// Firebase Attendance Service
export class FirebaseAttendanceService {
  private collectionName = 'attendance';
  private advancesCollectionName = 'salary_advances';
  private summaryCollectionName = 'attendance_summaries';

  private getSummaryDocId(employeeId: string, month: string) {
    return `${employeeId}_${month}`;
  }

  private mapRecord(docId: string, data: any): AttendanceRecord {
    const status: AttendanceStatus = (data.status as AttendanceStatus) || (data.checkInTime ? 'present' : 'absent');
    const storedExcuseStatus = (data.excuseStatus as ExcuseStatus | 'approved') || 'rejected';
    const excuseStatus: ExcuseStatus =
      storedExcuseStatus === 'approved' ? 'accepted' : storedExcuseStatus;
    const normalizedDailyNet =
      typeof data.dailyNet === 'number'
        ? data.dailyNet
        : (data.overtimeAmount ?? 0) - (data.deductionAmount ?? 0);

    return {
      ...data,
      id: docId,
      status,
      excuseStatus,
      notes: data.notes ?? null,
      excuseNote: data.excuseNote ?? null,
      excuseResolution: (data.excuseResolution as 'no_deduct' | 'hourly' | null) ?? null,
      dailyWage: typeof data.dailyWage === 'number' ? data.dailyWage : 0,
      dailyNet: normalizedDailyNet,
      excusedAbsencePolicy:
        (data.excusedAbsencePolicy as ExcusedAbsencePolicy) ||
        DEFAULT_ATTENDANCE_SETTINGS.excusedAbsencePolicy,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as AttendanceRecord;
  }

  private calculateBaseImpact(
    status: AttendanceStatus,
    dailyWage: number,
    policy: ExcusedAbsencePolicy,
    excuseStatus?: ExcuseStatus
  ): number {
    if (status === 'present') return dailyWage;
    if (status === 'absent') return -dailyWage;
    if (status === 'absent_excused') {
      if (excuseStatus === 'rejected') return -dailyWage;
      if (excuseStatus === 'accepted') return 0;
      // Pending review should not affect salary yet
      return 0;
    }
    return policy === 'deduct' ? -dailyWage : 0;
  }

  // Get all attendance records
  async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const attendanceRef = collection(db, this.collectionName);
      const q = query(attendanceRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      const records: AttendanceRecord[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        records.push(this.mapRecord(docSnapshot.id, data));
      });

      return records;
    } catch (error) {
      console.error('Error getting attendance records:', error);
      throw error;
    }
  }

  // Get attendance records by employee
  async getAttendanceRecordsByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    try {
      const attendanceRef = collection(db, this.collectionName);
      // Use only where clause to avoid index requirement, then sort in memory
      const q = query(
        attendanceRef,
        where('employeeId', '==', employeeId)
      );
      const querySnapshot = await getDocs(q);

      const records: AttendanceRecord[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        records.push(this.mapRecord(docSnapshot.id, data));
      });

      // Sort by date descending in memory (newest first)
      records.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
      });

      return records;
    } catch (error) {
      console.error('Error getting attendance records by employee:', error);
      throw error;
    }
  }

  // Get attendance records by date range
  async getAttendanceRecordsByDateRange(startDate: string, endDate: string): Promise<AttendanceRecord[]> {
    try {
      const attendanceRef = collection(db, this.collectionName);
      const q = query(
        attendanceRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const records: AttendanceRecord[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        records.push(this.mapRecord(docSnapshot.id, data));
      });

      return records;
    } catch (error) {
      console.error('Error getting attendance records by date range:', error);
      throw error;
    }
  }

  // Get attendance record by employee and date
  async getAttendanceRecordByEmployeeAndDate(employeeId: string, date: string): Promise<AttendanceRecord | null> {
    try {
      const attendanceRef = collection(db, this.collectionName);
      const q = query(
        attendanceRef,
        where('employeeId', '==', employeeId),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return this.mapRecord(doc.id, data);
    } catch (error) {
      console.error('Error getting attendance record:', error);
      throw error;
    }
  }

  // Add salary advance
  async addSalaryAdvance(
    employee: Employee,
    payload: { amount: number; month: string; note?: string | null }
  ): Promise<SalaryAdvance> {
    try {
      const docRef = await addDoc(collection(db, this.advancesCollectionName), {
        employeeId: employee.id,
        employeeName: employee.name,
        month: payload.month,
        amount: payload.amount,
        note: payload.note || null,
        createdAt: Timestamp.now(),
      });

      return {
        id: docRef.id,
        employeeId: employee.id,
        employeeName: employee.name,
        month: payload.month,
        amount: payload.amount,
        note: payload.note || null,
        createdAt: Timestamp.now().toDate().toISOString(),
      };
    } catch (error) {
      console.error('Error adding salary advance:', error);
      throw error;
    }
  }

  // Get salary advances for an employee and month
  async getSalaryAdvances(employeeId: string, month: string): Promise<SalaryAdvance[]> {
    try {
      const advancesRef = collection(db, this.advancesCollectionName);
      const q = query(
        advancesRef,
        where('employeeId', '==', employeeId),
        where('month', '==', month)
      );
      const snap = await getDocs(q);
      const advances: SalaryAdvance[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        advances.push({
          id: docSnap.id,
          employeeId: data.employeeId,
          employeeName: data.employeeName,
          month: data.month,
          amount: data.amount,
          note: data.note || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        });
      });
      advances.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return advances;
    } catch (error) {
      console.error('Error getting salary advances:', error);
      throw error;
    }
  }

  // Get salary advances for a month (optionally filtered by employee)
  async getSalaryAdvancesByMonth(month: string, employeeId?: string): Promise<SalaryAdvance[]> {
    try {
      const advancesRef = collection(db, this.advancesCollectionName);
      const constraints = [
        where('month', '==', month),
        ...(employeeId ? [where('employeeId', '==', employeeId)] : []),
      ];
      const q = query(advancesRef, ...constraints);
      const snap = await getDocs(q);
      const advances: SalaryAdvance[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        advances.push({
          id: docSnap.id,
          employeeId: data.employeeId,
          employeeName: data.employeeName,
          month: data.month,
          amount: data.amount,
          note: data.note || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        });
      });
      advances.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return advances;
    } catch (error) {
      console.error('Error getting salary advances by month:', error);
      throw error;
    }
  }

  // Delete salary advance
  async deleteSalaryAdvance(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.advancesCollectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting salary advance:', error);
      throw error;
    }
  }

  // Add or update attendance record
  async addOrUpdateAttendanceRecord(
    employee: Employee,
    payload: {
      date: string;
      status: AttendanceStatus;
      checkInTime?: string | null;
      checkOutTime?: string | null;
      excuseText?: string | null;
      notes?: string | null;
      settings?: AttendanceSettings | null;
    }
  ): Promise<AttendanceRecord> {
    try {
      const {
        date,
        status,
        checkInTime,
        checkOutTime,
        excuseText,
        notes,
        settings,
      } = payload;

      // Check if record exists
      const existingRecord = await this.getAttendanceRecordByEmployeeAndDate(employee.id, date);

      const normalizedStatus: AttendanceStatus =
        status || (checkInTime ? 'present' : 'absent');
      const effectiveSettings = settings || DEFAULT_ATTENDANCE_SETTINGS;
      const dailyWage = getEmployeeDailyWage(employee);
      const effectiveCheckIn = normalizedStatus === 'present' ? checkInTime || null : null;
      const effectiveCheckOut = normalizedStatus === 'present' ? checkOutTime || null : null;

      const delayMinutes =
        normalizedStatus === 'present' && effectiveCheckIn
          ? calculateDelay(effectiveCheckIn, employee.workingHours)
          : 0;
      const hasExcuse = normalizedStatus === 'absent_excused' || !!excuseText;
      const existingWasExcused = existingRecord?.status === 'absent_excused';
      let excuseStatus: ExcuseStatus;
      let excuseResolution: 'no_deduct' | 'hourly' | null =
        existingRecord?.excuseResolution ?? null;

      if (existingRecord) {
        excuseStatus = existingRecord.excuseStatus;

        if (!hasExcuse) {
          excuseStatus = 'rejected';
          excuseResolution = null;
        } else if (!existingRecord.hasExcuse && hasExcuse) {
          excuseStatus = 'pending';
          excuseResolution = null;
        } else if (normalizedStatus === 'absent_excused' && !existingWasExcused) {
          excuseStatus = 'pending';
          excuseResolution = null;
        }
      } else {
        excuseStatus = hasExcuse ? 'pending' : 'rejected';
        excuseResolution = null;
      }

      const shouldApplyDelayDeduction =
        normalizedStatus === 'present' ||
        (normalizedStatus === 'absent_excused' &&
          excuseStatus === 'accepted' &&
          excuseResolution === 'hourly');

      const deduction = shouldApplyDelayDeduction
        ? calculateDelayDeduction(
          delayMinutes,
          excuseStatus,
          employee.monthlySalary,
          employee.monthlyWorkingHours,
          dailyWage
        )
        : { type: 'none' as const, amount: 0 };

      // Calculate overtime
      const overtime =
        normalizedStatus === 'present'
          ? calculateOvertime(
            effectiveCheckIn,
            effectiveCheckOut,
            employee.workingHours,
            employee.monthlySalary,
            employee.monthlyWorkingHours
          )
          : { hours: 0, amount: 0 };

      // Calculate daily net
      const baseImpact = this.calculateBaseImpact(
        normalizedStatus,
        dailyWage,
        effectiveSettings.excusedAbsencePolicy,
        excuseStatus
      );
      const dailyNet = baseImpact - deduction.amount + overtime.amount;

      const recordData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        employeeId: employee.id,
        employeeName: employee.name,
        date,
        checkInTime: effectiveCheckIn,
        checkOutTime: effectiveCheckOut,
        status: normalizedStatus,
        delayMinutes,
        hasExcuse,
        excuseText: excuseText || null,
        excuseStatus,
        deductionType: deduction.type,
        deductionAmount: deduction.amount,
        overtimeHours: overtime.hours,
        overtimeAmount: overtime.amount,
        dailyWage,
        dailyNet,
        excusedAbsencePolicy: effectiveSettings.excusedAbsencePolicy,
        excuseResolution,
        excuseNote: existingRecord?.excuseNote || null,
        notes: notes || null,
      };

      if (existingRecord) {
        // Update existing record
        const docRef = doc(db, this.collectionName, existingRecord.id);
        const payload = {
          ...recordData,
          updatedAt: Timestamp.now(),
        };
        await updateDoc(docRef, payload);

        return {
          ...recordData,
          id: existingRecord.id,
          createdAt: existingRecord.createdAt,
          updatedAt: Timestamp.now().toDate().toISOString(),
        } as AttendanceRecord;
      } else {
        // Create new record
        const attendanceRef = collection(db, this.collectionName);
        const docRef = await addDoc(attendanceRef, {
          ...recordData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        return {
          ...recordData,
          id: docRef.id,
          createdAt: Timestamp.now().toDate().toISOString(),
          updatedAt: Timestamp.now().toDate().toISOString(),
        } as AttendanceRecord;
      }
    } catch (error) {
      console.error('Error adding/updating attendance record:', error);
      throw error;
    }
  }

  // Update excuse status
  async updateExcuseStatus(
    recordId: string,
    status: ExcuseStatus,
    employee: Employee,
    note?: string | null,
    resolution?: 'no_deduct' | 'hourly' | null
  ): Promise<AttendanceRecord> {
    try {
      const docRef = doc(db, this.collectionName, recordId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Attendance record not found');
      }

      const data = docSnap.data() as AttendanceRecord;
      const currentStatus: AttendanceStatus =
        (data.status as AttendanceStatus) || (data.checkInTime ? 'present' : 'absent');
      const dailyWage =
        typeof (data as any).dailyWage === 'number'
          ? data.dailyWage
          : getEmployeeDailyWage(employee);
      const policy: ExcusedAbsencePolicy =
        (data.excusedAbsencePolicy as ExcusedAbsencePolicy) ||
        DEFAULT_ATTENDANCE_SETTINGS.excusedAbsencePolicy;

      let nextResolution: 'no_deduct' | 'hourly' | null =
        typeof resolution !== 'undefined' ? resolution : data.excuseResolution || null;

      if (status !== 'accepted') {
        nextResolution = null;
      } else if (!nextResolution) {
        nextResolution = 'hourly';
      }

      let deduction = { type: 'none' as DeductionType, amount: 0 };
      if (currentStatus === 'present') {
        deduction = calculateDelayDeduction(
          data.delayMinutes,
          status,
          employee.monthlySalary,
          employee.monthlyWorkingHours,
          dailyWage
        );
      } else if (
        currentStatus === 'absent_excused' &&
        status === 'accepted' &&
        nextResolution === 'hourly' &&
        data.delayMinutes > 0
      ) {
        deduction = calculateDelayDeduction(
          data.delayMinutes,
          status,
          employee.monthlySalary,
          employee.monthlyWorkingHours,
          dailyWage
        );
      }

      if (status === 'accepted' && nextResolution === 'no_deduct') {
        deduction = { type: 'none', amount: 0 };
      }

      // Calculate daily net again
      const baseImpact = this.calculateBaseImpact(
        currentStatus,
        dailyWage,
        policy,
        status
      );
      const dailyNet = baseImpact - deduction.amount + (data.overtimeAmount || 0);

      const resolvedNote =
        typeof note === 'undefined'
          ? data.excuseNote ?? null
          : typeof note === 'string' && note.trim().length > 0
            ? note.trim()
            : null;

      await updateDoc(docRef, {
        excuseStatus: status,
        excuseNote: resolvedNote,
        excuseResolution: nextResolution,
        deductionType: deduction.type,
        deductionAmount: deduction.amount,
        dailyWage,
        excusedAbsencePolicy: policy,
        dailyNet,
        updatedAt: Timestamp.now(),
      });

      const updatedRecord = await this.getAttendanceRecordByEmployeeAndDate(employee.id, data.date) as AttendanceRecord;
      return updatedRecord;
    } catch (error) {
      console.error('Error updating excuse status:', error);
      throw error;
    }
  }

  // Get monthly summary for an employee
  async getMonthlySummary(employeeId: string, month: string): Promise<MonthlySummary | null> {
    try {
      const employee = await employeesService.getEmployeeById(employeeId);
      if (!employee) {
        return null;
      }

      // Get all records for the month
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      const records = await this.getAttendanceRecordsByDateRange(startDate, endDate);
      const employeeRecords = records.filter(r => r.employeeId === employeeId);

      const hasDailyWageData = employeeRecords.some(record => record.dailyWage && record.dailyWage > 0);

      if (!hasDailyWageData) {
        let totalDeductions = 0;
        let totalOvertime = 0;
        let attendanceDays = 0;
        let absentDays = 0;
        let totalDelayMinutes = 0;
        let pendingExcuses = 0;
        let acceptedExcuses = 0;
        let rejectedExcuses = 0;

        employeeRecords.forEach(record => {
          if (record.checkInTime) {
            attendanceDays++;
            totalDeductions += record.deductionAmount;
            totalOvertime += record.overtimeAmount;
            totalDelayMinutes += record.delayMinutes;

            if (record.excuseStatus === 'pending') pendingExcuses++;
            else if (record.excuseStatus === 'accepted') acceptedExcuses++;
            else if (record.excuseStatus === 'rejected') rejectedExcuses++;
          } else {
            absentDays++;
          }
        });

        const finalSalary = employee.monthlySalary - totalDeductions + totalOvertime;
        const advances = await this.getSalaryAdvances(employeeId, month);
        const totalAdvances = advances.reduce((sum, adv) => sum + (adv.amount || 0), 0);
        const netSalaryAfterAdvances = finalSalary - totalAdvances;

        return {
          employeeId,
          employeeName: employee.name,
          month,
          baseSalary: employee.monthlySalary,
          totalDeductions,
          totalOvertime,
          finalSalary,
          totalAdvances,
          netSalaryAfterAdvances,
          attendanceDays,
          absentDays,
          excusedAbsentDays: 0,
          recordedDays: employeeRecords.length,
          totalDelayMinutes,
          pendingExcuses,
          acceptedExcuses,
          rejectedExcuses,
        };
      }

      let totalDeductions = 0;
      let totalOvertime = 0;
      let presentDays = 0;
      let absentDays = 0;
      let excusedAbsentDays = 0;
      let totalDelayMinutes = 0;
      let pendingExcuses = 0;
      let acceptedExcuses = 0;
      let rejectedExcuses = 0;
      let finalSalary = 0;
      let totalAdvances = 0;

      employeeRecords.forEach(record => {
        finalSalary += record.dailyNet || 0;

        if (record.status === 'present') {
          presentDays++;
          totalDeductions += record.deductionAmount;
          totalOvertime += record.overtimeAmount;
          totalDelayMinutes += record.delayMinutes;
        } else if (record.status === 'absent') {
          absentDays++;
          totalDeductions += record.dailyWage;
        } else if (record.status === 'absent_excused') {
          if (record.excuseStatus === 'accepted') {
            excusedAbsentDays++;
          } else if (record.excuseStatus === 'rejected') {
            absentDays++;
            totalDeductions += record.dailyWage;
          }
        }

        if (record.hasExcuse) {
          if (record.excuseStatus === 'pending') pendingExcuses++;
          else if (record.excuseStatus === 'accepted') acceptedExcuses++;
          else if (record.excuseStatus === 'rejected') rejectedExcuses++;
        }
      });

      const advances = await this.getSalaryAdvances(employeeId, month);
      totalAdvances = advances.reduce((sum, adv) => sum + (adv.amount || 0), 0);
      const netSalaryAfterAdvances = finalSalary - totalAdvances;

      return {
        employeeId,
        employeeName: employee.name,
        month,
        baseSalary: employee.monthlySalary,
        totalDeductions,
        totalOvertime,
        finalSalary,
        totalAdvances,
        netSalaryAfterAdvances,
        attendanceDays: presentDays,
        absentDays,
        excusedAbsentDays,
        recordedDays: employeeRecords.length,
        totalDelayMinutes,
        pendingExcuses,
        acceptedExcuses,
        rejectedExcuses,
      };
    } catch (error) {
      console.error('Error getting monthly summary:', error);
      throw error;
    }
  }

  private async getMonthlySummaryFromArchive(employeeId: string, month: string): Promise<MonthlySummary | null> {
    try {
      const docId = this.getSummaryDocId(employeeId, month);
      const docRef = doc(db, this.summaryCollectionName, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        ...(data as MonthlySummary),
        generatedAt: data.generatedAt?.toDate?.()?.toISOString() || data.generatedAt,
      };
    } catch (error) {
      console.error('Error getting archived summary:', error);
      throw error;
    }
  }

  async saveMonthlySummary(employeeId: string, month: string): Promise<void> {
    try {
      const summary = await this.getMonthlySummary(employeeId, month);
      if (!summary) return;

      const docId = this.getSummaryDocId(employeeId, month);
      const docRef = doc(db, this.summaryCollectionName, docId);
      await setDoc(docRef, {
        ...summary,
        generatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving monthly summary:', error);
      throw error;
    }
  }

  async getMonthlySummaryWithArchive(employeeId: string, month: string): Promise<MonthlySummary | null> {
    try {
      const liveSummary = await this.getMonthlySummary(employeeId, month);
      const currentMonth = new Date().toISOString().slice(0, 7);

      if (
        liveSummary &&
        (
          month === currentMonth ||
          (liveSummary.recordedDays ?? 0) > 0
        )
      ) {
        return liveSummary;
      }

      const archived = await this.getMonthlySummaryFromArchive(employeeId, month);
      return archived || liveSummary;
    } catch (error) {
      console.error('Error getting monthly summary with archive:', error);
      throw error;
    }
  }

  // Delete attendance record
  async deleteAttendanceRecord(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      throw error;
    }
  }
}

// Create and export the attendance service instance
export const attendanceService = new FirebaseAttendanceService();

export class FirebaseAttendanceSettingsService {
  private collectionName = 'attendance_settings';
  private docId = 'general';

  async getSettings(): Promise<AttendanceSettings> {
    try {
      const docRef = doc(db, this.collectionName, this.docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, DEFAULT_ATTENDANCE_SETTINGS);
        return DEFAULT_ATTENDANCE_SETTINGS;
      }

      const data = docSnap.data() as Partial<AttendanceSettings>;
      return {
        ...DEFAULT_ATTENDANCE_SETTINGS,
        ...data,
      };
    } catch (error) {
      console.error('Error getting attendance settings:', error);
      return DEFAULT_ATTENDANCE_SETTINGS;
    }
  }

  async updateSettings(update: Partial<AttendanceSettings>): Promise<AttendanceSettings> {
    try {
      const docRef = doc(db, this.collectionName, this.docId);
      await setDoc(docRef, update, { merge: true });
      return this.getSettings();
    } catch (error) {
      console.error('Error updating attendance settings:', error);
      throw error;
    }
  }
}

// Add function to clear analytics data
export const clearAllAnalyticsData = async (): Promise<void> => {
  try {
    const collectionsToClear = ['page_views', 'visitor_sessions', 'page_interactions', 'daily_stats', 'page_stats'];
    for (const collName of collectionsToClear) {
      const collRef = collection(db, collName);
      const snap = await getDocs(collRef);
      // Batch deletes in sets of 500 would be preferred for large sets, 
      // but simple promise all is sufficient for typical sized sets being cleared often
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    }
  } catch (error) {
    console.error('Error clearing analytics data:', error);
    throw error;
  }
};

// Add function to clear profit data (orders from firebase)
export const clearAllProfitData = async (): Promise<void> => {
  try {
    const ordersRef = collection(db, 'orders');
    const snap = await getDocs(ordersRef);
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing profit data:', error);
    throw error;
  }
};
export const attendanceSettingsService = new FirebaseAttendanceSettingsService();

export default app;