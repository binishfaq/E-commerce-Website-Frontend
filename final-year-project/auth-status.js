// auth-status.js
import { getCurrentUser, isLoggedIn } from './auth.js';

// This function runs on EVERY page
const updateAuthStatus = () => {
  const authButtons = document.getElementById('authButtons');
  const nameButton = document.getElementById('nameButton');
  const userNameDisplay = document.getElementById('userNameDisplay');
  
  if (!authButtons || !nameButton) return;
  
  if (isLoggedIn()) {
    // User IS logged in - SHOW NAME BUTTON, hide Sign In/Sign Up
    const user = getCurrentUser();
    
    authButtons.classList.add('hidden');
    nameButton.style.display = 'inline-flex';
    
    // Show user's FIRST NAME on the button
    if (userNameDisplay && user) {
      userNameDisplay.textContent = user.firstName || 'User';
    }
  } else {
    // User is NOT logged in - show Sign In/Sign Up, hide name button
    authButtons.classList.remove('hidden');
    nameButton.style.display = 'none';
  }
};

// Run when page loads
document.addEventListener('DOMContentLoaded', updateAuthStatus);