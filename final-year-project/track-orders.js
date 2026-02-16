// track-order.js
// Get order number from URL or localStorage
const urlParams = new URLSearchParams(window.location.search);
const orderNumber = urlParams.get('order') || localStorage.getItem('trackingOrder');

// Clear tracking from localStorage
if (!urlParams.get('order')) {
  localStorage.removeItem('trackingOrder');
}

// Load order details
const loadTrackingInfo = () => {
  const container = document.getElementById('trackingContainer');
  
  if (!orderNumber) {
    container.innerHTML = `
      <div class="no-tracking">
        <i class="fas fa-search no-tracking-icon"></i>
        <h2>No Order to Track</h2>
        <p>Please enter a valid order number.</p>
        <div class="tracking-search">
          <input type="text" id="orderSearch" class="tracking-input" placeholder="Enter Order Number">
          <button class="tracking-btn" onclick="searchOrder()">Track</button>
        </div>
        <a href="orders.html" class="btn">View My Orders</a>
      </div>
    `;
    return;
  }

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.orderNumber === orderNumber);

  if (!order) {
    container.innerHTML = `
      <div class="no-tracking">
        <i class="fas fa-exclamation-circle no-tracking-icon" style="color: #dc3545;"></i>
        <h2>Order Not Found</h2>
        <p>No order found with number: ${orderNumber}</p>
        <a href="orders.html" class="btn">View My Orders</a>
      </div>
    `;
    return;
  }

  const date = new Date(order.date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate tracking steps based on order status
  const steps = [
    { status: 'Confirmed', completed: true, date: date },
    { status: 'Processing', completed: order.status !== 'Confirmed' || order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered', date: order.status !== 'Confirmed' ? 'Processing...' : null },
    { status: 'Shipped', completed: order.status === 'Shipped' || order.status === 'Delivered', date: order.status === 'Shipped' || order.status === 'Delivered' ? 'Shipped...' : null },
    { status: 'Delivered', completed: order.status === 'Delivered', date: order.status === 'Delivered' ? 'Delivered!' : null }
  ];

  // Generate estimated delivery
  const orderDate = new Date(order.date);
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days delivery

  const estimatedDelivery = deliveryDate.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  container.innerHTML = `
    <div class="tracking-card">
      <div class="tracking-header">
        <h2>Order #${order.orderNumber}</h2>
        <div class="order-date-tracking">
          <i class="fas fa-calendar"></i> Placed on ${date}
        </div>
      </div>

      <div class="tracking-progress">
        <div class="progress-steps-vertical">
          ${steps.map((step, index) => `
            <div class="progress-step ${step.completed ? 'completed' : ''}">
              <div class="step-indicator">
                ${step.completed ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>'}
              </div>
              <div class="step-content">
                <h4>${step.status}</h4>
                ${step.date ? `<p>${step.date}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="delivery-info-tracking">
        <i class="fas fa-truck"></i>
        <div>
          <h4>Estimated Delivery</h4>
          <p>${estimatedDelivery}</p>
        </div>
      </div>

      <div class="order-summary-tracking">
        <h3>Order Summary</h3>
        <div class="tracking-items">
          ${order.items.map(item => `
            <div class="tracking-item">
              <img src="${item.image}" alt="${item.name}">
              <div class="tracking-item-details">
                <h4>${item.name}</h4>
                <p>Qty: ${item.quantity} × ₹${item.price.toLocaleString()}</p>
              </div>
              <div class="tracking-item-total">
                ₹${(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="tracking-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${order.subtotal.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>${order.shipping === 0 ? 'Free' : '₹' + order.shipping}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>₹${order.tax}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>₹${order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="shipping-address-tracking">
        <h4><i class="fas fa-map-marker-alt"></i> Shipping Address</h4>
        <p>${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.province}</p>
        <p><i class="fas fa-phone"></i> ${order.customer.phone}</p>
      </div>

      <div class="tracking-actions">
        <button class="btn" onclick="window.print()">
          <i class="fas fa-print"></i> Print Details
        </button>
        <a href="products.html" class="btn btn-secondary">
          <i class="fas fa-shopping-bag"></i> Continue Shopping
        </a>
      </div>
    </div>
  `;
};

// Search order function
window.searchOrder = () => {
  const searchInput = document.getElementById('orderSearch');
  if (searchInput.value) {
    window.location.href = `track-order.html?order=${searchInput.value}`;
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', loadTrackingInfo);