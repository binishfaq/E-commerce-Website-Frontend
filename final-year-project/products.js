// products.js
import products from "./api/products.json";
import { addToCart } from "./addToCart";
import { homeQuantityToggle } from "./homeQuantityToggle";

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

// Map old category names to new ones (if needed)
const categoryMapping = {
  'Computers': 'electronics',
  'Mobiles': 'electronics',
  'Audio': 'electronics',
  'Wearables': 'electronics',
  'Video': 'electronics'
};

// Filter products by category
let filteredProducts = products;

if (selectedCategory && selectedCategory !== 'null') {
  filteredProducts = products.filter(product => {
    // Check if product category matches selected category
    // Also check mapped categories
    const productCat = product.category.toLowerCase();
    return productCat === selectedCategory || 
           categoryMapping[product.category] === selectedCategory;
  });
  console.log(`Filtered products for ${selectedCategory}:`, filteredProducts);
}

// Update category title and product count
if (categoryTitle) {
  categoryTitle.textContent = selectedCategory ? 
    (categoryNames[selectedCategory] || selectedCategory) : 
    "All Products";
}

if (productCount) {
  productCount.textContent = `${filteredProducts.length} Product${filteredProducts.length !== 1 ? 's' : ''}`;
}

// Function to display products
const showFilteredProducts = () => {
  console.log("showFilteredProducts called");
  
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

  // Check if we have products
  if (!filteredProducts || filteredProducts.length === 0) {
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

  console.log(`Rendering ${filteredProducts.length} products`);

  filteredProducts.forEach((curProd, index) => {
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
  
  console.log("All products rendered");
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, calling showFilteredProducts");
  showFilteredProducts();
});

// Also call it immediately in case DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showFilteredProducts);
} else {
  console.log("DOM already loaded, calling immediately");
  showFilteredProducts();
}