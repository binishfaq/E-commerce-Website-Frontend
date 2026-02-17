// orders.js
// Load orders from localStorage
const loadOrders = () => {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const container = document.getElementById('ordersContainer');
  
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="no-orders">
        <i class="fas fa-box-open no-orders-icon"></i>
        <h2>No Orders Yet</h2>
        <p>Looks like you haven't placed any orders yet.</p>
        <a href="products.html" class="btn">Start Shopping</a>
      </div>
    `;
    return;
  }

  // Sort orders by date (newest first)
  orders.sort((a, b) => new Date(b.date) - new Date(a.date));

  let ordersHTML = '';
  
  orders.forEach(order => {
    const date = new Date(order.date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calculate total items
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    // Get status color
    const statusColor = {
      'Confirmed': '#28a745',
      'Shipped': '#17a2b8',
      'Delivered': '#28a745',
      'Cancelled': '#dc3545'
    }[order.status] || '#ffc107';

    ordersHTML += `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3>Order #${order.orderNumber}</h3>
            <p class="order-date"><i class="fas fa-calendar"></i> ${date}</p>
          </div>
          <div class="order-status" style="background-color: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">
            ${order.status}
          </div>
        </div>

        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item">
              <img src="${item.image}" alt="${item.name}" class="order-item-image">
              <div class="order-item-details">
                <h4>${item.name}</h4>
                <p class="order-item-brand">${item.brand || ''}</p>
                <div class="order-item-meta">
                  <span class="item-quantity">Qty: ${item.quantity}</span>
                  <span class="item-price">₹${item.price.toLocaleString()} each</span>
                </div>
              </div>
              <div class="order-item-total">
                ₹${(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="order-footer">
          <div class="order-summary">
            <div class="summary-row">
              <span>Total Items:</span>
              <strong>${totalItems}</strong>
            </div>
            <div class="summary-row">
              <span>Payment Method:</span>
              <strong>${order.paymentMethod}</strong>
            </div>
            <div class="summary-row total">
              <span>Total Amount:</span>
              <strong>₹${order.total.toLocaleString()}</strong>
            </div>
          </div>
          <div class="order-actions">
            <button class="track-order-btn" onclick="trackOrder('${order.orderNumber}')">
              <i class="fas fa-truck"></i> Track Order
            </button>
            <button class="reorder-btn" onclick="reorder('${order.orderNumber}')">
              <i class="fas fa-redo-alt"></i> Reorder
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = ordersHTML;
};

// Track order function - FIXED: pass order number in URL
window.trackOrder = (orderNumber) => {
  window.location.href = `track-order.html?order=${orderNumber}`;
};

// Reorder function
window.reorder = (orderNumber) => {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.orderNumber === orderNumber);
  
  if (order) {
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('cartProductLS')) || [];
    
    // Add items from order to cart
    order.items.forEach(item => {
      const existingItem = cart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
        existingItem.price = item.price * existingItem.quantity;
      } else {
        cart.push({
          id: item.id,
          quantity: item.quantity,
          price: item.price * item.quantity
        });
      }
    });
    
    // Save cart
    localStorage.setItem('cartProductLS', JSON.stringify(cart));
    
    // Update cart value
    import('./updateCartValue.js').then(module => {
      module.updateCartValue(cart);
    });
    
    // Show success message
    alert('Items added to your cart!');
    window.location.href = 'addToCart.html';
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', loadOrders);