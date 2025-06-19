// id = ParentID
export interface PostData {
  id: number;
  username: string;
  content: string;
  created_at: string;
  display_name: string;
  liked: boolean;
  total_likes: number;
}

// id = CommentID
// parentID can be post or comment
export interface CommentData {
  id: number;
  username: string;
  content: string;
  created_at: string;
  display_name: string;
  liked: boolean;
  total_likes: number;
  parentID: number;
}