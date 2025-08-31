/**
 * Analytics Service
 * 
 * Handles analytics data for featured places
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { getDb } from '../lazy-firebase';
import type { AnalyticsData, PlaceAnalytics, AnalyticsQuery } from '../../../features/discovery/types/featured-place-types';

export class AnalyticsService {
  private readonly collectionName = 'analytics';

  /**
   * Record an impression for a featured place
   */
  async recordImpression(placeId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const analyticsId = `daily_stats_${today}`;
      
      // Try to get existing analytics for today
      const docRef = doc(db, this.collectionName, analyticsId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Update existing analytics
        const data = docSnap.data() as AnalyticsData;
        const partnerPerformance = data.partner_performance || {};
        
        if (!partnerPerformance[placeId]) {
          partnerPerformance[placeId] = {
            impressions: 0,
            swipe_right: 0,
            swipe_left: 0,
            profile_views: 0
          };
        }
        
        partnerPerformance[placeId].impressions += 1;
        
        await updateDoc(docRef, {
          total_impressions: data.total_impressions + 1,
          featured_impressions: data.featured_impressions + 1,
          partner_performance: partnerPerformance,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new analytics for today
        const newAnalytics: Omit<AnalyticsData, 'id'> = {
          date: today,
          total_impressions: 1,
          total_swipes: 0,
          featured_impressions: 1,
          partner_performance: {
            [placeId]: {
              impressions: 1,
              swipe_right: 0,
              swipe_left: 0,
              profile_views: 0
            }
          },
          created_at: new Date().toISOString()
        };
        
        await addDoc(collection(db, this.collectionName), newAnalytics);
      }
    } catch (error) {
      console.error('Error recording impression:', error);
      // Don't throw error for analytics - shouldn't break user experience
    }
  }

  /**
   * Record a swipe action for a featured place
   */
  async recordSwipe(placeId: string, direction: 'right' | 'left'): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const analyticsId = `daily_stats_${today}`;
      
      const docRef = doc(db, this.collectionName, analyticsId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as AnalyticsData;
        const partnerPerformance = data.partner_performance || {};
        
        if (!partnerPerformance[placeId]) {
          partnerPerformance[placeId] = {
            impressions: 0,
            swipe_right: 0,
            swipe_left: 0,
            profile_views: 0
          };
        }
        
        if (direction === 'right') {
          partnerPerformance[placeId].swipe_right += 1;
        } else {
          partnerPerformance[placeId].swipe_left += 1;
        }
        
        await updateDoc(docRef, {
          total_swipes: data.total_swipes + 1,
          partner_performance: partnerPerformance,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  }

  /**
   * Record a profile view for a featured place
   */
  async recordProfileView(placeId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const analyticsId = `daily_stats_${today}`;
      
      const docRef = doc(db, this.collectionName, analyticsId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as AnalyticsData;
        const partnerPerformance = data.partner_performance || {};
        
        if (!partnerPerformance[placeId]) {
          partnerPerformance[placeId] = {
            impressions: 0,
            swipe_right: 0,
            swipe_left: 0,
            profile_views: 0
          };
        }
        
        partnerPerformance[placeId].profile_views += 1;
        
        await updateDoc(docRef, {
          partner_performance: partnerPerformance,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error recording profile view:', error);
    }
  }

  /**
   * Get analytics for a specific date range
   */
  async getAnalytics(query: AnalyticsQuery): Promise<AnalyticsData[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('date', '>=', query.start_date),
        where('date', '<=', query.end_date),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnalyticsData[];
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  /**
   * Get place performance analytics
   */
  async getPlaceAnalytics(placeId: string, days: number = 30): Promise<PlaceAnalytics | null> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const analytics = await this.getAnalytics({
        start_date: startDate,
        end_date: endDate
      });
      
      let totalImpressions = 0;
      let totalSwipeRight = 0;
      let totalSwipeLeft = 0;
      let totalProfileViews = 0;
      
      analytics.forEach(day => {
        const placeData = day.partner_performance[placeId];
        if (placeData) {
          totalImpressions += placeData.impressions;
          totalSwipeRight += placeData.swipe_right;
          totalSwipeLeft += placeData.swipe_left;
          totalProfileViews += placeData.profile_views;
        }
      });
      
      const totalSwipes = totalSwipeRight + totalSwipeLeft;
      const conversionRate = totalImpressions > 0 ? (totalSwipes / totalImpressions) * 100 : 0;
      const performanceScore = totalImpressions > 0 ? 
        ((totalSwipeRight * 2) + totalProfileViews) / totalImpressions * 100 : 0;
      
      return {
        place_id: placeId,
        place_name: '', // Would need to fetch from places collection
        impressions: totalImpressions,
        swipe_right: totalSwipeRight,
        swipe_left: totalSwipeLeft,
        profile_views: totalProfileViews,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        performance_score: Math.round(performanceScore * 100) / 100
      };
    } catch (error) {
      console.error('Error getting place analytics:', error);
      return null;
    }
  }

  /**
   * Get top performing places
   */
  async getTopPerformingPlaces(limit: number = 10): Promise<PlaceAnalytics[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const analytics = await this.getAnalytics({
        start_date: yesterday,
        end_date: today
      });
      
      const placePerformance: Record<string, PlaceAnalytics> = {};
      
      analytics.forEach(day => {
        Object.entries(day.partner_performance).forEach(([placeId, data]) => {
          if (!placePerformance[placeId]) {
            placePerformance[placeId] = {
              place_id: placeId,
              place_name: '',
              impressions: 0,
              swipe_right: 0,
              swipe_left: 0,
              profile_views: 0,
              conversion_rate: 0,
              performance_score: 0
            };
          }
          
          placePerformance[placeId].impressions += data.impressions;
          placePerformance[placeId].swipe_right += data.swipe_right;
          placePerformance[placeId].swipe_left += data.swipe_left;
          placePerformance[placeId].profile_views += data.profile_views;
        });
      });
      
      // Calculate scores and sort
      const places = Object.values(placePerformance).map(place => {
        const totalSwipes = place.swipe_right + place.swipe_left;
        place.conversion_rate = place.impressions > 0 ? 
          (totalSwipes / place.impressions) * 100 : 0;
        place.performance_score = place.impressions > 0 ? 
          ((place.swipe_right * 2) + place.profile_views) / place.impressions * 100 : 0;
        return place;
      });
      
      return places
        .sort((a, b) => b.performance_score - a.performance_score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top performing places:', error);
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService();
