const cartValue = document.querySelector("#cartValue");

export const updateCartValue = (cartProducts) => {
  if (cartValue) {
    cartValue.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> <span>${cartProducts.length}</span>`;
  }
  return cartProducts.length;
};