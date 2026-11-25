const CART_KEY = "campusCafeCart";

let cart = loadCart();
let category = "all";
let query = "";

const menuGrid = document.getElementById("menuGrid");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const cartBadge = document.getElementById("cartBadge");
const cartMsg = document.getElementById("cartMsg");

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    return saved.filter(c => MENU_ITEMS.some(i => i.id === c.id) && c.qty > 0);
  } catch (e) {
    return [];
  }
}

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
}

function renderMenu() {
  const items = MENU_ITEMS.filter(i =>
    (category === "all" || i.category === category) &&
    i.name.toLowerCase().includes(query)
  );
  menuGrid.innerHTML = items.length
    ? items.map(i => `
      <article class="card">
        <img src="${i.image}" alt="${i.name}">
        <div class="card-header"><h3>${i.name}</h3><span class="price">₹${i.price}</span></div>
        <span class="category-tag" style="align-self:flex-start">${i.category}</span>
        <p>${i.description}</p>
        <button class="btn btn-primary" data-add="${i.id}">Add to Cart</button>
      </article>`).join("")
    : '<p class="empty-state">No items match your search.</p>';
}

function renderCart() {
  let total = 0, count = 0;
  cartList.innerHTML = cart.length
    ? cart.map(c => {
        const item = MENU_ITEMS.find(i => i.id === c.id);
        total += item.price * c.qty;
        count += c.qty;
        return `
        <li class="cart-row">
          <span>${item.name}</span>
          <span class="qty-controls">
            <button class="qty-btn" data-dec="${c.id}">−</button>
            <span>${c.qty}</span>
            <button class="qty-btn" data-inc="${c.id}">+</button>
          </span>
          <strong>₹${item.price * c.qty}</strong>
        </li>`;
      }).join("")
    : '<li class="empty-state">Your cart is empty.</li>';
  cartTotal.textContent = "₹" + total;
  cartBadge.textContent = `Cart: ${count} items`;
}

function changeQty(id, delta) {
  const row = cart.find(c => c.id === id);
  if (!row) {
    if (delta > 0) cart.push({ id, qty: 1 });
  } else {
    row.qty += delta;
    if (row.qty <= 0) cart = cart.filter(c => c.id !== id);
  }
  saveCart();
  cartMsg.textContent = "";
  renderCart();
}

menuGrid.addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if (btn) changeQty(Number(btn.dataset.add), 1);
});

cartList.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.inc) changeQty(Number(btn.dataset.inc), 1);
  if (btn.dataset.dec) changeQty(Number(btn.dataset.dec), -1);
});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    category = btn.dataset.category;
    renderMenu();
  });
});

document.getElementById("search").addEventListener("input", e => {
  query = e.target.value.trim().toLowerCase();
  renderMenu();
});

document.getElementById("checkoutBtn").addEventListener("click", e => {
  if (!cart.length) {
    e.preventDefault();
    cartMsg.textContent = "Your cart is empty. Add something from the menu first.";
  }
});

renderMenu();
renderCart();
