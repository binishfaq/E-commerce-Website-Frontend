import { getToken, isLoggedIn } from '../utils/auth.js';

// Check if user is logged in and is admin
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

const API_URL = 'http://localhost:5000/api/admin';

// Helper for fetch with auth
async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  if (response.status === 403) {
    alert('Admin access required');
    window.location.href = 'index.html';
    return null;
  }
  
  return response;
}

// Load dashboard stats
async function loadDashboardStats() {
  const statsContainer = document.getElementById('statsContainer');
  const recentOrdersContainer = document.getElementById('recentOrders');
  const lowStockContainer = document.getElementById('lowStockProducts');

  try {
    const response = await fetchWithAuth('/dashboard');
    if (!response) return;
    
    const data = await response.json();
    
    // Display stats
    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-box"></i></div>
        <div class="stat-info">
          <h3>${data.stats.products}</h3>
          <p>Total Products</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
        <div class="stat-info">
          <h3>${data.stats.orders}</h3>
          <p>Total Orders</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-users"></i></div>
        <div class="stat-info">
          <h3>${data.stats.users}</h3>
          <p>Total Users</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-rupee-sign"></i></div>
        <div class="stat-info">
          <h3>₹${Number(data.stats.revenue).toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
    `;

    // Display recent orders
    if (data.recentOrders.length === 0) {
      recentOrdersContainer.innerHTML = '<p>No recent orders</p>';
    } else {
      let ordersHtml = '<table><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>';
      data.recentOrders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString();
        ordersHtml += `
          <tr>
            <td>#${order.orderNumber || order.id}</td>
            <td>${order.email}</td>
            <td>₹${Number(order.total).toLocaleString()}</td>
            <td><span class="badge ${getStatusClass(order.status)}">${order.status}</span></td>
            <td>${date}</td>
          </tr>
        `;
      });
      ordersHtml += '</table>';
      recentOrdersContainer.innerHTML = ordersHtml;
    }

    // Display low stock products
    if (data.lowStock.length === 0) {
      lowStockContainer.innerHTML = '<p>All products have sufficient stock</p>';
    } else {
      let stockHtml = '<table><tr><th>Product</th><th>Stock</th><th>Action</th></tr>';
      data.lowStock.forEach(product => {
        stockHtml += `
          <tr>
            <td>${product.name}</td>
            <td><span class="badge danger">${product.stock} left</span></td>
            <td>
              <button class="btn-small btn-edit" onclick="window.location.href='admin-products.html?edit=${product.id}'">
                <i class="fas fa-edit"></i> Restock
              </button>
            </td>
          </tr>
        `;
      });
      stockHtml += '</table>';
      lowStockContainer.innerHTML = stockHtml;
    }

  } catch (error) {
    console.error('Error loading dashboard:', error);
    statsContainer.innerHTML = '<p class="error">Error loading dashboard</p>';
  }
}

function getStatusClass(status) {
  switch(status) {
    case 'Delivered': return 'success';
    case 'Processing': return 'warning';
    case 'Cancelled': return 'danger';
    case 'Shipped': return 'info';
    default: return '';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadDashboardStats);