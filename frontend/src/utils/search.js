// search.js - Fixed version with working filters
export const setupSearch = (products, renderFunction) => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchStatus = document.getElementById('searchStatus');
  const filterChips = document.querySelectorAll('.filter-chip'); // Changed from filterRadios
  const searchSection = document.querySelector('.search-section');
  
  if (!searchInput || !searchBtn || !searchStatus) {
    console.error("Search elements not found!");
    return;
  }
  
  let currentFilter = 'all'; // Default filter
  
  // Set up filter chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      // Remove active class from all chips
      filterChips.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked chip
      chip.classList.add('active');
      
      // Get filter value from data-filter attribute
      currentFilter = chip.dataset.filter || 'all';
      console.log("Filter changed to:", currentFilter);
      
      // Re-run search with new filter
      if (searchInput.value.trim().length >= 2) {
        performSearch();
      }
    });
  });
  
  // Create suggestions container
  let suggestionsContainer = document.createElement('div');
  suggestionsContainer.id = 'searchSuggestions';
  suggestionsContainer.className = 'search-suggestions';
  searchInput.parentNode.appendChild(suggestionsContainer);
  
  // Create popular searches container
  const createPopularSearches = () => {
    const popularContainer = document.createElement('div');
    popularContainer.className = 'popular-searches';
    
    popularContainer.innerHTML = `
      <div class="popular-searches-header">
        <i class="fas fa-fire"></i>
        <h4>Popular Searches</h4>
        <span class="trending-badge">
          <i class="fas fa-chart-line"></i> Trending Now
        </span>
      </div>
      <div class="popular-tags-grid">
        <span class="popular-tag" data-term="laptop">
          <i class="fas fa-laptop"></i> laptop
        </span>
        <span class="popular-tag" data-term="smartphone">
          <i class="fas fa-mobile-alt"></i> smartphone
        </span>
        <span class="popular-tag" data-term="headphones">
          <i class="fas fa-headphones"></i> headphones
        </span>
        <span class="popular-tag" data-term="sony">
          <i class="fas fa-camera"></i> sony
        </span>
        <span class="popular-tag" data-term="nike">
          <i class="fas fa-shoe-prints"></i> nike
        </span>
        <span class="popular-tag" data-term="apple">
          <i class="fab fa-apple"></i> apple
        </span>
        <span class="popular-tag" data-term="adjustable">
          <i class="fas fa-sliders-h"></i> adjustable
        </span>
      </div>
    `;
    
    setTimeout(() => {
      popularContainer.querySelectorAll('.popular-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          searchInput.value = tag.dataset.term;
          performSearch();
        });
      });
    }, 100);
    
    return popularContainer;
  };
  
  // Add popular searches
  const addPopularSearches = () => {
    const searchBox = document.querySelector('.search-box');
    if (searchBox && !document.querySelector('.popular-searches')) {
      const popularSearches = createPopularSearches();
      searchBox.appendChild(popularSearches);
    }
  };
  
  // Get all unique searchable terms
  const getAllSearchTerms = () => {
    const terms = new Set();
    products.forEach(product => {
      // Add product name words
      product.name.toLowerCase().split(' ').forEach(word => {
        if (word.length > 1) terms.add(word);
      });
      
      // Add brand
      if (product.brand) {
        terms.add(product.brand.toLowerCase());
      }
      
      // Add category
      if (product.category) {
        terms.add(product.category.toLowerCase());
      }
    });
    
    // Add specific terms
    const specificTerms = ['20l', 'adjustable', 'apple', 'ashley', 'bertolli', 'bowflex', 'charlotte', 'classic'];
    specificTerms.forEach(term => terms.add(term));
    
    return Array.from(terms).sort();
  };
  
  const searchTerms = getAllSearchTerms();
  
  // Show suggestions
  const showSuggestions = (inputValue) => {
    if (inputValue.length < 1) {
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.classList.remove('active');
      return;
    }
    
    const matches = searchTerms
      .filter(term => term.includes(inputValue.toLowerCase()))
      .slice(0, 8);
    
    if (matches.length > 0) {
      suggestionsContainer.innerHTML = `
        <div class="suggestions-header">
          <h4><i class="fas fa-search"></i> Suggestions</h4>
          <span>${matches.length} found</span>
        </div>
        <div class="suggestions-grid">
          ${matches.map(term => `
            <span class="suggestion-item" data-term="${term}">
              <i class="fas fa-search"></i>
              <span>${term}</span>
            </span>
          `).join('')}
        </div>
      `;
      suggestionsContainer.classList.add('active');
      
      suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          searchInput.value = item.dataset.term;
          suggestionsContainer.classList.remove('active');
          performSearch();
        });
      });
    } else {
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.classList.remove('active');
    }
  };
  
  // Perform search with current filter
  const performSearch = () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    suggestionsContainer.classList.remove('active');
    
    if (searchTerm === '') {
      searchStatus.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>Type at least 2 characters to search</span>
      `;
      renderFunction();
      return;
    }
    
    if (searchTerm.length < 2) {
      searchStatus.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>Please type at least 2 characters</span>
      `;
      renderFunction();
      return;
    }
    
    // Filter products based on selected filter
    const filteredProducts = products.filter(product => {
      switch(currentFilter) {
        case 'name':
          return product.name.toLowerCase().includes(searchTerm);
          
        case 'brand':
          return product.brand && product.brand.toLowerCase().includes(searchTerm);
          
        case 'description':
          return product.description && product.description.toLowerCase().includes(searchTerm);
          
        case 'all':
        default:
          return (
            product.name.toLowerCase().includes(searchTerm) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.category && product.category.toLowerCase().includes(searchTerm))
          );
      }
    });
    
    // Update status
    if (filteredProducts.length === 0) {
      searchStatus.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>No products found matching "<strong>${searchInput.value}</strong>" in <strong>${currentFilter}</strong></span>
      `;
    } else {
      searchStatus.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Found <strong>${filteredProducts.length}</strong> product${filteredProducts.length !== 1 ? 's' : ''} matching "<strong>${searchInput.value}</strong>" in <strong>${currentFilter}</strong></span>
      `;
    }
    
    renderFunction(filteredProducts);
  };
  
  // Event listeners
  searchBtn.addEventListener('click', () => {
    if (searchInput.value.trim().length >= 2) {
      performSearch();
    } else {
      searchStatus.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>Please type at least 2 characters</span>
      `;
    }
  });
  
  searchInput.addEventListener('input', () => {
    const value = searchInput.value.trim();
    
    if (value.length >= 1) {
      showSuggestions(value);
    } else {
      suggestionsContainer.classList.remove('active');
    }
    
    clearTimeout(searchTimeout);
    
    if (value.length >= 2) {
      searchTimeout = setTimeout(performSearch, 300);
    } else if (value.length === 0) {
      searchStatus.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>Type at least 2 characters to search</span>
      `;
      renderFunction();
    }
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchInput.value.trim().length >= 2) {
        performSearch();
        suggestionsContainer.classList.remove('active');
      }
    }
  });
  
  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target) && !searchBtn.contains(e.target)) {
      suggestionsContainer.classList.remove('active');
    }
  });
  
  // Add popular searches
  setTimeout(addPopularSearches, 500);
  
  console.log("Search setup complete with working filters");
};