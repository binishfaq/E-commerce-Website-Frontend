// admin/js/dashboard.js
const API_URL = 'http://localhost:5000/api';

// State
let dashboardData = null;
let refreshInterval = null;

// Get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Check admin authentication
function checkAuth() {
    const token = getToken();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user || !user.isAdmin) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Display admin info
    document.getElementById('adminName').textContent = user.firstName || 'Admin';
    document.getElementById('adminEmail').textContent = user.email || '';
    
    return true;
}

// Show loading state
function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Show error state
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> 
                ${message}
            </div>
        `;
    }
}

// Fetch dashboard stats
async function loadDashboard() {
    // Check auth first
    if (!checkAuth()) return;
    
    // Show loading states
    showLoading('statsContainer', 'Loading statistics...');
    showLoading('recentOrders', 'Loading orders...');
    showLoading('lowStock', 'Checking stock levels...');
    
    const token = getToken();
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.status === 401 || response.status === 403) {
            // Token expired or not admin
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard');
        }
        
        const data = await response.json();
        dashboardData = data;
        
        displayStats(data);
        displayRecentOrders(data.recentOrders);
        displayLowStock(data.lowStock);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        
        let errorMessage = 'Error loading dashboard. Please refresh.';
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please check your connection.';
        }
        
        showError('statsContainer', errorMessage);
        showError('recentOrders', errorMessage);
        showError('lowStock', errorMessage);
    }
}

function displayStats(data) {
    const statsContainer = document.getElementById('statsContainer');
    
    if (!data || !data.stats) {
        showError('statsContainer', 'No statistics available');
        return;
    }
    
    const stats = data.stats;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-info">
                <h3>${Number(stats.products || 0).toLocaleString()}</h3>
                <p>Total Products</p>
            </div>
            <div class="stat-icon products">
                <i class="fas fa-box"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <h3>${Number(stats.orders || 0).toLocaleString()}</h3>
                <p>Total Orders</p>
            </div>
            <div class="stat-icon orders">
                <i class="fas fa-shopping-cart"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <h3>${Number(stats.users || 0).toLocaleString()}</h3>
                <p>Total Users</p>
            </div>
            <div class="stat-icon users">
                <i class="fas fa-users"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <h3>₹${Number(stats.revenue || 0).toLocaleString()}</h3>
                <p>Total Revenue</p>
            </div>
            <div class="stat-icon revenue">
                <i class="fas fa-rupee-sign"></i>
            </div>
        </div>
    `;
}

function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-secondary);">No recent orders</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody>';
    
    orders.slice(0, 5).forEach(order => {
        const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
        const statusClass = getStatusClass(order.status);
        
        // Escape values to prevent XSS
        const orderNumber = escapeHtml(order.orderNumber || order.id || 'N/A');
        const email = escapeHtml(order.email || 'N/A');
        const total = Number(order.total || 0).toLocaleString();
        const status = escapeHtml(order.status || 'Unknown');
        
        html += `
            <tr>
                <td>#${orderNumber}</td>
                <td>${email}</td>
                <td>₹${total}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>${date}</td>
                <td>
                    <a href="orders.html?id=${order.id}" class="btn btn-small btn-primary">
                        <i class="fas fa-eye"></i> View
                    </a>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function displayLowStock(products) {
    const container = document.getElementById('lowStock');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-secondary);">All products have sufficient stock</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>Product</th><th>Current Stock</th><th>Status</th><th>Action</th></tr></thead><tbody>';
    
    products.slice(0, 5).forEach(product => {
        const stock = Number(product.stock || 0);
        const stockStatus = stock <= 0 ? 'Out of Stock' : stock < 5 ? 'Critical' : 'Low';
        const statusClass = stock <= 0 ? 'status-inactive' : stock < 5 ? 'status-processing' : 'status-warning';
        
        // Escape values
        const name = escapeHtml(product.name || 'Unknown Product');
        
        html += `
            <tr>
                <td>${name}</td>
                <td><strong>${stock}</strong></td>
                <td><span class="status-badge ${statusClass}">${stockStatus}</span></td>
                <td>
                    <a href="products.html?edit=${product.id}" class="btn btn-small btn-primary">
                        <i class="fas fa-edit"></i> Restock
                    </a>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusClass(status) {
    if (!status) return '';
    
    const statusMap = {
        'Delivered': 'status-active',
        'Processing': 'status-processing',
        'Confirmed': 'status-processing',
        'Shipped': 'status-processing',
        'Cancelled': 'status-inactive'
    };
    
    return statusMap[status] || '';
}

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

// Auto-refresh dashboard every 30 seconds
function startAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    refreshInterval = setInterval(loadDashboard, 30000);
}

// Stop auto-refresh when leaving page
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    startAutoRefresh();
});