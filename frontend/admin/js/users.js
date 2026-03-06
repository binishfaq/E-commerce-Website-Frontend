// admin/js/users.js
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
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 10;

// Load users
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load users');
        
        allUsers = await response.json();
        filteredUsers = [...allUsers];
        
        updateStats();
        displayUsers();
        
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> 
                Error loading users. Please refresh.
            </div>
        `;
    }
}

// Update statistics
function updateStats() {
    const total = allUsers.length;
    const active = allUsers.length; // You can add logic for active/inactive if needed
    const admins = allUsers.filter(u => u.isAdmin).length;
    
    document.getElementById('totalUsers').textContent = total;
    document.getElementById('activeUsers').textContent = active;
    document.getElementById('adminUsers').textContent = admins;
}

// Display users
function displayUsers() {
    const container = document.getElementById('usersContainer');
    
    if (filteredUsers.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 50px;">No users found</p>';
        return;
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageUsers = filteredUsers.slice(start, end);
    
    let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Role</th><th>Actions</th></tr></thead><tbody>';
    
    pageUsers.forEach(user => {
        const date = new Date(user.createdAt).toLocaleDateString();
        const roleClass = user.isAdmin ? 'status-active' : '';
        const roleText = user.isAdmin ? 'Admin' : 'User';
        
        html += `
            <tr>
                <td>#${user.id}</td>
                <td><strong>${user.firstName || ''} ${user.lastName || ''}</strong></td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${date}</td>
                <td><span class="status-badge ${roleClass}">${roleText}</span></td>
                <td>
                    ${!user.isAdmin ? `
                        <button class="btn btn-small btn-success" onclick="toggleAdmin(${user.id}, true)">
                            <i class="fas fa-user-shield"></i> Make Admin
                        </button>
                    ` : `
                        <button class="btn btn-small btn-warning" onclick="toggleAdmin(${user.id}, false)">
                            <i class="fas fa-user"></i> Remove Admin
                        </button>
                    `}
                    <button class="btn btn-small btn-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
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
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div style="display: flex; gap: 5px; justify-content: center;">';
    
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button class="btn ${i === currentPage ? 'btn-primary' : 'btn'}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Change page
window.changePage = (page) => {
    currentPage = page;
    displayUsers();
};

// Toggle admin status
window.toggleAdmin = async (userId, makeAdmin) => {
    if (!confirm(`Are you sure you want to ${makeAdmin ? 'make this user an admin' : 'remove admin privileges'}?`)) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-admin`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to update user');
        
        showNotification(`User ${makeAdmin ? 'promoted to admin' : 'removed from admin'}`, 'success');
        loadUsers(); // Reload users
        
    } catch (error) {
        console.error('Error toggling admin:', error);
        showNotification('Failed to update user', 'error');
    }
};

// Delete user
window.deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete user');
        }
        
        showNotification('User deleted successfully', 'success');
        loadUsers(); // Reload users
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification(error.message, 'error');
    }
};

// Search functionality
document.getElementById('searchBtn').addEventListener('click', applySearch);
document.getElementById('resetBtn').addEventListener('click', resetSearch);

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applySearch();
});

function applySearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        filteredUsers = [...allUsers];
    } else {
        filteredUsers = allUsers.filter(user => 
            (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm))
        );
    }
    
    currentPage = 1;
    displayUsers();
}

function resetSearch() {
    document.getElementById('searchInput').value = '';
    filteredUsers = [...allUsers];
    currentPage = 1;
    displayUsers();
}

// Helper function for notifications
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
document.addEventListener('DOMContentLoaded', loadUsers);