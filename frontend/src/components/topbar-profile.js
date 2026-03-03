// topbar-profile.js
import { getCurrentUser, isLoggedIn } from './auth.js';

// Update top bar based on login status
const updateTopBar = () => {
  const authButtons = document.getElementById('authButtons');
  const profileContainer = document.getElementById('profileBtnContainer');
  const profileText = document.getElementById('profileBtnText');
  
  if (!authButtons || !profileContainer) return;
  
  if (isLoggedIn()) {
    // User is logged in - show profile button, hide auth buttons
    const user = getCurrentUser();
    
    authButtons.classList.add('hidden');
    profileContainer.style.display = 'inline-block';
    
    if (profileText && user) {
      profileText.textContent = user.firstName || 'My Profile';
    }
  } else {
    // User is logged out - show auth buttons, hide profile button
    authButtons.classList.remove('hidden');
    profileContainer.style.display = 'none';
  }
};

// Run when page loads
document.addEventListener('DOMContentLoaded', updateTopBar);

// Run when auth state changes (login/logout in another tab)
window.addEventListener('storage', (e) => {
  if (e.key === 'easeshop_session') {
    updateTopBar();
  }
});