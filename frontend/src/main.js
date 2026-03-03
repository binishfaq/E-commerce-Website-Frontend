import "./styles/style.css";
import { showCategories } from "./components/Categories.js";
import { updateCartValue } from "./utils/updateCartValue.js";

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("Main.js loaded");
  
  // Display categories on homepage
  showCategories();
  
  // Update cart value from localStorage
  try {
    const cartProducts = JSON.parse(localStorage.getItem('cartProductLS')) || [];
    updateCartValue(cartProducts);
  } catch (e) {
    console.error("Error loading cart:", e);
  }
});