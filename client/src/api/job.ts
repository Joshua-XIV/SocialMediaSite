const API_URL = import.meta.env.VITE_BACKEND_API_URL;

type JobFilters = {
  category?: string[];
  commitment?: string[];
  experience?: string[];
  education?: string[];
  compensationType?: string[];
  desiredCompensation?: number;
  compensationMin?: number;
  compensationMax?: number;
  maxAgeInDays?: number;
};

export async function getFilteredJobs(filters: JobFilters) {
  const params = new URLSearchParams();

  const addListParam = (key: string, values?: string[]) => {
    if (values && values.length > 0) {
      params.append(key, values.join(','));
    }
  };

  addListParam("category", filters.category);
  addListParam("commitment", filters.commitment);
  addListParam("experience", filters.experience);
  addListParam("education", filters.education);
  addListParam("compensationType", filters.compensationType);

  if (filters.desiredCompensation !== undefined) {
    params.append("desiredCompensation", filters.desiredCompensation.toString());
  }
  if (filters.compensationMin !== undefined) {
    params.append("compensationMin", filters.compensationMin.toString());
  }
  if (filters.compensationMax !== undefined) {
    params.append("compensationMax", filters.compensationMax.toString());
  }
  if (filters.maxAgeInDays !== undefined) {
    params.append("maxAgeInDays", filters.maxAgeInDays.toString());
  }

  const res = await fetch(`${API_URL}/api/jobs/?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.statusText}`);
  }

  return await res.json();
}

type CreateJobData = {
  title: string;
  category: string;
  location: string;
  commitment: string;
  experience: string;
  compensation_type: string;
  compensation_min: number;
  compensation_max: number;
  description: string;
  responsibilities: string;
  requirement_summary: string;
  skills: string[];
  education: string;
};

export async function createJob(jobData: CreateJobData) {
  const res = await fetch(`${API_URL}/api/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobData),
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error(`Failed to create job: ${res.statusText}`);
  }

  return await res.json();
}