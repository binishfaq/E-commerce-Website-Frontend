// product-details.js
import products from "./api/products.json";
import { addToCart } from "./addToCart";
import { updateCartValue } from "./updateCartValue";

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));

  // Find product
  const product = products.find(p => p.id === productId);

  const container = document.getElementById('productDetailsContainer');
  const reviewsWrapper = document.getElementById('reviewsWrapper');

  if (!product) {
    container.innerHTML = `
      <div class="no-products">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Product Not Found</h3>
        <p>The product you're looking for doesn't exist.</p>
        <a href="products.html" class="btn">Back to Products</a>
      </div>
    `;
    if (reviewsWrapper) reviewsWrapper.style.display = 'none';
  } else {
    // Show reviews section
    if (reviewsWrapper) reviewsWrapper.style.display = 'block';
    
    // Display product details
    const discount = product.originalprice && product.price 
      ? Math.round(((product.originalprice - product.price) / product.originalprice) * 100)
      : 0;

    container.innerHTML = `
      <div class="product-details-card">
        <div class="product-details-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        
        <div class="product-details-info">
          <span class="product-category">${product.category}</span>
          <h1 class="product-title">${product.name}</h1>
          <p class="product-brand">Brand: ${product.brand || 'N/A'}</p>
          
          <div class="product-ratings">
            ${getRatingStars(product.rating)}
            <span class="rating-count">(${product.reviewCount?.toLocaleString() || 0} reviews)</span>
          </div>
          
          <div class="product-prices">
            <span class="current-price">₹${product.price.toLocaleString()}</span>
            ${product.originalprice ? `
              <span class="original-price">₹${product.originalprice.toLocaleString()}</span>
              <span class="discount-badge-large">${discount}% OFF</span>
            ` : ''}
          </div>
          
          <div class="product-stock">
            <i class="fas ${product.stock > 10 ? 'fa-check-circle in-stock' : 'fa-exclamation-circle low-stock'}"></i>
            ${product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
          </div>
          
          <div class="product-description">
            <h3>Description</h3>
            <p>${product.description}</p>
          </div>
          
          ${product.colors?.length ? `
            <div class="product-colors">
              <h3>Colors Available:</h3>
              <div class="color-options">
                ${product.colors.map(color => `
                  <span class="color-tag">${color}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${product.sizes?.length ? `
            <div class="product-sizes">
              <h3>Sizes:</h3>
              <div class="size-options">
                ${product.sizes.map(size => `
                  <span class="size-tag">${size}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="product-quantity-detail">
            <h3>Quantity:</h3>
            <div class="quantity-selector">
              <button class="quantity-btn" id="decrementQty">-</button>
              <input type="number" id="productQty" value="1" min="1" max="${product.stock}">
              <button class="quantity-btn" id="incrementQty">+</button>
            </div>
          </div>
          
          <div class="product-actions">
            <button class="add-to-cart-btn" id="detailsAddToCart">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <button class="buy-now-btn" id="buyNowBtn">
              <i class="fas fa-bolt"></i> Buy Now
            </button>
          </div>
          
          <div class="product-meta">
            <p><i class="fas fa-truck"></i> Free shipping on orders above ₹1000</p>
            <p><i class="fas fa-undo"></i> 30-day return policy</p>
            <p><i class="fas fa-shield-alt"></i> 1 year warranty</p>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    setupQuantityControls(product.stock);
    
    document.getElementById('detailsAddToCart').addEventListener('click', () => {
      const quantity = parseInt(document.getElementById('productQty').value);
      addToCartFromDetails(product, quantity);
    });

    document.getElementById('buyNowBtn').addEventListener('click', () => {
      const quantity = parseInt(document.getElementById('productQty').value);
      addToCartFromDetails(product, quantity);
      window.location.href = 'addToCart.html';
    });

    // Initialize sample reviews for this product
    initializeSampleReviews(product.id);
    
    // Load reviews
    loadReviews(product.id);
    setupReviewForm(product.id);
  }
});

// ========== SAMPLE REVIEWS ==========

// Initialize sample reviews for a product
function initializeSampleReviews(productId) {
  const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
  
  // Only add sample reviews if there are no reviews yet
  if (!allReviews[productId] || allReviews[productId].length === 0) {
    
    // Sample reviews data
    const sampleReviews = [
      {
        id: 1001,
        rating: 5,
        title: "Excellent product!",
        content: "Absolutely love this product! The quality is amazing and it exceeded my expectations. Highly recommended!",
        name: "Ahmed Khan",
        date: new Date(2026, 1, 10).toISOString(), // Feb 10, 2026
        helpful: 24
      },
      {
        id: 1002,
        rating: 4,
        title: "Very good value for money",
        content: "Great product for the price. Works as described. Delivery was fast and packaging was secure.",
        name: "Fatima Ali",
        date: new Date(2026, 1, 8).toISOString(), // Feb 8, 2026
        helpful: 12
      },
      {
        id: 1003,
        rating: 5,
        title: "Best purchase this year!",
        content: "I've been using this for a week now and I'm thoroughly impressed. The quality is top-notch and customer service was excellent.",
        name: "Bilal Ahmed",
        date: new Date(2026, 1, 5).toISOString(), // Feb 5, 2026
        helpful: 31
      },
      {
        id: 1004,
        rating: 4,
        title: "Good product, minor issues",
        content: "Overall satisfied with the purchase. There were some minor issues but customer support resolved them quickly.",
        name: "Sara Malik",
        date: new Date(2026, 1, 1).toISOString(), // Feb 1, 2026
        helpful: 8
      }
    ];
    
    allReviews[productId] = sampleReviews;
    localStorage.setItem('productReviews', JSON.stringify(allReviews));
  }
}

// ========== HELPER FUNCTIONS ==========

// Helper function for rating stars
function getRatingStars(rating) {
  if (!rating) return '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '';
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += '<i class="fa-solid fa-star"></i>';
    } else if (i === fullStars && hasHalfStar) {
      stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    } else {
      stars += '<i class="fa-regular fa-star"></i>';
    }
  }
  return stars;
}

// Setup quantity controls
function setupQuantityControls(maxStock) {
  const qtyInput = document.getElementById('productQty');
  const decrement = document.getElementById('decrementQty');
  const increment = document.getElementById('incrementQty');

  if (!qtyInput || !decrement || !increment) return;

  decrement.addEventListener('click', () => {
    let val = parseInt(qtyInput.value);
    if (val > 1) {
      qtyInput.value = val - 1;
    }
  });

  increment.addEventListener('click', () => {
    let val = parseInt(qtyInput.value);
    if (val < maxStock) {
      qtyInput.value = val + 1;
    }
  });

  qtyInput.addEventListener('change', () => {
    let val = parseInt(qtyInput.value);
    if (val < 1) qtyInput.value = 1;
    if (val > maxStock) qtyInput.value = maxStock;
  });
}

// Add to cart from details page
function addToCartFromDetails(product, quantity) {
  let cart = JSON.parse(localStorage.getItem('cartProductLS')) || [];
  
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = product.price * existingItem.quantity;
  } else {
    cart.push({
      id: product.id,
      quantity: quantity,
      price: product.price * quantity
    });
  }
  
  localStorage.setItem('cartProductLS', JSON.stringify(cart));
  updateCartValue(cart);
  
  // Show toast
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = `✅ Added ${quantity} ${product.name} to cart!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ========== REVIEW SYSTEM ==========

// Load reviews for this product
function loadReviews(productId) {
  const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
  const productReviews = allReviews[productId] || [];
  
  const summaryContainer = document.getElementById('reviewsSummary');
  const listContainer = document.getElementById('reviewsList');
  
  if (!summaryContainer || !listContainer) return;
  
  if (productReviews.length === 0) {
    summaryContainer.innerHTML = `
      <div class="no-reviews-message">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    `;
    listContainer.innerHTML = '';
    return;
  }

  // Calculate average rating
  const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  const ratingCounts = [0, 0, 0, 0, 0];
  productReviews.forEach(r => {
    ratingCounts[r.rating - 1]++;
  });

  // Summary HTML
  summaryContainer.innerHTML = `
    <div class="average-rating">
      <span class="big-rating">${avgRating.toFixed(1)}</span>
      <div class="rating-stars">
        ${getRatingStars(avgRating)}
      </div>
      <span class="total-reviews">${productReviews.length} review${productReviews.length > 1 ? 's' : ''}</span>
    </div>
    <div class="rating-breakdown">
      ${[5,4,3,2,1].map(star => `
        <div class="rating-bar">
          <span>${star} star</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${ratingCounts[star-1] > 0 ? (ratingCounts[star-1] / productReviews.length) * 100 : 0}%"></div>
          </div>
          <span>${ratingCounts[star-1]}</span>
        </div>
      `).join('')}
    </div>
  `;

  // Reviews list HTML - Show all reviews
  listContainer.innerHTML = productReviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="reviewer-info">
          <strong>${review.name}</strong>
          <div class="review-rating">
            ${getRatingStars(review.rating)}
          </div>
        </div>
        <span class="review-date">${new Date(review.date).toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</span>
      </div>
      ${review.title ? `<h4 class="review-title">${review.title}</h4>` : ''}
      <p class="review-content">${review.content}</p>
      <div class="review-actions">
        <button class="helpful-btn" onclick="window.markHelpful(${productId}, ${review.id})">
          <i class="far fa-thumbs-up"></i> Helpful (${review.helpful || 0})
        </button>
      </div>
    </div>
  `).join('');
}

// Setup review form
function setupReviewForm(productId) {
  const writeBtn = document.getElementById('writeReviewBtn');
  const form = document.getElementById('writeReviewForm');
  const cancelBtn = document.getElementById('cancelReviewBtn');
  const submitBtn = document.getElementById('submitReviewBtn');
  const stars = document.querySelectorAll('.star-rating i');
  
  if (!writeBtn || !form || !cancelBtn || !submitBtn) {
    console.log("Review form elements not found");
    return;
  }
  
  let selectedRating = 0;

  // Show form
  writeBtn.addEventListener('click', () => {
    form.style.display = 'block';
    writeBtn.style.display = 'none';
  });

  // Cancel form
  cancelBtn.addEventListener('click', () => {
    form.style.display = 'none';
    writeBtn.style.display = 'block';
    resetReviewForm();
  });

  // Star rating
  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const rating = star.dataset.rating;
      highlightStars(rating);
    });

    star.addEventListener('mouseout', () => {
      highlightStars(selectedRating);
    });

    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.rating);
      highlightStars(selectedRating);
    });
  });

  // Submit review
  submitBtn.addEventListener('click', () => {
    const title = document.getElementById('reviewTitle').value;
    const content = document.getElementById('reviewContent').value;
    const name = document.getElementById('reviewerName').value || 'Anonymous';

    if (selectedRating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!content.trim()) {
      alert('Please write your review');
      return;
    }

    // Save review
    saveReview(productId, {
      id: Date.now(),
      rating: selectedRating,
      title,
      content,
      name,
      date: new Date().toISOString(),
      helpful: 0
    });

    // Reset and hide form
    form.style.display = 'none';
    writeBtn.style.display = 'block';
    resetReviewForm();

    // Reload reviews
    loadReviews(productId);
    
    // Show success message
    alert('Thank you for your review!');
  });

  // Highlight stars helper
  function highlightStars(rating) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.className = 'fa-solid fa-star';
      } else {
        star.className = 'fa-regular fa-star';
      }
    });
  }

  // Reset form
  function resetReviewForm() {
    document.getElementById('reviewTitle').value = '';
    document.getElementById('reviewContent').value = '';
    document.getElementById('reviewerName').value = 'Anonymous';
    selectedRating = 0;
    highlightStars(0);
  }
}

// Save review to localStorage
function saveReview(productId, review) {
  const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
  
  if (!allReviews[productId]) {
    allReviews[productId] = [];
  }
  
  allReviews[productId].push(review);
  localStorage.setItem('productReviews', JSON.stringify(allReviews));
}

// Mark helpful (make it global)
window.markHelpful = (productId, reviewId) => {
  const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
  const reviews = allReviews[productId] || [];
  const review = reviews.find(r => r.id === reviewId);
  
  if (review) {
    review.helpful = (review.helpful || 0) + 1;
    localStorage.setItem('productReviews', JSON.stringify(allReviews));
    loadReviews(productId); // Reload to show updated count
  }
};