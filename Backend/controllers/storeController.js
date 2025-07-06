import pool from '../config/db.js';

// GET /api/stores - all stores with avg ratings
export const getAllStores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stores', error: err.message });
  }
};

// GET /api/stores/:id - one store with average rating
export const getStoreById = async (req, res) => {
  const storeId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT s.*, 
             COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = $1
      GROUP BY s.id
    `, [storeId]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Store not found' });

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching store', error: err.message });
  }
};
