// auth-status.js
import { isLoggedIn, getCurrentUser } from './auth.js';

function updateAuthUI() {
  const authButtons = document.getElementById('authButtons');
  const nameButton = document.getElementById('nameButton');
  const userNameSpan = document.getElementById('userNameDisplay');

  if (!authButtons || !nameButton || !userNameSpan) return;

  if (isLoggedIn()) {
    authButtons.classList.add('hidden');
    nameButton.style.display = 'inline-flex';
    const user = getCurrentUser();
    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
      userNameSpan.textContent = fullName;
    }
  } else {
    authButtons.classList.remove('hidden');
    nameButton.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', updateAuthUI);
window.addEventListener('popstate', updateAuthUI);