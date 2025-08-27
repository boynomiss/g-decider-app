/**
 * Admin Service
 * 
 * Handles admin user management and permissions
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
  where 
} from 'firebase/firestore';
import { db } from './firebase-config';
import type { AdminUser } from '../../../features/discovery/types/featured-place-types';

export class AdminService {
  private readonly collectionName = 'admin_users';

  /**
   * Get admin user by ID
   */
  async getAdminUser(userId: string): Promise<AdminUser | null> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as AdminUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting admin user:', error);
      throw new Error('Failed to get admin user');
    }
  }

  /**
   * Get admin user by email
   */
  async getAdminUserByEmail(email: string): Promise<AdminUser | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', email),
        where('active', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as AdminUser;
    } catch (error) {
      console.error('Error getting admin user by email:', error);
      throw new Error('Failed to get admin user by email');
    }
  }

  /**
   * Create a new admin user
   */
  async createAdminUser(adminData: Omit<AdminUser, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), adminData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw new Error('Failed to create admin user');
    }
  }

  /**
   * Update admin user
   */
  async updateAdminUser(userId: string, updateData: Partial<AdminUser>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating admin user:', error);
      throw new Error('Failed to update admin user');
    }
  }

  /**
   * Delete admin user
   */
  async deleteAdminUser(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting admin user:', error);
      throw new Error('Failed to delete admin user');
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const adminUser = await this.getAdminUser(userId);
      if (!adminUser || !adminUser.active) {
        return false;
      }
      
      return adminUser.permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has role
   */
  async hasRole(userId: string, role: AdminUser['role']): Promise<boolean> {
    try {
      const adminUser = await this.getAdminUser(userId);
      if (!adminUser || !adminUser.active) {
        return false;
      }
      
      return adminUser.role === role;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.updateAdminUser(userId, {
        last_login: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for login tracking
    }
  }

  /**
   * Get all admin users
   */
  async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('active', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminUser[];
    } catch (error) {
      console.error('Error getting all admin users:', error);
      throw new Error('Failed to get admin users');
    }
  }

  /**
   * Seed default admin user
   */
  async seedDefaultAdmin(): Promise<void> {
    try {
      const defaultAdmin: Omit<AdminUser, 'id'> = {
        email: 'admin@discovery-app-ph.com',
        role: 'super_admin',
        permissions: ['create', 'edit', 'delete', 'analytics', 'manage_users'],
        created_at: new Date().toISOString(),
        last_login: null,
        active: true
      };
      
      await this.createAdminUser(defaultAdmin);
    } catch (error) {
      console.error('Error seeding default admin:', error);
      throw new Error('Failed to seed default admin');
    }
  }

  /**
   * Validate admin credentials
   */
  async validateAdminCredentials(email: string, password: string): Promise<AdminUser | null> {
    try {
      // Note: This is a basic implementation
      // In production, you'd want to use Firebase Auth or similar
      const adminUser = await this.getAdminUserByEmail(email);
      
      if (!adminUser) {
        return null;
      }
      
      // For now, just return the user if email matches
      // In production, implement proper password hashing and verification
      return adminUser;
    } catch (error) {
      console.error('Error validating admin credentials:', error);
      return null;
    }
  }
}

export const adminService = new AdminService();
