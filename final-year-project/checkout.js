// checkout.js – Complete checkout with auth.js integration
import { isLoggedIn, getCurrentUser, updateUserProfile, saveOrder } from './auth.js';
import { getCartProductFromLS } from "./getCartProducts.js";
import { updateCartValue } from "./updateCartValue.js";

// ========== REDIRECT IF NOT LOGGED IN ==========
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

// ========== LOAD CART ITEMS ==========
const cartProducts = getCartProductFromLS();

if (cartProducts.length === 0) {
  window.location.href = 'addToCart.html';
}

// Import product data (adjust path as needed)
import products from "./api/products.json";

// Enrich cart items with full product details
const cartItems = cartProducts.map(cartItem => {
  const product = products.find(p => p.id === cartItem.id);
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: cartItem.quantity
  };
});

// ========== DISPLAY ORDER SUMMARY ==========
function displayCheckoutItems() {
  const container = document.getElementById('checkoutItems');
  let subtotal = 0;
  let html = '';

  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    html += `
      <div class="checkout-item">
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}">
          <span class="item-quantity">${item.quantity}x</span>
        </div>
        <div class="item-details">
          <h4>${item.name}</h4>
          <p class="item-price">₹${item.price.toLocaleString()} each</p>
        </div>
        <div class="item-total">₹${itemTotal.toLocaleString()}</div>
      </div>
    `;
  });

  container.innerHTML = html;

  const tax = 50;
  const shipping = subtotal > 1000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  document.getElementById('checkoutSubtotal').textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById('shippingCost').textContent = shipping === 0 ? 'Free' : `₹${shipping}`;
  document.getElementById('checkoutTax').textContent = `₹${tax}`;
  document.getElementById('checkoutTotal').textContent = `₹${total.toLocaleString()}`;

  return { subtotal, tax, shipping, total };
}

// ========== PAYMENT FORM TOGGLES & FORMATTING ==========
function setupPaymentMethods() {
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const cardForm = document.getElementById('cardPaymentForm');
  const easypaisaForm = document.getElementById('easypaisaForm');

  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      cardForm.style.display = 'none';
      easypaisaForm.style.display = 'none';

      if (e.target.value === 'card') {
        cardForm.style.display = 'block';
      } else if (e.target.value === 'easypaisa') {
        easypaisaForm.style.display = 'block';
      }
    });
  });

  // Card number formatting
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
      let parts = [];
      for (let i = 0; i < v.length && i < 16; i += 4) {
        parts.push(v.substring(i, i + 4));
      }
      e.target.value = parts.join(' ');
    });
  }

  // Expiry formatting
  const expiryDate = document.getElementById('expiryDate');
  if (expiryDate) {
    expiryDate.addEventListener('input', (e) => {
      let v = e.target.value.replace(/[^0-9]/g, '');
      if (v.length >= 2) {
        e.target.value = v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
      } else {
        e.target.value = v;
      }
    });
  }

  // CVV
  const cvv = document.getElementById('cvv');
  if (cvv) {
    cvv.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 3);
    });
  }

  // Mobile
  const mobileNumber = document.getElementById('mobileNumber');
  if (mobileNumber) {
    mobileNumber.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 11);
    });
  }
}

// ========== PRE-FILL FORM WITH USER DATA ==========
function prefillUserData() {
  const user = getCurrentUser();
  if (!user) return;

  if (document.getElementById('fullName')) {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    document.getElementById('fullName').value = fullName;
  }
  if (document.getElementById('email')) {
    document.getElementById('email').value = user.email || '';
  }
  if (document.getElementById('phone')) {
    document.getElementById('phone').value = user.phone || '';
  }
  if (document.getElementById('address')) {
    document.getElementById('address').value = user.address || '';
  }
  if (document.getElementById('city')) {
    document.getElementById('city').value = user.city || '';
  }
  if (document.getElementById('province')) {
    document.getElementById('province').value = user.province || '';
  }
}

// ========== VALIDATE FORM ==========
function validateForm() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const province = document.getElementById('province').value;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

  if (!fullName || !email || !phone || !address || !city || !province || !paymentMethod) {
    alert('Please fill in all required fields');
    return false;
  }

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return false;
  }

  // Phone (simple)
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 12) {
    alert('Please enter a valid phone number');
    return false;
  }

  // Validate card if selected
  if (paymentMethod === 'card') {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardName = document.getElementById('cardName').value.trim();

    if (!cardNumber || !expiry || !cvv || !cardName) {
      alert('Please fill in all card details');
      return false;
    }
    if (cardNumber.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return false;
    }
    if (cvv.length !== 3) {
      alert('Please enter a valid 3-digit CVV');
      return false;
    }
    // Simple expiry check (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      alert('Please enter expiry in MM/YY format');
      return false;
    }
  }

  // Validate EasyPaisa if selected
  if (paymentMethod === 'easypaisa') {
    const mobile = document.getElementById('mobileNumber').value;
    const otp = document.getElementById('otp').value;
    if (!mobile || !otp) {
      alert('Please enter mobile number and OTP');
      return false;
    }
    if (mobile.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid mobile number');
      return false;
    }
    if (otp.length !== 4) {
      alert('Please enter a valid 4-digit OTP');
      return false;
    }
  }

  return true;
}

// ========== PLACE ORDER ==========
function placeOrder() {
  if (!validateForm()) return;

  const fullName = document.getElementById('fullName').value.trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  // Prepare address object
  const addressObj = {
    street: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    province: document.getElementById('province').value,
    postalCode: document.getElementById('postalCode')?.value.trim() || ''
  };

  // Update user profile with address if logged in
  if (isLoggedIn()) {
    updateUserProfile({
      firstName,
      lastName,
      phone: document.getElementById('phone').value.trim(),
      address: addressObj.street,
      city: addressObj.city,
      province: addressObj.province
    });
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 50;
  const shipping = subtotal > 1000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  // Build order data for saveOrder
  const orderData = {
    items: cartItems.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    subtotal,
    tax,
    shipping,
    total,
    address: {
      fullName,
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      ...addressObj
    },
    paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' :
                    paymentMethod === 'card' ? 'Credit/Debit Card' : 'EasyPaisa/JazzCash',
    notes: document.getElementById('orderNotes')?.value.trim() || ''
  };

  // Save order using auth.js
  const result = saveOrder(orderData);

  if (result.success) {
    // Clear cart
    localStorage.removeItem('cartProductLS');
    updateCartValue([]);

    // Show confirmation modal
    showOrderConfirmation(result.orderId, orderData);
  } else {
    alert('Failed to place order: ' + result.message);
  }
}

// ========== SHOW CONFIRMATION MODAL ==========
function showOrderConfirmation(orderId, orderData) {
  const modal = document.getElementById('orderModal');
  document.getElementById('orderNumber').textContent = orderId;
  document.getElementById('orderPayment').textContent = orderData.paymentMethod;
  document.getElementById('orderAmount').textContent = `₹${orderData.total.toLocaleString()}`;
  document.getElementById('orderAddress').textContent =
    `${orderData.address.street}, ${orderData.address.city}, ${orderData.address.province}`;

  if (orderData.paymentMethod === 'Cash on Delivery') {
    document.getElementById('orderMessage').textContent =
      'Your order has been confirmed! Pay when you receive your items.';
  } else {
    document.getElementById('orderMessage').textContent =
      'Payment successful! Your order has been confirmed.';
  }

  modal.style.display = 'flex';
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
  const totals = displayCheckoutItems();
  setupPaymentMethods();
  prefillUserData();

  document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
});

// Close modal on outside click
window.addEventListener('click', (e) => {
  const modal = document.getElementById('orderModal');
  if (e.target === modal) {
    modal.style.display = 'none';
    window.location.href = 'products.html';
  }
});