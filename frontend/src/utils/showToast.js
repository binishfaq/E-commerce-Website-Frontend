export function showToast(operation, id) {
  const toast = document.createElement("div");
  toast.classList.add("toast");

  if (operation === "add") {
    toast.textContent = `Item added to your EaseShop cart!`;
  } else {
    toast.textContent = `Item removed from your EaseShop cart.`;
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}