const WHATSAPP_NUMBER = "34992117317";

const cart = {};
let currentProduct = null;
let modalQty = 1;

const modal = document.getElementById("productModal");
const modalImage = document.getElementById("modalImage");
const modalTag = document.getElementById("modalTag");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalQtyEl = document.getElementById("modalQty");
const orderBar = document.getElementById("orderBar");

const cartModal = document.getElementById("cartModal");
const cartItems = document.getElementById("cartItems");
const cartModalTotal = document.getElementById("cartModalTotal");
const openCartBtn = document.getElementById("openCartBtn");
const cartWhatsappBtn = document.getElementById("cartWhatsappBtn");

function money(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function cartArray() {
  return Object.values(cart).filter((item) => item.qty > 0);
}

function openModal(card) {
  currentProduct = {
    id: card.dataset.product,
    name: card.dataset.product,
    price: Number(card.dataset.price),
    image: card.dataset.image,
    tag: card.dataset.tag,
    desc: card.dataset.desc
  };

  modalQty = 1;
  modalImage.src = currentProduct.image;
  modalImage.alt = `Bolo no pote ${currentProduct.name}`;
  modalTag.textContent = currentProduct.tag;
  modalTitle.textContent = currentProduct.name;
  modalDesc.textContent = currentProduct.desc;
  modalQtyEl.textContent = String(modalQty);

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function openCart() {
  renderCart();
  cartModal.classList.add("open");
  cartModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeCart() {
  cartModal.classList.remove("open");
  cartModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function buildWhatsAppLink(selected, total) {
  const lines = selected.map((item) => {
    const subtotal = item.qty * item.price;
    return `- ${item.qty}x ${item.name} (${money(subtotal)})`;
  });

  const message = `Olá! Quero fazer um pedido:%0A${lines.join("%0A")}%0A%0ATotal: ${money(total)}`;
  return `https://wa.me/55${WHATSAPP_NUMBER}?text=${message}`;
}

function updateOrder() {
  const selected = cartArray();
  let total = 0;
  let qtyTotal = 0;

  selected.forEach((item) => {
    qtyTotal += item.qty;
    total += item.qty * item.price;
  });

  const itemsText = document.getElementById("itemsText");
  const totalText = document.getElementById("totalText");
  const whatsappBtn = document.getElementById("whatsappBtn");

  if (qtyTotal > 0) {
    itemsText.textContent = `${qtyTotal} produto${qtyTotal > 1 ? "s" : ""} no carrinho`;
    totalText.textContent = `Total: ${money(total)}`;
    orderBar.classList.remove("hidden");

    const link = buildWhatsAppLink(selected, total);
    whatsappBtn.href = link;
    cartWhatsappBtn.href = link;

    whatsappBtn.classList.remove("disabled");
    whatsappBtn.setAttribute("aria-disabled", "false");
    cartWhatsappBtn.classList.remove("disabled");
    cartWhatsappBtn.setAttribute("aria-disabled", "false");
  } else {
    itemsText.textContent = "Carrinho vazio";
    totalText.textContent = "Total: R$ 0,00";
    orderBar.classList.add("hidden");

    whatsappBtn.href = "#";
    cartWhatsappBtn.href = "#";

    whatsappBtn.classList.add("disabled");
    whatsappBtn.setAttribute("aria-disabled", "true");
    cartWhatsappBtn.classList.add("disabled");
    cartWhatsappBtn.setAttribute("aria-disabled", "true");
  }

  renderCart();
}

function renderCart() {
  const selected = cartArray();
  let total = 0;

  cartItems.innerHTML = "";

  if (!selected.length) {
    cartItems.innerHTML = `<p style="text-align:center;color:rgba(255,255,255,.68);font-size:13px;">Seu carrinho ainda está vazio.</p>`;
    cartModalTotal.textContent = money(0);
    return;
  }

  selected.forEach((item) => {
    total += item.qty * item.price;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <span>${item.qty} x ${money(item.price)} = ${money(item.qty * item.price)}</span>
      </div>
      <div class="cart-item-actions">
        <button class="cart-minus" type="button" aria-label="Diminuir ${item.name}" data-cart-minus="${item.id}">−</button>
        <output>${item.qty}</output>
        <button class="cart-plus" type="button" aria-label="Adicionar ${item.name}" data-cart-plus="${item.id}">+</button>
      </div>
    `;

    cartItems.appendChild(row);
  });

  cartModalTotal.textContent = money(total);
}

function changeCartQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;

  if (cart[id].qty <= 0) {
    delete cart[id];
  }

  updateOrder();
}

function bindProductCards() {
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card);
      }
    });
  });
}

document.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeModal);
});

document.querySelectorAll("[data-close-cart]").forEach((el) => {
  el.addEventListener("click", closeCart);
});

openCartBtn.addEventListener("click", openCart);

cartItems.addEventListener("click", (event) => {
  const minus = event.target.closest("[data-cart-minus]");
  const plus = event.target.closest("[data-cart-plus]");

  if (minus) {
    changeCartQty(minus.dataset.cartMinus, -1);
  }

  if (plus) {
    changeCartQty(plus.dataset.cartPlus, 1);
  }
});

document.getElementById("modalPlus").addEventListener("click", () => {
  modalQty += 1;
  modalQtyEl.textContent = String(modalQty);
});

document.getElementById("modalMinus").addEventListener("click", () => {
  modalQty = Math.max(1, modalQty - 1);
  modalQtyEl.textContent = String(modalQty);
});

document.getElementById("addProductBtn").addEventListener("click", () => {
  if (!currentProduct) return;

  if (!cart[currentProduct.id]) {
    cart[currentProduct.id] = {
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image: currentProduct.image,
      qty: 0
    };
  }

  cart[currentProduct.id].qty += modalQty;
  updateOrder();
  closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (modal.classList.contains("open")) closeModal();
    if (cartModal.classList.contains("open")) closeCart();
  }
});

bindProductCards();
updateOrder();


/* Splash inicial */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  if (!splash) return;

  setTimeout(() => {
    splash.classList.add("hide");
  }, 1500);

  setTimeout(() => {
    splash.remove();
  }, 2050);
});
