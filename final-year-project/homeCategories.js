// homeCategories.js
import categoriesData from "./api/categories.json";

const categoriesContainer = document.querySelector("#categoriesContainer");
const categoriesTemplate = document.querySelector("#categoriesTemplate");

export const showCategories = () => {
  if (!categoriesContainer || !categoriesTemplate) {
    console.error("Categories container or template not found");
    return;
  }

  // Check if categoriesData has the expected structure
  const categories = categoriesData.categories || [];
  
  if (categories.length === 0) {
    console.error("No categories found");
    return;
  }

  categories.forEach((category, index) => {
    const { id, name, description, image } = category;
    
    const categoryClone = document.importNode(categoriesTemplate.content, true);
    
    const card = categoryClone.querySelector(".category-card");
    card.setAttribute("data-category-id", id);
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", (index * 50).toString());
    
    const img = categoryClone.querySelector(".category-image");
    if (img) {
      img.src = image;
      img.alt = name;
    }
    
    const nameElem = categoryClone.querySelector(".category-name");
    if (nameElem) nameElem.textContent = name;
    
    const descElem = categoryClone.querySelector(".category-description");
    if (descElem) descElem.textContent = description;
    
    // Add click event to navigate to products page with category filter
    card.addEventListener("click", () => {
      window.location.href = `products.html?category=${id}`;
    });
    
    const link = categoryClone.querySelector(".category-link");
    if (link) {
      link.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `products.html?category=${id}`;
      });
    }
    
    categoriesContainer.appendChild(categoryClone);
  });
};