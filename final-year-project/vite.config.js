// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        contact: resolve(__dirname, "contact.html"),
        products: resolve(__dirname, "products.html"),
        addToCart: resolve(__dirname, "addToCart.html"),
        productDetails: resolve(__dirname, "product-details.html"),
        checkout: resolve(__dirname, "checkout.html"),
        orders: resolve(__dirname, "orders.html"),
        trackOrder: resolve(__dirname, "track-order.html"),
        // New auth pages
        login: resolve(__dirname, "login.html"),
        signup: resolve(__dirname, "signup.html"),
        profile: resolve(__dirname, "profile.html"),
        forgotPassword: resolve(__dirname, "forgot-password.html"),
        resetPassword: resolve(__dirname, "reset-password.html"),
      },
    },
  },
});