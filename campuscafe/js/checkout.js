const CART_KEY = "campusCafeCart";
const PROMO = { code: "STUDENT15", rate: 0.15, min: 150 };

let discount = 0;
const $ = id => document.getElementById(id);
const money = n => "₹" + n.toFixed(2);

function loadItems() {
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) {}
  return saved
    .map(c => {
      const item = MENU_ITEMS.find(m => m.id === c.id);
      return item ? { ...item, qty: Number(c.qty) || 0 } : null;
    })
    .filter(i => i && i.qty > 0);
}

let items = loadItems();
const subtotal = () => items.reduce((s, i) => s + i.price * i.qty, 0);

function render() {
  $("orderList").innerHTML = items.length
    ? items.map(i => `<li class="cart-row"><span>${i.name} × ${i.qty}</span><strong>${money(i.price * i.qty)}</strong></li>`).join("")
    : '<li class="empty-state">Your cart is empty.</li>';
  const sub = subtotal();
  $("subtotal").textContent = money(sub);
  $("discount").textContent = "−" + money(discount);
  $("grandTotal").textContent = money(sub - discount);
}

$("applyPromo").addEventListener("click", () => {
  const code = $("promoInput").value.trim().toUpperCase();
  const msg = $("promoMsg");
  const sub = subtotal();
  discount = 0;
  msg.className = "msg-error";
  if (code !== PROMO.code) {
    msg.textContent = "Invalid promo code.";
  } else if (sub < PROMO.min) {
    msg.textContent = `${PROMO.code} needs a subtotal of ₹${PROMO.min} or more.`;
  } else {
    discount = Math.round(sub * PROMO.rate * 100) / 100;
    msg.className = "msg-success";
    msg.textContent = `${PROMO.code} applied. You saved ${money(discount)}.`;
  }
  render();
});

$("orderForm").addEventListener("submit", e => {
  e.preventDefault();
  const msg = $("formMsg");
  msg.className = "msg-error";
  const name = $("fullName").value.trim();
  const roll = $("rollNo").value.trim();

  if (!items.length) { msg.textContent = "Your cart is empty. Nothing to order."; return; }
  if (!name || !roll) { msg.textContent = "Please enter both your Full Name and Roll Number."; return; }

  const total = subtotal() - discount;
  const orderId = "CC-" + Date.now().toString(36).toUpperCase();
  try { localStorage.removeItem(CART_KEY); } catch (err) {}
  items = [];
  discount = 0;
  render();
  msg.className = "msg-success";
  msg.textContent = `Thank you, ${name}! Order ${orderId} is confirmed. Amount paid: ${money(total)}.`;
  $("orderForm").querySelector("button[type=submit]").disabled = true;
});

render();
