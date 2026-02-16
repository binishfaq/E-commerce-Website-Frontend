// auth.js - Complete Authentication System using localStorage

// ========== USER MANAGEMENT ==========

// User Database Key
const USERS_DB = 'easeshop_users';
const SESSION_KEY = 'easeshop_session';

// Initialize users database if not exists
const initUserDB = () => {
  if (!localStorage.getItem(USERS_DB)) {
    localStorage.setItem(USERS_DB, JSON.stringify([]));
  }
};

// Hash password (simple base64 encoding - for demo only)
// In production, use proper bcrypt with backend
const hashPassword = (password) => {
  return btoa(password); // Simple encoding, NOT secure for production
};

// Register new user
export const registerUser = (userData) => {
  initUserDB();
  
  const users = JSON.parse(localStorage.getItem(USERS_DB));
  
  // Check if email already exists
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    return { success: false, message: 'Email already registered' };
  }
  
  // Create new user
  const newUser = {
    id: 'user_' + Date.now(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: hashPassword(userData.password),
    phone: userData.phone || '',
    address: userData.address || '',
    city: userData.city || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_DB, JSON.stringify(users));
  
  return { success: true, message: 'Registration successful', user: newUser };
};

// Login user
export const loginUser = (email, password) => {
  initUserDB();
  
  const users = JSON.parse(localStorage.getItem(USERS_DB));
  const hashedPassword = hashPassword(password);
  
  const user = users.find(u => u.email === email && u.password === hashedPassword);
  
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Create session (don't store password in session)
  const sessionUser = { ...user };
  delete sessionUser.password;
  
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    user: sessionUser,
    loggedInAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  }));
  
  return { success: true, message: 'Login successful', user: sessionUser };
};

// Check if user is logged in
export const isLoggedIn = () => {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return false;
  
  const sessionData = JSON.parse(session);
  const expiresAt = new Date(sessionData.expiresAt);
  
  if (expiresAt < new Date()) {
    logout();
    return false;
  }
  
  return true;
};

// Get current user
export const getCurrentUser = () => {
  if (!isLoggedIn()) return null;
  
  const session = JSON.parse(localStorage.getItem(SESSION_KEY));
  return session.user;
};

// Logout user
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  return { success: true, message: 'Logged out successfully' };
};

// Update user profile
export const updateUserProfile = (updatedData) => {
  if (!isLoggedIn()) return { success: false, message: 'Not logged in' };
  
  const session = JSON.parse(localStorage.getItem(SESSION_KEY));
  const users = JSON.parse(localStorage.getItem(USERS_DB));
  
  const userIndex = users.findIndex(u => u.id === session.user.id);
  if (userIndex === -1) return { success: false, message: 'User not found' };
  
  // Update user data (keep password)
  users[userIndex] = {
    ...users[userIndex],
    firstName: updatedData.firstName || users[userIndex].firstName,
    lastName: updatedData.lastName || users[userIndex].lastName,
    phone: updatedData.phone || users[userIndex].phone,
    address: updatedData.address || users[userIndex].address,
    city: updatedData.city || users[userIndex].city,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(USERS_DB, JSON.stringify(users));
  
  // Update session
  const updatedUser = { ...users[userIndex] };
  delete updatedUser.password;
  session.user = updatedUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  
  return { success: true, message: 'Profile updated', user: updatedUser };
};

// ========== PASSWORD RESET ==========

// Store reset tokens (in localStorage for demo)
const RESET_TOKENS_KEY = 'easeshop_reset_tokens';

// Request password reset
export const requestPasswordReset = (email) => {
  initUserDB();
  
  const users = JSON.parse(localStorage.getItem(USERS_DB));
  const user = users.find(u => u.email === email);
  
  // Always return success to prevent email enumeration
  if (!user) {
    return { success: true, message: 'If email exists, reset link sent' };
  }
  
  // Generate reset token (simple for demo)
  const resetToken = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const resetTokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY)) || {};
  
  resetTokens[resetToken] = {
    userId: user.id,
    email: user.email,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
  };
  
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(resetTokens));
  
  // In real app, send email with reset link
  console.log(`Reset link: http://localhost:5173/reset-password.html?token=${resetToken}`);
  
  return { 
    success: true, 
    message: 'Password reset email sent',
    debugToken: resetToken // For testing - remove in production
  };
};

// Validate reset token
export const validateResetToken = (token) => {
  const resetTokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY)) || {};
  const tokenData = resetTokens[token];
  
  if (!tokenData) return { valid: false };
  
  if (new Date(tokenData.expiresAt) < new Date()) {
    return { valid: false, message: 'Token expired' };
  }
  
  return { valid: true, userId: tokenData.userId };
};

// Reset password
export const resetPassword = (token, newPassword) => {
  const validation = validateResetToken(token);
  if (!validation.valid) {
    return { success: false, message: 'Invalid or expired token' };
  }
  
  const users = JSON.parse(localStorage.getItem(USERS_DB));
  const userIndex = users.findIndex(u => u.id === validation.userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  // Update password
  users[userIndex].password = hashPassword(newPassword);
  users[userIndex].updatedAt = new Date().toISOString();
  localStorage.setItem(USERS_DB, JSON.stringify(users));
  
  // Delete used token
  const resetTokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY)) || {};
  delete resetTokens[token];
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(resetTokens));
  
  return { success: true, message: 'Password reset successful' };
};

// ========== SESSION MANAGEMENT ==========

// Extend session
export const extendSession = () => {
  if (!isLoggedIn()) return false;
  
  const session = JSON.parse(localStorage.getItem(SESSION_KEY));
  session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  
  return true;
};

// Get session info
export const getSessionInfo = () => {
  if (!isLoggedIn()) return null;
  
  const session = JSON.parse(localStorage.getItem(SESSION_KEY));
  return {
    loggedInAt: session.loggedInAt,
    expiresAt: session.expiresAt,
    expiresIn: Math.floor((new Date(session.expiresAt) - new Date()) / 1000 / 60) + ' minutes'
  };
};