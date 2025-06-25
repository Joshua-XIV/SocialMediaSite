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

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type JobCategory = "Engineering" | "Design" | "Marketing" | "Product" | "Sales";
export type ExperienceLevel = "Entry" | "Mid" | "Senior" | "Lead";
export type EducationLevel = "High School" | "Associate" | "Bachelor" | "Master" | "PhD";
export type CompensationType = "Yearly" | "Hourly";

export interface JobListing {
  id: number;
  title: string;
  category: JobCategory;
  location: string;
  type: JobType;
  experience: ExperienceLevel;
  education: EducationLevel;
  compensation: {
    type: CompensationType;
    min: number;
    max: number;
  };
}