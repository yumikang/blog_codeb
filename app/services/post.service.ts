import { dbHelpers } from '~/lib/supabase.server';
import type { PostWithSubdomain } from '~/types/database';
import { logger } from '~/utils/logger.server';
import { withServiceHandler, withArrayServiceHandler } from '~/utils/service-helpers';

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
    
    return withArrayServiceHandler(
      'PostService',
      'getPosts',
      { subdomain, limit, offset },
      () => dbHelpers.getPosts(subdomain, limit, offset)
    );
  }

  /**
   * Get a single post by subdomain and slug
   */
  static async getPost(subdomain: string, slug: string) {
    return withServiceHandler(
      'PostService',
      'getPost',
      { subdomain, slug },
      async () => {
        const post = await dbHelpers.getPost(subdomain, slug);
        if (!post) {
          throw new Error('Post not found');
        }
        return post;
      }
    );
  }

  /**
   * Get featured posts for homepage
   */
  static async getFeaturedPosts(limit: number = 3) {
    return withArrayServiceHandler(
      'PostService',
      'getFeaturedPosts',
      { limit },
      () => dbHelpers.getPosts(undefined, limit, 0)
    );
  }

  /**
   * Search posts by query
   */
  static async searchPosts(query: string, limit: number = 10, offset: number = 0) {
    return withArrayServiceHandler(
      'PostService',
      'searchPosts',
      { query, limit, offset },
      async () => {
        const { data, error } = await dbHelpers.admin.searchPosts(query, limit, offset);
        if (error) throw error;
        return data || [];
      }
    );
  }

  /**
   * Get posts by tag
   */
  static async getPostsByTag(tag: string, limit: number = 10, offset: number = 0) {
    return withArrayServiceHandler(
      'PostService',
      'getPostsByTag',
      { tag, limit, offset },
      async () => {
        const { data, error } = await dbHelpers.admin.getPostsByTag(tag, limit, offset);
        if (error) throw error;
        return data || [];
      }
    );
  }

  /**
   * Increment view count for a post
   */
  static async incrementViewCount(postId: string) {
    return withServiceHandler(
      'PostService',
      'incrementViewCount',
      { postId },
      async () => {
        // Run asynchronously without waiting for result
        setImmediate(async () => {
          try {
            await dbHelpers.admin.incrementPostViews(postId);
          } catch (error) {
            logger.error('Failed to increment view count', error, {
              service: 'PostService',
              operation: 'incrementViewCount',
              postId
            });
          }
        });
        return true;
      }
    );
  }
}