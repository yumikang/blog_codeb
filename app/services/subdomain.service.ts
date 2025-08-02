import { dbHelpers } from '~/lib/supabase.server';
import type { Subdomain } from '~/types/database';
import { logger } from '~/utils/logger.server';
import { withServiceHandler, withArrayServiceHandler } from '~/utils/service-helpers';

export class SubdomainService {
  private static subdomainCache: Map<string, { data: Subdomain[]; timestamp: number }> = new Map();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all active subdomains with caching
   */
  static async getActiveSubdomains(): Promise<{ success: boolean; data: Subdomain[]; fromCache?: boolean }> {
    // Check cache first
    const cached = this.subdomainCache.get('active');
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { 
        success: true, 
        data: cached.data,
        fromCache: true 
      };
    }

    const result = await withArrayServiceHandler(
      'SubdomainService',
      'getActiveSubdomains',
      {},
      async () => {
        const subdomains = await dbHelpers.getSubdomains();
        
        // Update cache
        this.subdomainCache.set('active', {
          data: subdomains || [],
          timestamp: Date.now()
        });

        return subdomains || [];
      }
    );

    // If error, try to return cached data even if stale
    if (!result.success && cached) {
      return { 
        success: true, 
        data: cached.data,
        fromCache: true 
      };
    }

    return result;
  }

  /**
   * Get subdomain by name
   */
  static async getSubdomainByName(name: string): Promise<{ success: boolean; data: Subdomain | null }> {
    return withServiceHandler(
      'SubdomainService',
      'getSubdomainByName',
      { name },
      async () => {
        const { data: subdomains } = await this.getActiveSubdomains();
        const subdomain = subdomains.find(s => s.name === name) || null;
        return subdomain;
      }
    );
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