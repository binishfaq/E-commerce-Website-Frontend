// products.js
import products from "./api/products.json";
import { addToCart } from "./addToCart";
import { homeQuantityToggle } from "./homeQuantityToggle";
import { setupSearch } from "./search.js";

console.log("Products.js loaded");
console.log("Products data:", products);

const productContainer = document.querySelector("#productContainer");
const productTemplate = document.querySelector("#productTemplate");
const categoryTitle = document.querySelector("#categoryTitle");
const productCount = document.querySelector("#productCount");

console.log("Product Container:", productContainer);
console.log("Product Template:", productTemplate);

// Get category from URL
const urlParams = new URLSearchParams(window.location.search);
const selectedCategory = urlParams.get('category');

console.log("Selected Category:", selectedCategory);

// Category display names mapping
const categoryNames = {
  'electronics': 'Electronics',
  'clothing': 'Clothing',
  'sports': 'Sports & Fitness',
  'home-appliances': 'Home Appliances',
  'books': 'Books',
  'beauty': 'Beauty & Personal Care',
  'toys': 'Toys & Games',
  'automotive': 'Automotive',
  'groceries': 'Groceries',
  'furniture': 'Furniture'
};

// Store current products being displayed
let currentProducts = [];
let currentSort = 'default';
let minPrice = 0;
let maxPrice = Infinity;

// Filter products by category
const getProductsByCategory = () => {
  if (selectedCategory && selectedCategory !== 'null') {
    return products.filter(product => product.category === selectedCategory);
  }
  return products;
};

// Update category title
const updateCategoryTitle = () => {
  if (categoryTitle) {
    categoryTitle.textContent = selectedCategory ? 
      (categoryNames[selectedCategory] || selectedCategory) : 
      "All Products";
  }
};

// Sort products function
const sortProducts = (productsToSort, sortType) => {
  const sorted = [...productsToSort];
  
  switch(sortType) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return productsToSort;
  }
};

// Filter by price
const filterByPrice = (productsToFilter) => {
  return productsToFilter.filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  );
};

// Apply both sort and filter
const applySortAndFilter = () => {
  let products = getProductsByCategory();
  products = filterByPrice(products);
  products = sortProducts(products, currentSort);
  showFilteredProducts(products);
};

// Setup sort and filter listeners
const setupSortFilter = () => {
  const sortSelect = document.getElementById('sortProducts');
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const applyBtn = document.getElementById('applyPriceFilter');
  const clearBtn = document.getElementById('clearFilter');
  const activeFilters = document.getElementById('activeFilters');

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applySortAndFilter();
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      minPrice = parseInt(minPriceInput.value) || 0;
      maxPrice = parseInt(maxPriceInput.value) || Infinity;
      applySortAndFilter();
      updateActiveFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      minPriceInput.value = '';
      maxPriceInput.value = '';
      minPrice = 0;
      maxPrice = Infinity;
      currentSort = 'default';
      if (sortSelect) sortSelect.value = 'default';
      applySortAndFilter();
      updateActiveFilters();
    });
  }
};

// Update active filters display
const updateActiveFilters = () => {
  const activeFilters = document.getElementById('activeFilters');
  if (!activeFilters) return;
  
  let filters = [];
  if (minPrice > 0) filters.push(`Min: ₹${minPrice}`);
  if (maxPrice < Infinity) filters.push(`Max: ₹${maxPrice}`);
  
  if (filters.length > 0) {
    activeFilters.innerHTML = `
      <span class="filter-label">Active Filters:</span>
      ${filters.map(f => `<span class="filter-tag">${f}</span>`).join('')}
    `;
  } else {
    activeFilters.innerHTML = '';
  }
};

// Make product cards clickable
const makeProductCardsClickable = () => {
  document.querySelectorAll('.cards').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons or quantity controls
      if (e.target.tagName === 'BUTTON' || e.target.closest('.stockElement')) {
        return;
      }
      
      const id = card.id.replace('card', '');
      window.location.href = `product-details.html?id=${id}`;
    });
  });
};

// Function to display products (can accept filtered products)
const showFilteredProducts = (productsToShow = null) => {
  console.log("showFilteredProducts called");
  
  // Use provided products or get by category
  currentProducts = productsToShow || getProductsByCategory();
  
  // Check if elements exist
  if (!productContainer) {
    console.error("Product container not found!");
    return;
  }
  
  if (!productTemplate) {
    console.error("Product template not found!");
    return;
  }

  // Clear container first
  productContainer.innerHTML = '';
  console.log("Container cleared");

  // Update product count
  if (productCount) {
    productCount.textContent = `${currentProducts.length} Product${currentProducts.length !== 1 ? 's' : ''}`;
  }

  // Check if we have products
  if (!currentProducts || currentProducts.length === 0) {
    console.log("No products found");
    productContainer.innerHTML = `
      <div class="no-products">
        <i class="fas fa-box-open"></i>
        <h3>No Products Found</h3>
        <p>No products available in this category.</p>
        <a href="products.html" class="btn">View All Products</a>
      </div>
    `;
    return;
  }

  console.log(`Rendering ${currentProducts.length} products`);

  currentProducts.forEach((curProd, index) => {
    console.log(`Rendering product ${index + 1}:`, curProd.name);
    
    const { id, name, category, brand, price, originalprice, description, image, stock, rating, reviewCount } = curProd;

    // Clone the template
    const productClone = document.importNode(productTemplate.content, true);

    // Set ID for the card
    const card = productClone.querySelector("#cardValue");
    if (card) card.setAttribute("id", `card${id}`);
    
    // Set category
    const categoryElem = productClone.querySelector(".category");
    if (categoryElem) categoryElem.textContent = category;
    
    // Set product name
    const nameElem = productClone.querySelector(".productName");
    if (nameElem) nameElem.textContent = name;
    
    // Set brand
    const brandElem = productClone.querySelector(".productBrand");
    if (brandElem) brandElem.textContent = brand || '';
    
    // Set image
    const imgElem = productClone.querySelector(".productImage");
    if (imgElem) {
      imgElem.src = image;
      imgElem.alt = name;
    }
    
    // Set stock
    const stockElem = productClone.querySelector(".productStock");
    if (stockElem) stockElem.textContent = stock;
    
    // Set description (truncated)
    const descElem = productClone.querySelector(".productDescription");
    if (descElem) descElem.textContent = description ? description.substring(0, 100) + "..." : "No description available";
    
    // Set prices
    const priceElem = productClone.querySelector(".productPrice");
    if (priceElem) priceElem.textContent = `₹${price ? price.toLocaleString() : '0'}`;
    
    const originalPriceElem = productClone.querySelector(".productActualPrice");
    if (originalPriceElem && originalprice) {
      originalPriceElem.textContent = `₹${originalprice.toLocaleString()}`;
    }
    
    // Calculate and set discount
    if (originalprice && price && originalprice > price) {
      const discount = Math.round(((originalprice - price) / originalprice) * 100);
      const discountElem = productClone.querySelector(".discount-badge");
      if (discountElem) {
        discountElem.textContent = `${discount}% OFF`;
      }
    }

    // Set rating stars
    const ratingContainer = productClone.querySelector(".productRating");
    if (ratingContainer && rating) {
      ratingContainer.innerHTML = '';
      
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      
      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          ratingContainer.innerHTML += '<i class="fa-solid fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
          ratingContainer.innerHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
          ratingContainer.innerHTML += '<i class="fa-regular fa-star"></i>';
        }
      }
      
      if (reviewCount) {
        ratingContainer.innerHTML += `<span> (${reviewCount.toLocaleString()})</span>`;
      }
    }

    // Add event listener for quantity toggle
    const stockElement = productClone.querySelector(".stockElement");
    if (stockElement) {
      stockElement.addEventListener("click", (event) => {
        homeQuantityToggle(event, id, stock);
      });
    }

    // Add event listener for add to cart
    const addToCartBtn = productClone.querySelector(".add-to-cart-button");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", (event) => {
        addToCart(event, id, stock);
      });
    }

    // Append to container
    productContainer.appendChild(productClone);
    console.log(`Product ${index + 1} appended to container`);
  });
  
  // Make cards clickable after rendering
  makeProductCardsClickable();
  
  console.log("All products rendered");
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, calling showFilteredProducts");
  
  // Update category title
  updateCategoryTitle();
  
  // Show initial products
  showFilteredProducts();
  
  // Setup sort and filter
  setupSortFilter();
  
  // Setup search (only if search elements exist)
  if (document.getElementById('searchInput')) {
    console.log("Search elements found, setting up search");
    setupSearch(products, (searchResults) => {
      if (searchResults) {
        // If search results provided, show them
        showFilteredProducts(searchResults);
      } else {
        // Otherwise show category filtered products
        applySortAndFilter();
      }
    });
  } else {
    console.log("Search elements not found - search disabled");
  }
});

// Also call it immediately in case DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showFilteredProducts);
} else {
  console.log("DOM already loaded, calling immediately");
  showFilteredProducts();
}