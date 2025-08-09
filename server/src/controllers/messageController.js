import {pool as db} from '../database.js'
import HttpError from '../utils/errorUtils.js'

const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES_LIMIT = 50;

export const getConversations = async (req, res, next) => {
  const userID = req.user.id;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  try {
    // Get unique conversations with last message info
    const result = await db.query(`
      WITH conversation_summaries AS (
        SELECT 
          CASE 
            WHEN sender_id = $1 THEN receiver_id 
            ELSE sender_id 
          END as other_user_id,
          MAX(created_at) as last_message_at,
          COUNT(*) as total_messages,
          COUNT(CASE WHEN receiver_id = $1 AND is_read = false THEN 1 END) as unread_count
        FROM messages 
        WHERE sender_id = $1 OR receiver_id = $1
        GROUP BY other_user_id
      )
      SELECT 
        cs.*,
        u.username,
        u.display_name,
        u.avatar_color,
        (
          SELECT content 
          FROM messages 
          WHERE (sender_id = $1 AND receiver_id = cs.other_user_id) 
             OR (sender_id = cs.other_user_id AND receiver_id = $1)
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message_content
      FROM conversation_summaries cs
      JOIN "user" u ON u.id = cs.other_user_id
      ORDER BY cs.last_message_at DESC
      LIMIT $2 OFFSET $3
    `, [userID, limit, offset]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    return next(new HttpError("Failed to fetch conversations", 500));
  }
};

export const getMessages = async (req, res, next) => {
  const userID = req.user.id;
  const otherUserID = parseInt(req.params.userId);
  const limit = Math.min(parseInt(req.query.limit) || MAX_MESSAGES_LIMIT, MAX_MESSAGES_LIMIT);
  const offset = parseInt(req.query.offset) || 0;

  if (!otherUserID) {
    return next(new HttpError("User ID is required", 400));
  }

  try {
    // Get messages between the two users
    const result = await db.query(`
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.is_read,
        m.sender_id,
        u.username,
        u.display_name,
        u.avatar_color
      FROM messages m
      JOIN "user" u ON u.id = m.sender_id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
      LIMIT $3 OFFSET $4
    `, [userID, otherUserID, limit, offset]);

    // Mark messages as read if they were sent to current user
    if (result.rows.length > 0) {
      await db.query(`
        UPDATE messages 
        SET is_read = true 
        WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
      `, [otherUserID, userID]);
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    return next(new HttpError("Failed to fetch messages", 500));
  }
};

export const sendMessage = async (req, res, next) => {
  const senderID = req.user.id;
  const { receiverId, content } = req.body;

  if (!content || !content.trim()) {
    return next(new HttpError("Message content is required", 400));
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    return next(new HttpError("Message too long", 400));
  }

  if (!receiverId) {
    return next(new HttpError("Receiver ID is required", 400));
  }

  if (senderID === receiverId) {
    return next(new HttpError("Cannot send message to yourself", 400));
  }

  try {
    // Check if receiver exists
    const userCheck = await db.query('SELECT id FROM "user" WHERE id = $1', [receiverId]);
    if (userCheck.rows.length === 0) {
      return next(new HttpError("Receiver not found", 404));
    }

    const result = await db.query(`
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at, sender_id, receiver_id, is_read
    `, [senderID, receiverId, content.trim()]);

    // Get sender info for response
    const senderInfo = await db.query(`
      SELECT username, display_name, avatar_color 
      FROM "user" 
      WHERE id = $1
    `, [senderID]);

    const message = {
      ...result.rows[0],
      ...senderInfo.rows[0]
    };

    return res.status(201).json(message);
  } catch (err) {
    console.error("DB Error:", err.message);
    return next(new HttpError("Failed to send message", 500));
  }
};

export const searchUsers = async (req, res, next) => {
  const userID = req.user.id;
  const { q: query } = req.query;

  if (!query || !query.trim()) {
    return next(new HttpError("Search query is required", 400));
  }

  try {
    // Search for users by username or display name, excluding current user
    const result = await db.query(`
      SELECT 
        id,
        username,
        display_name,
        avatar_color
      FROM "user"
      WHERE id != $1 
        AND (username ILIKE $2 OR display_name ILIKE $2)
      ORDER BY 
        CASE 
          WHEN username ILIKE $2 THEN 1
          WHEN display_name ILIKE $2 THEN 2
          ELSE 3
        END,
        username
      LIMIT 10
    `, [userID, `%${query.trim()}%`]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    return next(new HttpError("Failed to search users", 500));
  }
};

export const deleteMessage = async (req, res, next) => {
  const userID = req.user.id;
  const messageID = parseInt(req.params.messageId);

  try {
    const result = await db.query(`
      DELETE FROM messages 
      WHERE id = $1 AND sender_id = $2
      RETURNING id
    `, [messageID, userID]);

    if (result.rows.length === 0) {
      return next(new HttpError("Message not found or unauthorized", 404));
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("DB Error:", err.message);
    return next(new HttpError("Failed to delete message", 500));
  }
}; 