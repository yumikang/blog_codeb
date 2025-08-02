import { dbHelpers } from '~/lib/supabase.server';
import type { Subdomain } from '~/types/database';

export class SubdomainService {
  private static subdomainCache: Map<string, { data: Subdomain[]; timestamp: number }> = new Map();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all active subdomains with caching
   */
  static async getActiveSubdomains(): Promise<{ success: boolean; data: Subdomain[]; fromCache?: boolean }> {
    try {
      // Check cache first
      const cached = this.subdomainCache.get('active');
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return { 
          success: true, 
          data: cached.data,
          fromCache: true 
        };
      }

      // Fetch from database
      const subdomains = await dbHelpers.getSubdomains();
      
      // Update cache
      this.subdomainCache.set('active', {
        data: subdomains || [],
        timestamp: Date.now()
      });

      return { 
        success: true, 
        data: subdomains || [] 
      };
    } catch (error) {
      console.error('SubdomainService.getActiveSubdomains error:', error);
      
      // If error, try to return cached data even if stale
      const cached = this.subdomainCache.get('active');
      if (cached) {
        return { 
          success: true, 
          data: cached.data,
          fromCache: true 
        };
      }

      return { 
        success: false, 
        data: [] 
      };
    }
  }

  /**
   * Get subdomain by name
   */
  static async getSubdomainByName(name: string): Promise<{ success: boolean; data: Subdomain | null }> {
    try {
      const { data: subdomains } = await this.getActiveSubdomains();
      const subdomain = subdomains.find(s => s.name === name) || null;
      
      return { 
        success: true, 
        data: subdomain 
      };
    } catch (error) {
      console.error('SubdomainService.getSubdomainByName error:', error);
      return { 
        success: false, 
        data: null 
      };
    }
  }

  /**
   * Validate if subdomain exists and is active
   */
  static async validateSubdomain(name: string): Promise<boolean> {
    const { data } = await this.getSubdomainByName(name);
    return data !== null && data.is_active;
  }

  /**
   * Clear subdomain cache
   */
  static clearCache() {
    this.subdomainCache.clear();
  }
}