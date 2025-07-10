import { useState, useEffect } from "react";
import type { JobListing, JobCategory, JobType, ExperienceLevel, EducationLevel,} from "../util/types";
import { JOB_TYPES, JOB_CATEGORIES, EXPERIENCE_LEVELS, EDUCATION_LEVELS,} from "../util/types";
import { MultiSelectPopover } from "../components/MultiSelectPopover";
import { SalaryFilterPopover } from "../components/SalaryFilterPopover";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { getFilteredJobs } from "../api/job";
import { formatTimeShort } from "../util/formatTime";
import JobDetails from "../components/JobDetails";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function JobPage() {
  const { textColor, borderColor, bgColor, backgroundLayer } = useThemeStyles();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [filters, setFilters] = useState<{
    type: JobType[];
    category: JobCategory[];
    experience: ExperienceLevel[];
    education: EducationLevel[];
    compensation: {
      desired: number | null;
    };
  }>({
    type: [],
    category: [],
    experience: [],
    education: [],
    compensation: { desired: null },
  });

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [jobList, setJobList] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [maxAgeInDays, setMaxAgeInDays] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  const isFilterActive = (key: keyof typeof filters) => {
    if (key === "compensation") return filters.compensation.desired !== null;
    return (filters[key] as string[]).length > 0;
  };

  const clearFilter = (key: keyof typeof filters, value?: string) => {
    setFilters((prev) => {
      if (key === "compensation") {
        return { ...prev, compensation: { desired: null } };
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
          desiredCompensation: filters.compensation.desired ?? undefined,
          maxAgeInDays: maxAgeInDays ?? undefined,
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
          description: job.description,
          responsibilities: job.responsibilities,
          requirement_summary: job.requirement_summary,
          skills: job.skills,
          created_at: job.created_at,
        }));

        setJobList(transformed);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters, maxAgeInDays]);

  const filterConfig = [
    { key: "type", label: "Job Type", options: JOB_TYPES },
    { key: "category", label: "Category", options: JOB_CATEGORIES },
    { key: "experience", label: "Experience", options: EXPERIENCE_LEVELS },
    { key: "education", label: "Education", options: EDUCATION_LEVELS },
  ] as const;

  const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Least Experience", value: "least_experience" },
    { label: "Most Experience", value: "most_experience" },
    { label: "Lowest Salary", value: "lowest_salary" },
    { label: "Highest Salary", value: "highest_salary" },
  ];

  const AGE_FILTER_OPTIONS = [
    { label: "Past 24 hours", value: 1 },
    { label: "Past week", value: 7 },
    { label: "Past month", value: 30 },
    { label: "Past 3 months", value: 90 },
    { label: "Past 6 months", value: 180 },
    { label: "Past year", value: 365 },
    { label: "All time", value: null },
  ];

  function getComparableSalary(job: JobListing): number {
    const { type, min, max } = job.compensation;
    const average = (min + max) / 2;

    if (type === "Hourly") {
      const hoursPerYear = job.commitment === "Part-time" ? 1040 : 2080;
      return average * hoursPerYear;
    }

    return average;
  }

  const sortedJobs = [...jobList].sort((a, b) => {
  switch (sortOption) {
    case "newest":
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    case "oldest":
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    case "least_experience":
      return EXPERIENCE_LEVELS.indexOf(a.experience) - EXPERIENCE_LEVELS.indexOf(b.experience);
    case "most_experience":
      return EXPERIENCE_LEVELS.indexOf(b.experience) - EXPERIENCE_LEVELS.indexOf(a.experience);
    case "lowest_salary":
      return getComparableSalary(a) - getComparableSalary(b);
    case "highest_salary":
      return getComparableSalary(b) - getComparableSalary(a);
    default:
      return 0;
  }
  });

  return (
    <div className="px-4 pb-4">
      {/* Filter buttons */}
      <section className="z-10 sticky top-[3rem] pb-1" style={{backgroundColor : backgroundLayer}}>
        <div className="flex flex-wrap gap-3 mb-4 pt-4">
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
                ? "border-blue-500 text-blue-500 shadow shadow-blue-500"
                : `${borderColor} ${textColor}`
            }`}
            style={{ backgroundColor: bgColor }}
            onClick={() => setOpenFilter(openFilter === "salary" ? null : "salary")}
          >
            Compensation
          </button>
          <button 
            className={`px-3 py-1 border rounded hover:cursor-pointer font-bold ${textColor} ${borderColor}`}
            style={{ backgroundColor : bgColor }}
            onClick={() => setFilters({type: [], category: [], experience: [], education: [], compensation: {desired: null}})}
          >
            CLEAR FILTERS
          </button>
          {isLoggedIn && <button
            className={`px-3 py-1 border rounded hover:cursor-pointer font-bold ${textColor} ${borderColor}`}
            style={{ backgroundColor : bgColor }}
            onClick={() => navigate("/jobs/create")}
          >
            Create Job
          </button>}
        </div>

          {/* Active Filter Buttons */}
        <div className="flex flex-wrap gap-2 pb-2">
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
        <p className="text-center text-yellow-500"> These job links are for demo purposes only and do not lead to real applications. </p>
      </section>

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
                compensation: { desired: newComp.desired },
              }))
            }
            onClose={() => setOpenFilter(null)}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-4 items-center pt-1">
        {/* Sort by dropdown */}
        <div>
          <label htmlFor="sortSelect" className={`mr-2 ${textColor} font-semibold`}>
            Sort by:
          </label>
          <select
            id="sortSelect"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className={`rounded border  px-2 py-1 ${borderColor} ${textColor} cursor-pointer`}
            style={{backgroundColor : bgColor}}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} style={{backgroundColor : bgColor}}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Posted Within dropdown */}
        <div>
          <label htmlFor="ageSelect" className={`mr-2 ${textColor} font-semibold`}>
            Posted Within:
          </label>
          <select
            id="ageSelect"
            value={maxAgeInDays === null ? "all" : maxAgeInDays.toString()}
            onChange={(e) =>
              setMaxAgeInDays(e.target.value === "all" ? null : parseInt(e.target.value, 10))
            }
            className={`rounded border px-2 py-1 ${borderColor} ${textColor} cursor-pointer`}
            style={{backgroundColor : bgColor}}
          >
            {AGE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value === null ? "all" : opt.value.toString()} style={{backgroundColor : bgColor}}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>  

      {/* Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {loading ? (
          <p className={textColor}>Loading jobs...</p>
        ) : sortedJobs.length === 0 ? (
          <p className={textColor}>No jobs match your criteria.</p>
        ) : (
          sortedJobs.map((job) => (
            <div
              key={job.id}
              className={`relative p-4 rounded border ${borderColor} cursor-pointer ${textColor}`}
              style={{ backgroundColor: bgColor }}
              onClick={() => setSelectedJob(job)}
            >
              <h3 className={`text-xl font-bold ${textColor}`}>{job.title}</h3>
              <p> {job.commitment} — {job.category} - {job.location} </p>
              <p> Experience: {job.experience} </p>
              <p>Education: {job.education}</p>
              <p className={textColor}>
                {job.compensation.type}: ${job.compensation.min.toLocaleString()} - $
                {job.compensation.max.toLocaleString()}
              </p>
              <div className="absolute right-0 top-0 p-4">{formatTimeShort(job.created_at)}</div>
            </div>
          ))
        )}
      </div>
      {selectedJob && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setSelectedJob(null)}
          />
          <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} />
        </>
      )}
    </div>
  );
}
