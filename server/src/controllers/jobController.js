import {pool as db} from '../database.js'
import HttpError from '../utils/errorUtils.js'

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
      // Jobs where max compensation is >= desired salary
      queryParams.push(desired);
      conditions.push(`compensation_max >= $${queryParams.length}`);
    }

    if (compensationMin) {
      queryParams.push(parseInt(compensationMin, 10));
      conditions.push(`compensation_min >= $${queryParams.length}`);
    }

    if (compensationMax) {
      queryParams.push(parseInt(compensationMax, 10));
      conditions.push(`compensation_max <= $${queryParams.length}`);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    const { rows } = await db.query(queryText, queryParams);
    res.json(rows);
  } catch (err) {
    next(new HttpError(500, `Failed to get jobs: ${err}`))
  }
}