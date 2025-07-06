import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const logoutUser = async (req, res) => {
  try {
    // Optional: Add logic to blacklist token (not implemented here)
    return res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    return res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  // Validate inputs
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hashedPassword, address, role]
    );

    return res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};


export const updatePassword = async (req, res) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Both old and new passwords are required' });
  }

  try {
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Old password is incorrect' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, userId]);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Password update failed', error: err.message });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({ message: 'Login successful', token, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
  
};
