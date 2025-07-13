// id = ParentID
export interface PostData {
  id: number;
  username: string;
  content: string;
  created_at: string;
  display_name: string;
  avatar_color: string;
  liked: boolean;
  total_likes: number;
  total_replies: number;
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
  total_replies: number;
  parentID: number;
}

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_CATEGORIES = ["Engineering", "Design", "Marketing", "Product", "Sales"] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const EXPERIENCE_LEVELS = ["Internship", "Entry", "Mid", "Senior", "Lead"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EDUCATION_LEVELS = ["High School", "Associate", "Bachelor", "Master", "PhD"] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const COMPENSATION_TYPES = ["Yearly", "Hourly"] as const;
export type CompensationType = (typeof COMPENSATION_TYPES)[number];

export interface JobListing {
  id: number;
  title: string;
  category: JobCategory;
  location: string;
  commitment: JobType;
  experience: ExperienceLevel;
  education: EducationLevel;
  compensation: {
    type: CompensationType;
    min: number;
    max: number;
  };
  description: string | null;
  responsibilities: string | null;
  requirement_summary: string | null;
  skills: string[] | null;
  created_at: string;
}