import pool from '../config/db.js';

// POST /api/ratings - submit or update
export const submitOrUpdateRating = async (req, res) => {
  const userId = req.user.userId;
  const { store_id, rating } = req.body;

  if (!store_id || !rating) {
    return res.status(400).json({ message: 'Store ID and rating required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be 1-5' });
  }

  try {
    await pool.query(`
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, store_id)
      DO UPDATE SET rating = EXCLUDED.rating
    `, [userId, store_id, rating]);

    res.status(200).json({ message: 'Rating submitted or updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting rating', error: err.message });
  }
};

// GET /api/ratings/my - get current user’s ratings
export const getUserRatings = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT s.id AS store_id, s.name, s.address, r.rating AS user_rating
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
    `, [userId]);

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching ratings', error: err.message });
  }
};

// GET /api/ratings/owner - ratings for the logged-in store owner
export const getOwnerStoreRatings = async (req, res) => {
  const ownerId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT r.id, r.rating, u.name AS rated_by, s.name AS store_name
      FROM ratings r
      JOIN stores s ON s.id = r.store_id
      JOIN users u ON u.id = r.user_id
      WHERE s.owner_id = $1
    `, [ownerId]);

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching store owner ratings', error: err.message });
  }
};
