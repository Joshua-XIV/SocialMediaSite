import { useEffect, useState } from "react";
import { useThemeStyles } from "../hooks/useThemeStyles";
import type { JobListing } from "../util/types";

type JobDetailsProps = {
  job: JobListing;
  onClose: () => void;
};

const JobDetails = ({ job, onClose }: JobDetailsProps) => {
  const { bgColor, textColor, borderColor } = useThemeStyles();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // Match transition duration
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleClose}>
      <div
        className={`${borderColor} border-1 fixed right-0 h-full w-full sm:w-[500px] shadow-lg z-50 transition-transform duration-300`}
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)", backgroundColor :  bgColor}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-4 border-b ${borderColor}`}>
          <h2 className={`${textColor} text-lg font-semibold`}>Job Details</h2>
          <button
            onClick={handleClose}
            className="text-red-500 font-bold text-xl hover:opacity-70 cursor-pointer"
          >
            ✕
          </button>
        </div>
        {/* Content */}
        <div className={`${textColor} p-4 overflow-y-auto h-[calc(100%-3rem)]`}>
          <h3 className="text-xl font-bold mb-2">{job.title}</h3>
          <p className="mb-1 text-sm">
            {job.commitment} • {job.category} • {job.location}
          </p>
          <p className="mb-1 text-sm">
            <strong>Experience:</strong> {job.experience}
          </p>
          <p className="mb-1 text-sm">
            <strong>Education:</strong> {job.education}
          </p>
          <p className="mb-1 text-sm">
            <strong>Salary:</strong> {job.compensation.type}: $
            {job.compensation.min.toLocaleString()} - $
            {job.compensation.max.toLocaleString()}
          </p>
          {/* Description */}
          {job.description && (
            <div className="mt-4">
              <h4 className="font-semibold mb-1">Description</h4>
              <p className="text-sm  whitespace-pre-line">
                {job.description}
              </p>
            </div>
          )}
          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="mt-4">
              <h4 className="font-semibold mb-1">Responsibilities</h4>
              <p className="text-sm whitespace-pre-line">
                {job.responsibilities}
              </p>
            </div>
          )}
          {/* Requirements */}
          {job.requirement_summary && (
            <div className="mt-4">
              <h4 className="font-semibold mb-1">Requirements</h4>
              <p className="text-sm  whitespace-pre-line">
                {job.requirement_summary}
              </p>
            </div>
          )}
          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-1">Skills</h4>
              <ul className="list-disc list-inside text-sm">
                {job.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
