// auth.js – Simple localStorage-based authentication with orders

// User storage key
const STORAGE_KEY = 'easeshop_users';
const CURRENT_USER_KEY = 'easeshop_current_user';

// Orders storage key
const ORDERS_KEY = 'easeshop_orders';

// Initialize users array if not exists
function initUsers() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

// Get all users
function getUsers() {
  initUsers();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

// Save users
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Get all orders
function getAllOrders() {
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
}

// ========== USER AUTHENTICATION ==========

// Register a new user
export function registerUser(userData) {
  const users = getUsers();
  
  // Check if email already exists
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    return { success: false, message: 'Email already registered' };
  }

  // Create new user (include all fields)
  const newUser = {
    id: Date.now().toString(),
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email,
    phone: userData.phone || '',
    password: userData.password, // In real app, hash this!
    address: '',
    city: ''
  };

  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: 'Account created successfully' };
}

// Login user
export function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Store current user (excluding password)
    const { password, ...safeUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    return { success: true, message: 'Login successful', user: safeUser };
  } else {
    return { success: false, message: 'Invalid email or password' };
  }
}

// Logout
export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Get current user
export function getCurrentUser() {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

// Check if user is logged in
export function isLoggedIn() {
  return !!getCurrentUser();
}

// Update user profile
export function updateUserProfile(updatedFields) {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, message: 'Not logged in' };

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) return { success: false, message: 'User not found' };

  // Update user data
  const updatedUser = { ...users[userIndex], ...updatedFields };
  users[userIndex] = updatedUser;
  saveUsers(users);

  // Update current user (exclude password)
  const { password, ...safeUser } = updatedUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

  return { success: true, message: 'Profile updated' };
}

// ========== PASSWORD RESET ==========

// Forgot password - generate reset token (simplified)
export function requestPasswordReset(email) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, message: 'Email not found' };
  }

  // In a real app, send email with token. Here we return a dummy token.
  const resetToken = btoa(email + '-' + Date.now());
  // Store token with user? For demo, we just return it.
  return { 
    success: true, 
    message: 'Reset link sent (demo)', 
    debugToken: resetToken 
  };
}

// Reset password
export function resetPassword(token, newPassword) {
  // In a real app, validate token. For demo, we accept any token.
  // We'll assume token contains email after decoding.
  try {
    const decoded = atob(token);
    const email = decoded.split('-')[0];
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return { success: false, message: 'Invalid token' };
    }

    users[userIndex].password = newPassword;
    saveUsers(users);
    return { success: true, message: 'Password updated' };
  } catch (e) {
    return { success: false, message: 'Invalid token' };
  }
}

// Validate reset token (for entering the reset page)
export function validateResetToken(token) {
  try {
    const decoded = atob(token);
    const email = decoded.split('-')[0];
    const users = getUsers();
    const user = users.find(u => u.email === email);
    return { valid: !!user };
  } catch {
    return { valid: false };
  }
}

// ========== ORDERS ==========

// Save an order for the current user
export function saveOrder(orderData) {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, message: 'Not logged in' };

  const orders = getAllOrders();
  const newOrder = {
    id: 'ORD-' + Date.now(),
    userId: currentUser.id,
    date: new Date().toISOString(),
    status: 'Processing',
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    tax: orderData.tax || 0,
    shipping: orderData.shipping || 0,
    total: orderData.total || 0,
    address: orderData.address || {},
    paymentMethod: orderData.paymentMethod || 'Cash on Delivery'
  };
  orders.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return { success: true, orderId: newOrder.id };
}

// Get orders for the current user
export function getUserOrders() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  const orders = getAllOrders();
  return orders.filter(order => order.userId === currentUser.id).sort((a, b) => new Date(b.date) - new Date(a.date));
}