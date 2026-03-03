const footerHTML = `
  <footer class="section-footer">
    <div class="footer-top-border"></div>
    
    <div class="footer-container container">
      <!-- Brand Section - Like ZainHub -->
      <div class="footer-section brand-section">
        <a href="index.html" class="text-logo floating">
          Ease<span>Shop</span>
        </a>
        <p class="brand-description">
          Your premier destination for quality products at unbeatable prices. 
          Shop with confidence and enjoy a seamless shopping experience.
        </p>
        
        <!-- Social Links from ZainHub -->
        <div class="social-links">
          <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
          <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
        </div>
      </div>

      <!-- Quick Links Section - From ZainHub -->
      <div class="footer-section">
        <h4>Quick Links</h4>
        <ul class="footer-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="products.html">Shop by Category</a></li>
          <li><a href="#" onclick="showNotification('Account page coming soon!', 'info')">My Account</a></li>
          <li><a href="addToCart.html">Shopping Cart</a></li>
          <li><a href="#" onclick="showNotification('Orders page coming soon!', 'info')">My Orders</a></li>
        </ul>
      </div>

      <!-- Customer Service Section - From ZainHub -->
      <div class="footer-section">
        <h4>Customer Service</h4>
        <ul class="footer-links">
          <li><a href="#" onclick="showNotification('FAQ page coming soon!', 'info')">FAQ</a></li>
          <li><a href="#" onclick="showNotification('Shipping policy coming soon!', 'info')">Shipping Policy</a></li>
          <li><a href="#" onclick="showNotification('Returns policy coming soon!', 'info')">Returns & Refunds</a></li>
          <li><a href="#" onclick="showNotification('Privacy policy coming soon!', 'info')">Privacy Policy</a></li>
          <li><a href="#" onclick="showNotification('Terms of service coming soon!', 'info')">Terms of Service</a></li>
        </ul>
      </div>

      <!-- Contact Section  -->
      <div class="footer-section">
        <h4>Contact Us</h4>
        <ul class="contact-info">
          <li>
            <i class="fas fa-map-marker-alt"></i>
            <span>MNS University Agriculture Multan</span>
          </li>
          <li>
            <i class="fas fa-phone"></i>
            <span>+92 3xxxxxxx</span>
          </li>
          <li>
            <i class="fas fa-envelope"></i>
            <span>support@easeshop.com</span>
          </li>
          <li>
            <i class="fas fa-clock"></i>
            <span>24/7 Available</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer Bottom with Payment Methods - From ZainHub -->
    <div class="footer-bottom">
      <div class="container">
        <div class="payment-methods">
          <span>Payment Methods:</span>
          <i class="fab fa-cc-visa" title="Visa"></i>
          <i class="fab fa-cc-mastercard" title="Mastercard"></i>
          <i class="fab fa-cc-amex" title="American Express"></i>
          <i class="fab fa-cc-paypal" title="PayPal"></i>
          <i class="fab fa-cc-discover" title="Discover"></i>
        </div>
        
        <div class="copyright">
          <p>&copy; 2026 EaseShop - FYP Project. All rights reserved. | Designed  for online shopping by Zain Bin Ishfaq. <i class="fas fa-heart" style="color: var(--coral-accent);"></i></p>
        </div>
      </div>
    </div>
  </footer>`;

const footerElem = document.querySelector(".section-footer");
if (footerElem) {
  footerElem.innerHTML = footerHTML;
}

// Simple notification function (add this to your main.js or keep in footer)
window.showNotification = function(message, type = 'info') {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};