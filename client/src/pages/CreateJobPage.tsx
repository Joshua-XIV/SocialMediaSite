// src/pages/CreateJobPage.tsx
import { useState, useRef} from "react";
import { createJob } from "../api/job";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { JOB_TYPES, JOB_CATEGORIES, EXPERIENCE_LEVELS, EDUCATION_LEVELS, COMPENSATION_TYPES } from "../util/types";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { popupColor, borderColor, hoverColor, textColor } = useThemeStyles();
  const { isLoggedIn } = useAuth();
  const { openLogin } = useModal();

  const textareaRefs = {
    description: useRef<HTMLTextAreaElement>(null),
    responsibilities: useRef<HTMLTextAreaElement>(null),
    requirement_summary: useRef<HTMLTextAreaElement>(null),
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const textarea = textareaRefs[name as keyof typeof textareaRefs].current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };

  const MAX_LENGTHS = {
    description: 3000,
    responsibilities: 2000,
    requirement_summary: 1000,
  };


  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    commitment: "",
    experience: "",
    compensation_type: "",
    compensation_min: 0,
    compensation_max: 0,
    description: "",
    responsibilities: "",
    requirement_summary: "",
    skills: "",
    education: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        compensation_min: Number(formData.compensation_min),
        compensation_max: Number(formData.compensation_max),
        skills: formData.skills.split(",").map((s) => s.trim()),
      };
      await createJob(payload);
      toast.success("Job posted!");
      navigate("/jobs");
    } catch (err) {
      toast.error("Failed to create job.");
      console.error(err)
    }
  };

  return (
    <div>
      {!isLoggedIn && (
        <div className="flex items-center justify-center">
          <div className="text-red-500 mb-4 text-sm text-center">
            You must be logged in to post a job. Click{" "}
            <button
              className="text-blue-500 underline font-medium hover:text-blue-600 cursor-pointer"
              onClick={() => openLogin("login")}
            >
              here
            </button>{" "}
            to log in.
          </div>
        </div>
      )}
      {isLoggedIn && <div className={`${textColor} max-w-2xl mx-auto p-4`}>
        <div className={`border-2 rounded-3xl ${borderColor} p-4`} style={{ backgroundColor: popupColor }}>
          <h1 className="text-2xl font-bold mb-4">Create Job</h1>
          <form onSubmit={handleSubmit} className="space-y-4 relative">
            {/* Text Inputs */}
            {[
              { name: "title", label: "Title" },
              { name: "location", label: "Location" },
              { name: "compensation_min", label: "Min Compensation", type: "number" },
              { name: "compensation_max", label: "Max Compensation", type: "number" },
              { name: "skills", label: "Skills (comma-separated)" },
            ].map(({ name, label, type = "text" }) => (
              <div key={name}>
                <label htmlFor={name} className="font-semibold block mb-1">{label}</label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  placeholder={label}
                  className={`${borderColor} border-2 w-full placeholder-gray-500 rounded-3xl px-2 py-1`}
                  style={{ backgroundColor: hoverColor }}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
            {/* Dropdowns */}
            {[
              { name: "category", label: "Category", options: JOB_CATEGORIES },
              { name: "commitment", label: "Commitment", options: JOB_TYPES },
              { name: "experience", label: "Experience", options: EXPERIENCE_LEVELS },
              { name: "education", label: "Education", options: EDUCATION_LEVELS },
              { name: "compensation_type", label: "Compensation Type", options: COMPENSATION_TYPES },
            ].map(({ name, label, options }) => (
              <div key={name}>
                <label htmlFor={name} className="font-semibold block mb-1">{label}</label>
                <select
                  id={name}
                  name={name}
                  value={formData[name as keyof typeof formData]}
                  onChange={handleChange}
                  className={`${borderColor} border-2 w-full rounded-3xl px-2 py-1`}
                  style={{ backgroundColor: hoverColor }}
                  required
                >
                  <option value="">Select {label}</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
            {/* Textareas */}
            {[
              { name: "description", label: "Description" },
              { name: "responsibilities", label: "Responsibilities" },
              { name: "requirement_summary", label: "Requirements Summary" },
            ].map(({ name, label }) => (
              <div key={name} className="relative">
                <label htmlFor={name} className="font-semibold block mb-1">{label}</label>
                <textarea
                  ref={textareaRefs[name as keyof typeof textareaRefs]}
                  id={name}
                  name={name}
                  placeholder={label}
                  className={`${borderColor} border-2 w-full placeholder-gray-500 rounded-3xl px-2 py-2 resize-none`}
                  style={{ backgroundColor: hoverColor }}
                  onChange={handleTextareaChange}
                  maxLength={MAX_LENGTHS[name as keyof typeof MAX_LENGTHS]}
                  required
                />
                <div className="flex justify-end px-4">
                  <p className="text-sm text-gray-500 mt-1">
                    {String(formData[name as keyof typeof formData]).length} / {MAX_LENGTHS[name as keyof typeof MAX_LENGTHS]}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex w-full justify-end">
              <button type="submit" className={`bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 relative rounded-2xl ${borderColor} border-2`}>
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>}
    </div>
  );
};

export default CreateJobPage;
