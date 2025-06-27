import { useState, useEffect } from "react";
import type { JobListing, JobCategory, JobType, ExperienceLevel, EducationLevel, CompensationType,} from "../util/types";
import { JOB_TYPES, JOB_CATEGORIES, EXPERIENCE_LEVELS, EDUCATION_LEVELS,} from "../util/types";
import { MultiSelectPopover } from "../components/MultiSelectPopover";
import { SalaryFilterPopover } from "../components/SalaryFilterPopover";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { getFilteredJobs } from "../api/job";

export default function JobPage() {
  const { textColor, borderColor, bgColor } = useThemeStyles();

  const [filters, setFilters] = useState<{
    type: JobType[];
    category: JobCategory[];
    experience: ExperienceLevel[];
    education: EducationLevel[];
    compensation: {
      type: CompensationType;
      desired: number | null;
    };
  }>({
    type: [],
    category: [],
    experience: [],
    education: [],
    compensation: { type: "Yearly", desired: null },
  });

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [jobList, setJobList] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);

  const isFilterActive = (key: keyof typeof filters) => {
    if (key === "compensation") return filters.compensation.desired !== null;
    return (filters[key] as string[]).length > 0;
  };

  const clearFilter = (key: keyof typeof filters, value?: string) => {
    setFilters((prev) => {
      if (key === "compensation") {
        return { ...prev, compensation: { ...prev.compensation, desired: null } };
      }
      const updatedSet = (prev[key] as string[]).filter((item) => item !== value);
      return { ...prev, [key]: updatedSet };
    });
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobs = await getFilteredJobs({
          category: filters.category,
          commitment: filters.type,
          experience: filters.experience,
          education: filters.education,
          compensationType:
            filters.compensation.desired !== null ? [filters.compensation.type] : undefined,
          desiredCompensation: filters.compensation.desired ?? undefined,
        });

        // Transform backend fields to match JobListing type
        const transformed = jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          category: job.category,
          location: job.location,
          commitment: job.commitment,
          experience: job.experience,
          education: job.education,
          compensation: {
            type: job.compensation_type,
            min: job.compensation_min,
            max: job.compensation_max,
          },
        }));

        setJobList(transformed);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]);

  const filterConfig = [
    { key: "type", label: "Job Type", options: JOB_TYPES },
    { key: "category", label: "Category", options: JOB_CATEGORIES },
    { key: "experience", label: "Experience", options: EXPERIENCE_LEVELS },
    { key: "education", label: "Education", options: EDUCATION_LEVELS },
  ] as const;

  return (
    <div className="p-6">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {filterConfig.map((filter) => (
          <button
            key={filter.key}
            className={`px-3 py-1 border rounded hover:cursor-pointer ${
              isFilterActive(filter.key as keyof typeof filters)
                ? `border-blue-500 text-blue-500 shadow-blue-500 shadow`
                : `${borderColor} ${textColor}`
            } hover:bg-opacity-60`}
            style={{ backgroundColor: bgColor }}
            onClick={() =>
              setOpenFilter(openFilter === filter.key ? null : filter.key)
            }
          >
            {filter.label}
          </button>
        ))}
        <button
          className={`px-3 py-1 border rounded hover:cursor-pointer ${
            isFilterActive("compensation")
              ? "border-blue-500 bg-blue-100 dark:bg-blue-950 text-blue-500"
              : `${borderColor} ${textColor}`
          }`}
          style={{ backgroundColor: bgColor }}
          onClick={() => setOpenFilter(openFilter === "salary" ? null : "salary")}
        >
          Compensation
        </button>
      </div>

      {/* Active filter tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["type", "category", "experience", "education"] as const).map((key) =>
          filters[key].map((value) => (
            <span
              key={`${key}-${value}`}
              className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full text-blue-500 border-blue-500 shadow shadow-blue-500`}
              style={{ backgroundColor: bgColor }}
            >
              {value}
              <button
                onClick={() => clearFilter(key, value)}
                className="ml-1 text-xs font-bold hover:text-red-500"
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>

      {/* Filter popups */}
      <div className="z-10">
        {openFilter &&
          ["type", "category", "experience", "education"].includes(openFilter) && (
            <MultiSelectPopover
              title={openFilter.charAt(0).toUpperCase() + openFilter.slice(1)}
              options={
                (filterConfig.find((f) => f.key === openFilter)?.options ?? []) as string[]
              }
              selected={filters[openFilter as keyof typeof filters] as string[]}
              onApply={(selected) =>
                setFilters((prev) => ({
                  ...prev,
                  [openFilter]: selected,
                }))
              }
              onClose={() => setOpenFilter(null)}
            />
          )}

        {openFilter === "salary" && (
          <SalaryFilterPopover
            selected={filters.compensation}
            onApply={(newComp) =>
              setFilters((prev) => ({
                ...prev,
                compensation: newComp,
              }))
            }
            onClose={() => setOpenFilter(null)}
          />
        )}
      </div>

      {/* Job Listings */}
      <div className="grid gap-4 mt-6">
        {loading ? (
          <p className={textColor}>Loading jobs...</p>
        ) : jobList.length === 0 ? (
          <p className={textColor}>No jobs match your criteria.</p>
        ) : (
          jobList.map((job) => (
            <div
              key={job.id}
              className={`p-4 rounded border ${borderColor}`}
              style={{ backgroundColor: bgColor }}
            >
              <h3 className={`text-xl font-bold ${textColor}`}>{job.title}</h3>
              <p className={textColor}>
                {job.commitment} — {job.category} — {job.location}
              </p>
              <p className={textColor}>
                Experience: {job.experience} | Education: {job.education}
              </p>
              <p className={textColor}>
                {job.compensation.type}: ${job.compensation.min.toLocaleString()} - $
                {job.compensation.max.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
