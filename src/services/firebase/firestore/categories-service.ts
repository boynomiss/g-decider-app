/**
 * Categories Service
 * 
 * Handles CRUD operations for place categories
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase-config';
import type { Category } from '../../../features/discovery/types/featured-place-types';

export class CategoriesService {
  private readonly collectionName = 'categories';

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('active', '==', true),
        orderBy('sort_order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Failed to get categories');
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const docRef = doc(db, this.collectionName, categoryId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Category;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting category:', error);
      throw new Error('Failed to get category');
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: Omit<Category, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), categoryData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Update a category
   */
  async updateCategory(categoryId: string, updateData: Partial<Category>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, categoryId);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, categoryId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  /**
   * Get subcategories for a category
   */
  async getSubcategories(categoryId: string): Promise<string[]> {
    try {
      const category = await this.getCategoryById(categoryId);
      return category?.subcategories || [];
    } catch (error) {
      console.error('Error getting subcategories:', error);
      return [];
    }
  }

  /**
   * Seed default categories
   */
  async seedDefaultCategories(): Promise<void> {
    try {
      const defaultCategories = [
        {
          name: "Restaurants",
          subcategories: ["filipino", "japanese", "italian", "chinese", "korean", "american", "fusion", "cafe", "bakery", "street_food"],
          icon: "🍽️",
          active: true,
          description: "Places to eat and dine",
          sort_order: 1
        },
        {
          name: "Activities",
          subcategories: ["adventure", "cultural", "entertainment", "sports", "wellness", "shopping", "nightlife", "family"],
          icon: "🎯",
          active: true,
          description: "Things to do and experience",
          sort_order: 2
        },
        {
          name: "Something New",
          subcategories: ["recently_opened", "trending", "hidden_gem", "unique_experience"],
          icon: "✨",
          active: true,
          description: "Discover new and trending places",
          sort_order: 3
        }
      ];

      for (const category of defaultCategories) {
        await this.createCategory(category);
      }
    } catch (error) {
      console.error('Error seeding default categories:', error);
      throw new Error('Failed to seed default categories');
    }
  }
}

export const categoriesService = new CategoriesService();
