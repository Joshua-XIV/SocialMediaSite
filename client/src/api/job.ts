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

  const res = await fetch(`${API_URL}/api/job/get-jobs?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.statusText}`);
  }

  return await res.json();
}