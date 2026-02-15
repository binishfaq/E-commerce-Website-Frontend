import "./style.css";
import { showCategories } from "./homeCategories";

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("Main.js loaded");
  
  // Display categories on homepage
  showCategories();
  
  // Update cart value from localStorage
  import('./updateCartValue.js').then(module => {
    try {
      const cartProducts = JSON.parse(localStorage.getItem('cartProductLS')) || [];
      module.updateCartValue(cartProducts);
    } catch (e) {
      console.error("Error loading cart:", e);
    }
  }).catch(err => {
    console.error("Error importing updateCartValue:", err);
  });
});