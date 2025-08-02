import { dbHelpers, supabaseServer } from '~/lib/supabase.server';
import type { Comment } from '~/types/database';
import { validateComment, sanitizeHtml } from '~/utils/validation';
import { logger } from '~/utils/logger.server';
import { withServiceHandler, withArrayServiceHandler } from '~/utils/service-helpers';

export class CommentService {
  /**
   * Get approved comments for a post
   */
  static async getPostComments(postId: string) {
    return withArrayServiceHandler(
      'CommentService',
      'getPostComments',
      { postId },
      () => dbHelpers.getComments(postId)
    );
  }

  /**
   * Submit a new comment (requires authentication)
   */
  static async submitComment(data: {
    postId: string;
    userId: string;
    content: string;
    parentId?: string;
  }) {
    // Validate comment content
    const validation = validateComment(data.content);
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.error 
      };
    }

    return withServiceHandler(
      'CommentService',
      'submitComment',
      { postId: data.postId, userId: data.userId },
      async () => {
        // Sanitize content to prevent XSS
        const sanitizedContent = sanitizeHtml(data.content.trim());

        // Insert comment with pending status
        const { data: comment, error } = await supabaseServer
          .from('comments')
          .insert({
            post_id: data.postId,
            user_id: data.userId,
            content: sanitizedContent,
            parent_id: data.parentId,
            status: 'pending' // Comments require approval
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return comment;
      }
    );
  }

  /**
   * Report a comment for moderation
   */
  static async reportComment(commentId: string, reason: string) {
    return withServiceHandler(
      'CommentService',
      'reportComment',
      { commentId, reason },
      async () => {
        // TODO: Implement comment reporting
        // Should create a moderation entry in the database
        return { message: 'Comment reported successfully' };
      }
    );
  }

  /**
   * Get comment count for a post
   */
  static async getCommentCount(postId: string): Promise<number> {
    const result = await withServiceHandler(
      'CommentService',
      'getCommentCount',
      { postId },
      async () => {
        const { count, error } = await supabaseServer
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId)
          .eq('status', 'approved');

        if (error) throw error;
        
        return count || 0;
      }
    );
    
    return result.success ? (result.data || 0) : 0;
  }
}