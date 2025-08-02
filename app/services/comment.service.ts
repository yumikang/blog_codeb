import { dbHelpers, supabaseServer } from '~/lib/supabase.server';
import type { Comment } from '~/types/database';
import { validateComment, sanitizeHtml } from '~/utils/validation';

export class CommentService {
  /**
   * Get approved comments for a post
   */
  static async getPostComments(postId: string) {
    try {
      const comments = await dbHelpers.getComments(postId);
      return { 
        success: true, 
        data: comments || [] 
      };
    } catch (error) {
      console.error('CommentService.getPostComments error:', error);
      return { 
        success: false, 
        error: 'Failed to fetch comments',
        data: [] 
      };
    }
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
    try {
      // Validate comment content
      const validation = validateComment(data.content);
      if (!validation.valid) {
        return { 
          success: false, 
          error: validation.error 
        };
      }

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

      return { 
        success: true, 
        data: comment,
        message: 'Comment submitted for approval' 
      };
    } catch (error) {
      console.error('CommentService.submitComment error:', error);
      return { 
        success: false, 
        error: 'Failed to submit comment' 
      };
    }
  }

  /**
   * Report a comment for moderation
   */
  static async reportComment(commentId: string, reason: string) {
    try {
      // TODO: Implement comment reporting
      // Should create a moderation entry in the database
      return { 
        success: true,
        message: 'Comment reported successfully' 
      };
    } catch (error) {
      console.error('CommentService.reportComment error:', error);
      return { 
        success: false, 
        error: 'Failed to report comment' 
      };
    }
  }

  /**
   * Get comment count for a post
   */
  static async getCommentCount(postId: string): Promise<number> {
    try {
      const { count, error } = await supabaseServer
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('status', 'approved');

      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('CommentService.getCommentCount error:', error);
      return 0;
    }
  }
}