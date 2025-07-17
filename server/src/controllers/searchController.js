import { pool as db } from '../database.js';
import HttpError from '../utils/errorUtils.js';

export const searchAll = async (req, res, next) => {
  try {
    const { q: query, type = 'all' } = req.query;
    const userID = req.user?.id || null;
    
    if (!query || query.trim().length === 0) {
      return res.json([]);
    }

    const searchTerm = `%${query.trim()}%`;
    const results = [];

    // Search users (people)
    if (type === 'all' || type === 'people') {
      const userResults = await db.query(`
        SELECT 
          'person' as type,
          u.id,
          u.display_name,
          u.username,
          u.avatar_color
        FROM "user" u
        WHERE (u.display_name ILIKE $1 OR u.username ILIKE $1)
        ORDER BY u.display_name
        LIMIT 10
      `, [searchTerm]);
      
      results.push(...userResults.rows);
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const postResults = await db.query(`
        SELECT 
          'post' as type,
          p.id,
          p.content,
          p.created_at,
          u.display_name,
          u.username,
          u.avatar_color,
          COALESCE((
            SELECT COUNT(*)
            FROM post_like pl_all
            WHERE pl_all.post_id = p.id
          ), 0) AS total_likes,
          (
            SELECT COUNT(*)
            FROM comment AS replies
            WHERE replies.post_id = p.id AND replies.is_deleted = false
          ) AS total_replies,
          EXISTS (
            SELECT 1
            FROM post_like pl_user
            WHERE pl_user.post_id = p.id AND pl_user.user_id = $2
          ) AS liked
        FROM post p
        JOIN "user" u ON u.id = p.user_id
        WHERE (p.content ILIKE $1 OR u.display_name ILIKE $1 OR u.username ILIKE $1)
        AND p.is_deleted = false
        ORDER BY p.created_at DESC
        LIMIT 10
      `, [searchTerm, userID]);
      
      results.push(...postResults.rows);
    }

    // Search jobs
    if (type === 'all' || type === 'jobs') {
      const jobResults = await db.query(`
        SELECT 
          'job' as type,
          j.id,
          j.title,
          j.description as content,
          j.category,
          j.location,
          j.commitment,
          j.created_at
        FROM jobs j
        WHERE (j.title ILIKE $1 OR j.description ILIKE $1 OR j.category ILIKE $1 OR j.location ILIKE $1)
        ORDER BY j.created_at DESC
        LIMIT 10
      `, [searchTerm]);
      
      results.push(...jobResults.rows);
    }

    // Sort all results by relevance/date
    results.sort((a, b) => {
      if (a.created_at && b.created_at) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

    res.json(results);
  } catch (err) {
    next(new HttpError(500, `Search failed: ${err.message}`));
  }
}; 