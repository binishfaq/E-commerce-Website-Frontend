// navbar-profile.js
import { getCurrentUser, isLoggedIn, logout } from './auth.js';

// Function to update top bar based on login status
export const updateTopBarForAuth = () => {
  const signInUpDiv = document.querySelector('.sing_in_up');
  const topBarProfile = document.getElementById('topBarProfile');
  
  if (!signInUpDiv) return;
  
  if (isLoggedIn()) {
    // Hide regular sign in/up, show profile button
    signInUpDiv.classList.add('profile-hidden');
    
    // Create profile button if it doesn't exist
    if (!topBarProfile) {
      createProfileButton(signInUpDiv);
    } else {
      updateProfileButton();
    }
  } else {
    // Show regular sign in/up, hide profile button
    signInUpDiv.classList.remove('profile-hidden');
    if (topBarProfile) {
      topBarProfile.remove();
    }
  }
};

// Create profile button in top bar
const createProfileButton = (signInUpDiv) => {
  const user = getCurrentUser();
  if (!user) return;
  
  const profileHTML = `
    <div class="top-bar-profile" id="topBarProfile">
      <div class="profile-top-btn" id="topBarProfileTrigger">
        <i class="fas fa-user-circle"></i>
        <span id="topBarProfileName">${user.firstName || 'Account'}</span>
        <i class="fas fa-chevron-down"></i>
      </div>
      
      <!-- Dropdown -->
      <div class="top-bar-dropdown" id="topBarProfileDropdown">
        <div class="top-bar-dropdown-header">
          <div class="top-bar-avatar" id="topBarAvatar">
            ${(user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '') || 'U'}
          </div>
          <div class="top-bar-user-info">
            <h4 id="topBarFullName">${user.firstName || ''} ${user.lastName || ''}</h4>
            <p id="topBarEmail">${user.email || ''}</p>
          </div>
        </div>
        
        <div class="top-bar-dropdown-body">
          <div class="top-bar-dropdown-item">
            <i class="fas fa-user"></i>
            <div>
              <span class="item-label">First Name</span>
              <span class="item-value" id="topBarFirstName">${user.firstName || 'Not set'}</span>
            </div>
          </div>
          
          <div class="top-bar-dropdown-item">
            <i class="fas fa-user-tag"></i>
            <div>
              <span class="item-label">Last Name</span>
              <span class="item-value" id="topBarLastName">${user.lastName || 'Not set'}</span>
            </div>
          </div>
          
          <div class="top-bar-dropdown-item">
            <i class="fas fa-envelope"></i>
            <div>
              <span class="item-label">Email</span>
              <span class="item-value" id="topBarEmailFull">${user.email || 'Not set'}</span>
            </div>
          </div>
          
          <div class="top-bar-dropdown-item">
            <i class="fas fa-phone"></i>
            <div>
              <span class="item-label">Phone</span>
              <span class="item-value" id="topBarPhone">${user.phone || 'Not set'}</span>
            </div>
          </div>
        </div>
        
        <div class="top-bar-dropdown-footer">
          <a href="profile.html" class="top-bar-profile-btn">
            <i class="fas fa-user"></i> Profile
          </a>
          <button class="top-bar-logout-btn" id="topBarLogoutBtn">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Insert after the existing sign_in_up div
  signInUpDiv.insertAdjacentHTML('afterend', profileHTML);
  
  // Add event listeners
  setupProfileDropdown();
};

// Update profile button with latest user data
const updateProfileButton = () => {
  const user = getCurrentUser();
  if (!user) return;
  
  const profileName = document.getElementById('topBarProfileName');
  const fullName = document.getElementById('topBarFullName');
  const email = document.getElementById('topBarEmail');
  const avatar = document.getElementById('topBarAvatar');
  const firstName = document.getElementById('topBarFirstName');
  const lastName = document.getElementById('topBarLastName');
  const emailFull = document.getElementById('topBarEmailFull');
  const phone = document.getElementById('topBarPhone');
  
  if (profileName) profileName.textContent = user.firstName || 'Account';
  if (fullName) fullName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  if (email) email.textContent = user.email || '';
  if (avatar) {
    const initials = (user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '');
    avatar.textContent = initials || 'U';
  }
  if (firstName) firstName.textContent = user.firstName || 'Not set';
  if (lastName) lastName.textContent = user.lastName || 'Not set';
  if (emailFull) emailFull.textContent = user.email || 'Not set';
  if (phone) phone.textContent = user.phone || 'Not set';
};

// Setup dropdown toggle
const setupProfileDropdown = () => {
  const trigger = document.getElementById('topBarProfileTrigger');
  const dropdown = document.getElementById('topBarProfileDropdown');
  const logoutBtn = document.getElementById('topBarLogoutBtn');
  
  if (!trigger || !dropdown) return;
  
  // Toggle dropdown
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });
  
  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
  
  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      window.location.reload();
    });
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateTopBarForAuth);

// Also run when page changes (for SPA-like behavior)
window.addEventListener('popstate', updateTopBarForAuth);