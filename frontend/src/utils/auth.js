// auth.js – Backend API authentication with JWT

const API_URL = 'http://localhost:5000/api'; // Changed this to base API URL
const AUTH_URL = `${API_URL}/auth`;

// ========== HELPER FUNCTIONS ==========

// Get auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

// ========== USER AUTHENTICATION ==========

// Register a new user
export async function registerUser(userData) {
  try {
    const response = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Registration failed' 
      };
    }

    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return { 
      success: true, 
      message: data.message,
      user: data.user 
    };

  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// Login user
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Login failed' 
      };
    }

    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return { 
      success: true, 
      message: data.message,
      user: data.user 
    };

  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// Logout
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Update user profile
export async function updateUserProfile(updatedFields) {
  try {
    const token = getToken();
    
    if (!token) {
      return { success: false, message: 'Not logged in' };
    }

    const response = await fetch(`${AUTH_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedFields)
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Profile update failed' 
      };
    }

    // Update stored user data
    const currentUser = getCurrentUser();
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      ...data.user
    }));

    return { 
      success: true, 
      message: data.message,
      user: data.user 
    };

  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// ========== PASSWORD RESET ==========

// Request password reset
export async function requestPasswordReset(email) {
  try {
    const response = await fetch(`${AUTH_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Request failed' 
      };
    }

    return { 
      success: true, 
      message: data.message || 'Reset link sent to your email' 
    };

  } catch (error) {
    console.error('Password reset request error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// Reset password with token
export async function resetPassword(token, newPassword) {
  try {
    const response = await fetch(`${AUTH_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Password reset failed' 
      };
    }

    return { 
      success: true, 
      message: data.message || 'Password updated successfully' 
    };

  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// Validate reset token
export async function validateResetToken(token) {
  try {
    const response = await fetch(`${AUTH_URL}/validate-token/${token}`);
    
    const data = await response.json();

    return { 
      valid: response.ok, 
      message: data.message 
    };

  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
}

// ========== ORDERS ==========

// Save an order for the current user
export async function saveOrder(orderData) {
  try {
    const token = getToken();
    
    if (!token) {
      return { success: false, message: 'Not logged in' };
    }

    console.log('Saving order:', orderData); // Debug log

    // Format the order data for your backend
    const apiOrderData = {
      items: orderData.items.map(item => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: orderData.shippingAddress,
      city: orderData.city,
      province: orderData.province,
      postalCode: orderData.postalCode || '',
      paymentMethod: orderData.paymentMethod,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      total: orderData.total,
      notes: orderData.notes || ''
    };

    console.log('API Request:', apiOrderData); // Debug log

    const response = await fetch(`${API_URL}/orders`, { // Using API_URL here
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(apiOrderData)
    });

    const data = await response.json();
    console.log('API Response:', data); // Debug log

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Order failed' 
      };
    }

    return { 
      success: true, 
      orderId: data.id || data.orderId,
      orderNumber: data.orderNumber,
      message: data.message || 'Order placed successfully' 
    };

  } catch (error) {
    console.error('Order error:', error);
    return { 
      success: false, 
      message: error.message || 'Network error. Please try again.' 
    };
  }
}

// Get orders for the current user
export async function getUserOrders() {
  try {
    const token = getToken();
    
    if (!token) {
      return [];
    }

    const response = await fetch(`${API_URL}/orders/myorders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return [];
    }

    const orders = await response.json();
    return orders;

  } catch (error) {
    console.error('Get orders error:', error);
    return [];
  }
}

// Get single order by ID
export async function getOrderById(orderId) {
  try {
    const token = getToken();
    
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const order = await response.json();
    return order;

  } catch (error) {
    console.error('Get order error:', error);
    return null;
  }
}