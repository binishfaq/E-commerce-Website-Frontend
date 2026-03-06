// admin/js/orders.js
const API_URL = 'http://localhost:5000/api';

// Check admin authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || !user.isAdmin) {
    window.location.href = 'index.html';
}

// Display admin info
document.getElementById('adminEmail').textContent = user.email || '';

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

// State
let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

// Load orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load orders');
        
        allOrders = await response.json();
        filteredOrders = [...allOrders];
        
        updateStats();
        displayOrders();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> 
                Error loading orders. Please refresh.
            </div>
        `;
    }
}

// Update statistics
function updateStats() {
    const total = allOrders.length;
    const pending = allOrders.filter(o => ['Processing', 'Confirmed', 'Shipped'].includes(o.status)).length;
    const completed = allOrders.filter(o => o.status === 'Delivered').length;
    const revenue = allOrders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    
    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('completedOrders').textContent = completed;
    document.getElementById('totalRevenue').textContent = `₹${revenue.toLocaleString()}`;
}

// Display orders
function displayOrders() {
    const container = document.getElementById('ordersContainer');
    
    if (filteredOrders.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 50px; color: var(--text-secondary);">No orders found</p>';
        return;
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageOrders = filteredOrders.slice(start, end);
    
    let html = '<table><thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead><tbody>';
    
    pageOrders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString();
        const statusClass = getStatusClass(order.status);
        const itemCount = order.items?.length || 0;
        
        html += `
            <tr>
                <td><strong>#${order.orderNumber || order.id}</strong></td>
                <td>
                    ${escapeHtml(order.firstName || '')} ${escapeHtml(order.lastName || '')}<br>
                    <small style="color: var(--text-secondary);">${escapeHtml(order.email || '')}</small>
                </td>
                <td>${date}</td>
                <td>${itemCount} items</td>
                <td><strong>₹${parseFloat(order.total || 0).toLocaleString()}</strong></td>
                <td>
                    <select class="form-control status-select" data-order-id="${order.id}" 
                            style="width: 120px; padding: 5px;" onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>${order.paymentMethod || 'COD'}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="viewOrder(${order.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    displayPagination();
}

function displayPagination() {
    const container = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div style="display: flex; gap: 5px; justify-content: center; margin-top: 20px;">';
    
    // Previous button
    if (currentPage > 1) {
        html += `<button class="btn" onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="btn btn-primary" style="font-weight: bold;">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="btn" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span style="padding: 0 5px;">...</span>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `<button class="btn" onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Change page
window.changePage = (page) => {
    currentPage = page;
    displayOrders();
};

// Update order status
window.updateOrderStatus = async (orderId, newStatus) => {
    try {
        const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) throw new Error('Failed to update status');
        
        // Update local data
        const order = allOrders.find(o => o.id === orderId);
        if (order) order.status = newStatus;
        
        updateStats();
        showNotification('Order status updated successfully', 'success');
        
    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Failed to update status', 'error');
        loadOrders(); // Reload to revert select
    }
};

// View order details
window.viewOrder = async (orderId) => {
    try {
        const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load order details');
        
        const order = await response.json();
        displayOrderDetails(order);
        openOrderModal();
        
    } catch (error) {
        console.error('Error fetching order:', error);
        showNotification('Failed to load order details', 'error');
    }
};

function displayOrderDetails(order) {
    const container = document.getElementById('orderDetails');
    const date = new Date(order.createdAt).toLocaleString();
    
    document.getElementById('orderNumberDisplay').textContent = `#${order.orderNumber || order.id}`;
    
    let itemsHtml = '';
    let subtotal = 0;
    
    order.items?.forEach(item => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        subtotal += itemTotal;
        
        itemsHtml += `
            <tr>
                <td>
                    <img src="${item.image || 'https://via.placeholder.com/50'}" 
                         alt="${escapeHtml(item.name)}" 
                         class="product-thumb"
                         onerror="this.src='https://via.placeholder.com/50'">
                </td>
                <td>${escapeHtml(item.name)}</td>
                <td>₹${parseFloat(item.price).toLocaleString()}</td>
                <td>${item.quantity}</td>
                <td>₹${itemTotal.toLocaleString()}</td>
            </tr>
        `;
    });
    
    const shipping = parseFloat(order.shipping) || 0;
    const tax = parseFloat(order.tax) || 0;
    const total = parseFloat(order.total) || subtotal + shipping + tax;
    
    container.innerHTML = `
        <div class="order-details-grid">
            <div class="order-info-box">
                <h4><i class="fas fa-user"></i> Customer Information</h4>
                <p><strong>Name:</strong> ${escapeHtml(order.firstName || '')} ${escapeHtml(order.lastName || '')}</p>
                <p><strong>Email:</strong> ${escapeHtml(order.email || '')}</p>
                <p><strong>Phone:</strong> ${escapeHtml(order.phone || 'N/A')}</p>
            </div>
            
            <div class="order-info-box">
                <h4><i class="fas fa-truck"></i> Shipping Address</h4>
                <p>${escapeHtml(order.shippingAddress || 'N/A')}</p>
                <p>${escapeHtml(order.city || '')}, ${escapeHtml(order.province || '')}</p>
            </div>
        </div>
        
        <div class="order-info-box">
            <h4><i class="fas fa-shopping-bag"></i> Order Items</h4>
            <table style="width: 100%;">
                <thead>
                    <tr>
                        <th></th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
        </div>
        
        <div class="order-summary">
            <h4><i class="fas fa-calculator"></i> Order Summary</h4>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹${subtotal.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'Free' : '₹' + shipping.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Tax:</span>
                <span>₹${tax.toLocaleString()}</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span>₹${total.toLocaleString()}</span>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
            <div>
                <span class="status-badge ${getStatusClass(order.status)}" style="font-size: 0.9rem;">
                    ${order.status}
                </span>
                <span style="margin-left: 10px; color: var(--text-secondary);">
                    <i class="fas fa-calendar"></i> ${date}
                </span>
            </div>
            <div>
                <strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}
            </div>
        </div>
    `;
}

// Print order
window.printOrder = () => {
    const printContent = document.getElementById('orderDetails').innerHTML;
    const orderNumber = document.getElementById('orderNumberDisplay').textContent;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Order ${orderNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { color: #1A535C; }
                    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    .summary { margin-top: 20px; }
                    .total { font-weight: bold; font-size: 1.1em; }
                </style>
            </head>
            <body>
                <h2>EaseShop - Order ${orderNumber}</h2>
                ${printContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

// Filter functionality
document.getElementById('filterBtn').addEventListener('click', applyFilters);
document.getElementById('resetBtn').addEventListener('click', resetFilters);

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const date = document.getElementById('dateFilter').value;
    
    filteredOrders = allOrders.filter(order => {
        // Search filter
        const matchesSearch = !search || 
            (order.orderNumber && order.orderNumber.toLowerCase().includes(search)) ||
            (order.email && order.email.toLowerCase().includes(search)) ||
            (order.firstName && order.firstName.toLowerCase().includes(search)) ||
            (order.lastName && order.lastName.toLowerCase().includes(search));
        
        // Status filter
        const matchesStatus = !status || order.status === status;
        
        // Date filter
        let matchesDate = true;
        if (date) {
            const orderDate = new Date(order.createdAt);
            const today = new Date();
            
            if (date === 'today') {
                matchesDate = orderDate.toDateString() === today.toDateString();
            } else if (date === 'week') {
                const weekAgo = new Date(today.setDate(today.getDate() - 7));
                matchesDate = orderDate >= weekAgo;
            } else if (date === 'month') {
                const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
                matchesDate = orderDate >= monthAgo;
            }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    currentPage = 1;
    displayOrders();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = '';
    filteredOrders = [...allOrders];
    currentPage = 1;
    displayOrders();
}

// Modal functions
window.openOrderModal = () => {
    document.getElementById('orderModal').classList.add('active');
};

window.closeOrderModal = () => {
    document.getElementById('orderModal').classList.remove('active');
};

// Helper functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusClass(status) {
    switch(status) {
        case 'Delivered': return 'status-active delivered';
        case 'Processing': return 'status-processing';
        case 'Confirmed': return 'status-processing confirmed';
        case 'Shipped': return 'status-processing shipped';
        case 'Cancelled': return 'status-inactive';
        default: return '';
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', loadOrders);