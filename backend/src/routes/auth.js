import express from 'express';
import bcrypt from 'bcryptjs';
import { query, getOne, insert } from '../utils/db.js';
import { generateToken } from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Register (creates ONLY regular users - no admins via registration)
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Regular users are created with isAdmin = false (default from schema)
    const userId = await insert(
      'INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone || '', hashedPassword]
    );

    const user = await getOne(
      'SELECT id, firstName, lastName, email, phone, isAdmin FROM users WHERE id = ?',
      [userId]
    );

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login (works for both admin and regular users)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await getOne('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    delete user.password;

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Special route to create the ONE and ONLY admin (call this ONCE)
// You can protect this with a secret key or remove after first use
router.post('/create-admin', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, secretKey } = req.body;

    // Simple protection - use environment variable
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if admin already exists
    const existingAdmin = await getOne('SELECT id FROM users WHERE isAdmin = true');
    
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Admin account already exists. Only one admin is allowed.' 
      });
    }

    // Check if email already used
    const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the admin user
    const userId = await insert(
      'INSERT INTO users (firstName, lastName, email, phone, password, isAdmin) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone || '', hashedPassword, true]
    );

    const admin = await getOne(
      'SELECT id, firstName, lastName, email, phone, isAdmin FROM users WHERE id = ?',
      [userId]
    );

    const token = generateToken(admin.id);

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      user: admin
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get profile
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, province } = req.body;

    await query(
      `UPDATE users 
       SET firstName = ?, lastName = ?, phone = ?, address = ?, city = ?, province = ?
       WHERE id = ?`,
      [firstName, lastName, phone, address, city, province, req.user.id]
    );

    const user = await getOne(
      'SELECT id, firstName, lastName, email, phone, address, city, province, isAdmin FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin check - useful for frontend
router.get('/check-admin', protect, async (req, res) => {
  try {
    // Only one admin can exist
    const admin = await getOne('SELECT id FROM users WHERE isAdmin = true');
    
    res.json({
      hasAdmin: !!admin,
      isCurrentUserAdmin: req.user.isAdmin === 1
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;