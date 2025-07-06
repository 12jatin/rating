import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// 📊 Dashboard Stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const totalStores = await pool.query('SELECT COUNT(*) FROM stores');
    const totalRatings = await pool.query('SELECT COUNT(*) FROM ratings');

    res.status(200).json({
      total_users: parseInt(totalUsers.rows[0].count),
      total_stores: parseInt(totalStores.rows[0].count),
      total_ratings: parseInt(totalRatings.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};

// 👥 Get All Users (with filters)
export const getAllUsers = async (req, res) => {
  const { name, email, role, address } = req.query;
  let query = 'SELECT u.id, u.name, u.email, u.address, u.role FROM users u';
  const values = [];
  const conditions = [];

  if (name) {
    values.push(`%${name}%`);
    conditions.push(`u.name ILIKE $${values.length}`);
  }

  if (email) {
    values.push(`%${email}%`);
    conditions.push(`u.email ILIKE $${values.length}`);
  }

  if (role) {
    values.push(role);
    conditions.push(`u.role = $${values.length}`);
  }

  if (address) {
    values.push(`%${address}%`);
    conditions.push(`u.address ILIKE $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  try {
    const users = await pool.query(query, values);

    // Get avg ratings for store owners
    const enhancedUsers = await Promise.all(
      users.rows.map(async (user) => {
        if (user.role === 'STORE') {
          const avgResult = await pool.query(
            `SELECT ROUND(AVG(r.rating), 1) AS avg_rating
             FROM ratings r
             JOIN stores s ON s.id = r.store_id
             WHERE s.owner_id = $1`,
            [user.id]
          );
          user.avg_rating = avgResult.rows[0].avg_rating || 0;
        }
        return user;
      })
    );

    res.status(200).json(enhancedUsers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// ➕ Add New User
export const createUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role`,
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};

// 🏬 Get All Stores (with avg rating)
export const getAllAdminStores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
             ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      GROUP BY s.id
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stores', error: err.message });
  }
};

// ➕ Add Store
export const createStore = async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  if (!name || !email || !address || !owner_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, address, owner_id]
    );

    res.status(201).json({ message: 'Store created successfully', store: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error creating store', error: err.message });
  }
};
