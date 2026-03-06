// admin/js/products.js
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
let currentPage = 1;
let currentSearch = '';
let currentCategory = '';

// Fetch products
async function loadProducts() {
    const container = document.getElementById('productsContainer');
    
    try {
        let url = `${API_URL}/admin/products?page=${currentPage}`;
        if (currentSearch) url += `&search=${currentSearch}`;
        if (currentCategory) url += `&category=${currentCategory}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load products');
        
        const data = await response.json();
        displayProducts(data);
        displayPagination(data);
        
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> 
                Error loading products. Please refresh.
            </div>
        `;
    }
}

function displayProducts(data) {
    const container = document.getElementById('productsContainer');
    
    if (!data.products || data.products.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 50px;">No products found</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>';
    
    data.products.forEach(product => {
        const stockStatus = product.stock <= 0 ? 'status-inactive' : 
                           product.stock < 10 ? 'status-processing' : 'status-active';
        
        html += `
            <tr>
                <td>#${product.id}</td>
                <td>
                    <img src="${product.image || 'https://via.placeholder.com/50'}" 
                         alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td><strong>${product.name}</strong><br><small>${product.brand || ''}</small></td>
                <td>${product.category}</td>
                <td>₹${Number(product.price).toLocaleString()}</td>
                <td><span class="status-badge ${stockStatus}">${product.stock}</span></td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function displayPagination(data) {
    const container = document.getElementById('pagination');
    
    if (data.pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div style="display: flex; gap: 5px; justify-content: center;">';
    
    for (let i = 1; i <= data.pages; i++) {
        html += `
            <button class="btn ${i === data.page ? 'btn-primary' : 'btn'}" 
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
    loadProducts();
};

// Search functionality
document.getElementById('searchBtn').addEventListener('click', () => {
    currentSearch = document.getElementById('searchInput').value;
    currentPage = 1;
    loadProducts();
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentSearch = e.target.value;
        currentPage = 1;
        loadProducts();
    }
});

// Category filter
document.getElementById('categoryFilter').addEventListener('change', (e) => {
    currentCategory = e.target.value;
    currentPage = 1;
    loadProducts();
});

// Modal functions
window.openModal = () => {
    document.getElementById('productModal').classList.add('active');
};

window.closeModal = () => {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('modalTitle').textContent = 'Add New Product';
};

// Add product button
document.getElementById('addProductBtn').addEventListener('click', openModal);

// Edit product
window.editProduct = async (id) => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const product = await response.json();
        
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImage').value = product.image || '';
        
        document.getElementById('modalTitle').textContent = 'Edit Product';
        openModal();
        
    } catch (error) {
        console.error('Error fetching product:', error);
        alert('Failed to load product details');
    }
};

// Delete product
window.deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        
        alert('Product deleted successfully');
        loadProducts();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
    }
};

// Save product
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        brand: document.getElementById('productBrand').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value
    };
    
    const saveBtn = document.getElementById('saveProductBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    try {
        let url = `${API_URL}/admin/products`;
        let method = 'POST';
        
        if (productId) {
            url = `${API_URL}/admin/products/${productId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) throw new Error('Failed to save product');
        
        alert(productId ? 'Product updated successfully' : 'Product added successfully');
        closeModal();
        loadProducts();
        
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadProducts);