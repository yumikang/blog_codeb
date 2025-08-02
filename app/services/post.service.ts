import { dbHelpers } from '~/lib/supabase.server';
import type { PostWithSubdomain } from '~/types/database';

export class PostService {
  /**
   * Get posts with pagination and optional subdomain filtering
   */
  static async getPosts(options: {
    subdomain?: string;
    limit?: number;
    offset?: number;
  }) {
    const { subdomain, limit = 10, offset = 0 } = options;
    
    try {
      const posts = await dbHelpers.getPosts(subdomain, limit, offset);
      return { success: true, data: posts };
    } catch (error) {
      console.error('PostService.getPosts error:', error);
      return { 
        success: false, 
        error: 'Failed to fetch posts',
        data: [] 
      };
    }
  }

  /**
   * Get a single post by subdomain and slug
   */
  static async getPost(subdomain: string, slug: string) {
    try {
      const post = await dbHelpers.getPost(subdomain, slug);
      
      if (!post) {
        return { 
          success: false, 
          error: 'Post not found',
          data: null 
        };
      }
      
      return { success: true, data: post };
    } catch (error) {
      console.error('PostService.getPost error:', error);
      return { 
        success: false, 
        error: 'Failed to fetch post',
        data: null 
      };
    }
  }

  /**
   * Get featured posts for homepage
   */
  static async getFeaturedPosts(limit: number = 3) {
    try {
      const posts = await dbHelpers.getPosts(undefined, limit, 0);
      return { success: true, data: posts };
    } catch (error) {
      console.error('PostService.getFeaturedPosts error:', error);
      return { 
        success: false, 
        error: 'Failed to fetch featured posts',
        data: [] 
      };
    }
  }

  /**
   * Search posts by query
   */
  static async searchPosts(query: string, limit: number = 10) {
    // TODO: Implement full-text search
    // For now, return empty results
    return { 
      success: true, 
      data: [],
      message: 'Search functionality not yet implemented' 
    };
  }

  /**
   * Get posts by tag
   */
  static async getPostsByTag(tag: string, limit: number = 10, offset: number = 0) {
    // TODO: Implement tag-based filtering
    // For now, return empty results
    return { 
      success: true, 
      data: [],
      message: 'Tag filtering not yet implemented' 
    };
  }

  /**
   * Increment view count for a post
   */
  static async incrementViewCount(postId: string) {
    // TODO: Implement view count increment
    // Should be done asynchronously to not block page load
    return { success: true };
  }
}