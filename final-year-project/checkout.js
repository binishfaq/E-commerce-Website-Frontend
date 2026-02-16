// checkout.js
import { getCartProductFromLS } from "./getCartProducts";
import products from "./api/products.json";
import { isLoggedIn, updateUserProfile, getCurrentUser } from "./auth.js";

// Get cart products
let cartProducts = getCartProductFromLS();

// Get full product details for cart items
const getCartItemsWithDetails = () => {
  return cartProducts.map(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    return {
      ...product,
      quantity: cartItem.quantity,
      cartPrice: cartItem.price
    };
  });
};

const cartItems = getCartItemsWithDetails();

// Display cart items in checkout
const displayCheckoutItems = () => {
  const container = document.getElementById('checkoutItems');
  
  if (cartItems.length === 0) {
    window.location.href = 'addToCart.html';
    return;
  }

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
        <div class="item-total">
          ₹${itemTotal.toLocaleString()}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Update prices
  const tax = 50;
  const shipping = subtotal > 1000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  document.getElementById('checkoutSubtotal').textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById('shippingCost').textContent = shipping === 0 ? 'Free' : `₹${shipping}`;
  document.getElementById('checkoutTax').textContent = `₹${tax}`;
  document.getElementById('checkoutTotal').textContent = `₹${total.toLocaleString()}`;

  return { subtotal, tax, shipping, total };
};

// Format card number with spaces
const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];

  for (let i = 0; i < match.length; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

// Format expiry date
const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
  }
  return v;
};

// Toggle payment forms
const setupPaymentMethods = () => {
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const cardForm = document.getElementById('cardPaymentForm');
  const easypaisaForm = document.getElementById('easypaisaForm');

  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      // Hide all forms
      cardForm.style.display = 'none';
      easypaisaForm.style.display = 'none';

      // Show selected form
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
      e.target.value = formatCardNumber(e.target.value);
    });
  }

  // Expiry date formatting
  const expiryDate = document.getElementById('expiryDate');
  if (expiryDate) {
    expiryDate.addEventListener('input', (e) => {
      e.target.value = formatExpiry(e.target.value);
    });
  }

  // CVV number only
  const cvv = document.getElementById('cvv');
  if (cvv) {
    cvv.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 3);
    });
  }

  // Mobile number only
  const mobileNumber = document.getElementById('mobileNumber');
  if (mobileNumber) {
    mobileNumber.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 11);
    });
  }

  // ===== PRE-FILL FORM WITH USER DATA IF LOGGED IN =====
  if (isLoggedIn()) {
    const user = getCurrentUser();
    if (user) {
      // Split full name from user data
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Pre-fill form fields
      if (document.getElementById('fullName')) {
        document.getElementById('fullName').value = fullName || '';
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
  }
};

// Validate form
const validateForm = () => {
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const province = document.getElementById('province').value;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (!fullName || !email || !phone || !address || !city || !province) {
    alert('Please fill in all required fields');
    return false;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return false;
  }

  // Validate phone (Pakistan format)
  const phoneRegex = /^(\+92|0|92)?[0-9]{10}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    alert('Please enter a valid Pakistani phone number');
    return false;
  }

  // Validate card if selected
  if (paymentMethod === 'card') {
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardName = document.getElementById('cardName').value;

    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      alert('Please fill in all card details');
      return false;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return false;
    }

    if (cvv.length !== 3) {
      alert('Please enter a valid 3-digit CVV');
      return false;
    }
  }

  // Validate EasyPaisa if selected
  if (paymentMethod === 'easypaisa') {
    const mobileNumber = document.getElementById('mobileNumber').value;
    const otp = document.getElementById('otp').value;

    if (!mobileNumber || !otp) {
      alert('Please enter mobile number and OTP');
      return false;
    }

    if (mobileNumber.length < 10) {
      alert('Please enter a valid mobile number');
      return false;
    }

    if (otp.length !== 4) {
      alert('Please enter a valid 4-digit OTP');
      return false;
    }
  }

  return true;
};

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `EASE-${year}-${random}`;
};

// ===== NEW FUNCTION: Save address to user profile =====
const saveAddressToProfile = () => {
  if (!isLoggedIn()) return false;
  
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const province = document.getElementById('province').value;
  const phone = document.getElementById('phone').value;
  
  // Split full name into first and last
  const fullName = document.getElementById('fullName').value;
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  // Update user profile
  const result = updateUserProfile({
    firstName: firstName,
    lastName: lastName,
    phone: phone,
    address: address,
    city: city,
    province: province
  });
  
  return result.success;
};

// Place order
const placeOrder = () => {
  if (!validateForm()) return;

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const fullName = document.getElementById('fullName').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const province = document.getElementById('province').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const orderNotes = document.getElementById('orderNotes').value;

  // Split full name
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 50;
  const shipping = subtotal > 1000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  // ===== SAVE ADDRESS TO PROFILE IF LOGGED IN =====
  if (isLoggedIn()) {
    saveAddressToProfile();
  }

  // Create order object
  const order = {
    orderNumber: generateOrderNumber(),
    date: new Date().toISOString(),
    customer: {
      name: fullName,
      email: email,
      phone: phone
    },
    shippingAddress: {
      address: address,
      city: city,
      province: province
    },
    paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 
                   paymentMethod === 'card' ? 'Credit/Debit Card' : 'EasyPaisa/JazzCash',
    items: cartItems,
    subtotal: subtotal,
    tax: tax,
    shipping: shipping,
    total: total,
    notes: orderNotes,
    status: 'Confirmed'
  };

  // Save order to localStorage
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Clear cart
  localStorage.removeItem('cartProductLS');

  // Show confirmation modal
  showOrderConfirmation(order);

  // Update cart value
  import('./updateCartValue.js').then(module => {
    module.updateCartValue([]);
  });
};

// Show order confirmation
const showOrderConfirmation = (order) => {
  const modal = document.getElementById('orderModal');
  const orderNumber = document.getElementById('orderNumber');
  const orderPayment = document.getElementById('orderPayment');
  const orderAmount = document.getElementById('orderAmount');
  const orderAddress = document.getElementById('orderAddress');
  const orderMessage = document.getElementById('orderMessage');

  orderNumber.textContent = order.orderNumber;
  orderPayment.textContent = order.paymentMethod;
  orderAmount.textContent = `₹${order.total.toLocaleString()}`;
  orderAddress.textContent = `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.province}`;

  if (order.paymentMethod === 'Cash on Delivery') {
    orderMessage.textContent = 'Your order has been confirmed! Pay when you receive your items.';
  } else {
    orderMessage.textContent = 'Payment successful! Your order has been confirmed.';
  }

  modal.style.display = 'flex';
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  displayCheckoutItems();
  setupPaymentMethods();

  const placeOrderBtn = document.getElementById('placeOrderBtn');
  placeOrderBtn.addEventListener('click', placeOrder);
});

// Close modal when clicking outside
window.onclick = (event) => {
  const modal = document.getElementById('orderModal');
  if (event.target === modal) {
    modal.style.display = 'none';
    window.location.href = 'products.html';
  }
};