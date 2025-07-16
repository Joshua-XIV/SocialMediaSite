import {pool as db} from '../database.js'
import HttpError from '../utils/errorUtils.js'

const MAX_DESCRIPTION_LENGTH = 3000;
const MAX_RESPONSIBILITIES_LENGTH = 2000;
const MAX_REQUIREMENT_SUMMARY_LENGTH = 1000;
const HOURS_PER_YEAR = 2080;
const PART_TIME_HOURS_PER_YEAR = 1040;

export const getJobs = async(req, res, next) => {
  try {
    const parseMulti = (str) => (str ? str.split(',').map(s => s.trim()) : undefined);

    const {
      category,
      commitment,
      experience,
      education,
      compensationType,
      desiredCompensation,
      compensationMin,
      compensationMax,
      maxAgeInDays,
    } = req.query;

    let queryText = 'SELECT * FROM jobs';
    const queryParams = [];
    const conditions = [];

    // For filters that accept multiple values, use IN clause
    if (category) {
      const categories = parseMulti(category);
      queryParams.push(categories);
      conditions.push(`category = ANY($${queryParams.length}::text[])`);
    }

    if (commitment) {
      const commitments = parseMulti(commitment);
      queryParams.push(commitments);
      conditions.push(`commitment = ANY($${queryParams.length}::text[])`);
    }

    if (experience) {
      const experiences = parseMulti(experience);
      queryParams.push(experiences);
      conditions.push(`experience = ANY($${queryParams.length}::text[])`);
    }

    if (education) {
      const educations = parseMulti(education);
      queryParams.push(educations);
      conditions.push(`education = ANY($${queryParams.length}::text[])`);
    }    

    if (compensationType) {
      const compTypes = parseMulti(compensationType);
      queryParams.push(compTypes);
      conditions.push(`compensation_type = ANY($${queryParams.length}::text[])`);
    }

    if (desiredCompensation) {
      const desired = parseInt(desiredCompensation, 10);
      queryParams.push(desired);
      conditions.push(`
        CASE 
          WHEN compensation_type = 'Hourly' AND commitment = 'Part-time' THEN compensation_max * ${PART_TIME_HOURS_PER_YEAR}
          WHEN compensation_type = 'Hourly' THEN compensation_max * ${HOURS_PER_YEAR}
          ELSE compensation_max
        END >= $${queryParams.length}
      `);
    }

    if (compensationMin) {
      queryParams.push(parseInt(compensationMin, 10));
      conditions.push(`compensation_min >= $${queryParams.length}`);
    }

    if (compensationMax) {
      queryParams.push(parseInt(compensationMax, 10));
      conditions.push(`compensation_max <= $${queryParams.length}`);
    }

    if (maxAgeInDays) {
      queryParams.push(parseInt(maxAgeInDays, 10));
      conditions.push(`created_at >= NOW() - ($${queryParams.length} * INTERVAL '1 day')`)
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    const { rows } = await db.query(queryText, queryParams);
    res.json(rows)
  } catch (err) {
    next(new HttpError(500, `Failed to get jobs: ${err}`))
  }
}

export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      category,
      location,
      commitment,
      experience,
      compensation_type,
      compensation_min,
      compensation_max,
      description,
      responsibilities,
      requirement_summary,
      skills,
      education,
    } = req.body;

    const userID = req.user?.id;
    if (!userID) {
      return next(new HttpError(400, "Missing user"));
    }

    const requiredFields = [
      "title", "category", "location", "commitment", "experience",
      "compensation_type", "description", "responsibilities",
      "requirement_summary", "skills", "education"
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return next(new HttpError(400, `Missing required field: ${field}`));
      }
    }

    if (typeof compensation_min !== "number" || typeof compensation_max !== "number") {
      return next(new HttpError(400, "Compensation must be numbers"));
    }

    const limits = [
      { field: "description", max: MAX_DESCRIPTION_LENGTH },
      { field: "responsibilities", max: MAX_RESPONSIBILITIES_LENGTH },
      { field: "requirement_summary", max: MAX_REQUIREMENT_SUMMARY_LENGTH },
    ];

    for (const { field, max } of limits) {
      if (req.body[field].length > max) {
        return next(new HttpError(400, `${field} too long (max ${max} characters)`));
      }
    }

    const query = `
      INSERT INTO jobs (
        title, category, location, commitment, experience, compensation_type, 
        compensation_min, compensation_max, description, responsibilities, 
        requirement_summary, skills, education, created_at, user_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), $14
      ) RETURNING *;
    `;

    const values = [
      title, category, location, commitment, experience, compensation_type,
      compensation_min, compensation_max, description, responsibilities,
      requirement_summary, skills, education, userID
    ];

    const { rows } = await db.query(query, values);
    return res.status(201).json(rows[0]);
  } catch (err) {
    next(new HttpError(500, `Failed to post job: ${err}`));
  }
};
