// --- GLOBAL VARIABLES ---
let dbData = null;
let cart = [];

// --- ELEMENTS ---
const navbar = document.getElementById('header');
const navMenu = document.getElementById('nav-menu');
const hamburger = document.getElementById('hamburger');
const productsGrid = document.getElementById('products-grid');
const combosGrid = document.getElementById('combos-grid');
const galleryGrid = document.getElementById('gallery-grid');
const testimonialsContainer = document.getElementById('testimonials-container');

// Cart Elements
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartBadgeCount = document.getElementById('cart-badge-count');
const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

// Checkout Form Elements
const orderForm = document.getElementById('order-form');
const summaryItemsList = document.getElementById('summary-items-list');
const summaryTotalPrice = document.getElementById('summary-total-price');
const submitZaloBtn = document.getElementById('submit-zalo-btn');

// Popups & Lightbox
const successPopup = document.getElementById('success-popup');
const popupCloseBtn = document.getElementById('popup-close-btn');
const lightbox = document.getElementById('lightbox');
const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
const lightboxMediaContainer = document.getElementById('lightbox-media-container');
const lightboxCaption = document.getElementById('lightbox-caption');

// Floating Widgets Contact Elements
const widgetMessenger = document.getElementById('widget-messenger');
const widgetZalo = document.getElementById('widget-zalo');
const widgetHotline = document.getElementById('widget-hotline');
const brandAddress = document.getElementById('brand-address');
const brandHotline = document.getElementById('brand-hotline');
const brandEmail = document.getElementById('brand-email');

// --- INIT APP ---
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  fetchDatabase();
  setupEventListeners();
});

// --- FETCH DATABASE ---
async function fetchDatabase() {
  try {
    const response = await fetch('db.json');
    if (!response.ok) {
      throw new Error('Không thể tải cơ sở dữ liệu.');
    }
    dbData = await response.json();

    // Render components
    renderBrandInfo();
    renderProducts(dbData.products);
    renderCombos(dbData.combos);
    renderGallery(dbData.gallery);
    renderTestimonials(dbData.testimonials);
    updateCartUI();
  } catch (error) {
    console.error('Lỗi khi fetch dữ liệu:', error);
  }
}

// --- RENDER BRAND INFO ---
function renderBrandInfo() {
  if (!dbData || !dbData.brand) return;
  const brand = dbData.brand;

  // Set logo if configured
  if (brand.logoUrl) {
    const brandLogo = document.getElementById('brand-logo');
    const footerLogo = document.getElementById('footer-logo');
    if (brandLogo) brandLogo.src = brand.logoUrl + '?t=' + Date.now();
    if (footerLogo) footerLogo.src = brand.logoUrl + '?t=' + Date.now();
  }

  // Set details in elements
  if (brandAddress) brandAddress.textContent = brand.address;
  if (brandHotline) {
    brandHotline.textContent = brand.hotline;
    brandHotline.href = `tel:${brand.hotline.replace(/\./g, '')}`;
  }
  if (brandEmail) {
    brandEmail.textContent = brand.email;
    brandEmail.href = `mailto:${brand.email}`;
  }

  // Set links in widgets
  if (widgetMessenger) widgetMessenger.href = brand.messengerUrl;
  if (widgetZalo) widgetZalo.href = brand.zaloUrl;
  if (widgetHotline) widgetHotline.href = `tel:${brand.hotline.replace(/\./g, '')}`;
}

// --- RENDER PRODUCTS ---
function renderProducts(productsList) {
  if (!productsGrid) return;
  productsGrid.innerHTML = '';

  if (productsList.length === 0) {
    productsGrid.innerHTML = '<p class="cart-empty-message">Không có sản phẩm nào thuộc danh mục này.</p>';
    return;
  }

  productsList.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-image-container">
        <span class="product-tag">${product.tag}</span>
        <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
      </div>
      <div class="product-details">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button class="add-to-cart-btn" onclick="addToCart('${product.id}', 'product')" aria-label="Thêm vào giỏ">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    `;
    productsGrid.appendChild(productCard);
  });
}

// --- RENDER COMBOS ---
function renderCombos(combosList) {
  if (!combosGrid) return;
  combosGrid.innerHTML = '';

  combosList.forEach(combo => {
    const comboCard = document.createElement('div');
    comboCard.className = 'combo-card';
    comboCard.innerHTML = `
      <div class="combo-image-container">
        <span class="combo-tag">${combo.tag}</span>
        <img src="${combo.image}" alt="${combo.name}" class="combo-img" loading="lazy">
      </div>
      <div class="combo-details">
        <h3 class="combo-name">${combo.name}</h3>
        <p class="combo-desc">${combo.description}</p>
        <div class="combo-footer">
          <span class="combo-price">${formatPrice(combo.price)}</span>
          <button class="btn btn-gold combo-btn" onclick="addToCart('${combo.id}', 'combo')">Chọn Combo</button>
        </div>
      </div>
    `;
    combosGrid.appendChild(comboCard);
  });
}

// --- RENDER GALLERY ---
function renderGallery(galleryList) {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = '';

  galleryList.forEach(item => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    // Add open modal trigger
    galleryItem.addEventListener('click', () => openLightbox(item));

    if (item.type === 'video') {
      galleryItem.innerHTML = `
        <img src="${item.thumbnail}" alt="${item.caption}" class="gallery-media" loading="lazy">
        <div class="gallery-overlay">
          <div class="video-play-btn"><i class="fa-solid fa-play"></i></div>
          <span class="gallery-caption">${item.caption}</span>
        </div>
      `;
    } else {
      galleryItem.innerHTML = `
        <img src="${item.url}" alt="${item.caption}" class="gallery-media" loading="lazy">
        <div class="gallery-overlay">
          <div class="gallery-icon"><i class="fa-solid fa-expand"></i></div>
          <span class="gallery-caption">${item.caption}</span>
        </div>
      `;
    }
    galleryGrid.appendChild(galleryItem);
  });
}

// --- RENDER TESTIMONIALS ---
function renderTestimonials(testimonialsList) {
  if (!testimonialsContainer) return;
  testimonialsContainer.innerHTML = '';

  testimonialsList.forEach(testi => {
    const testiCard = document.createElement('div');
    testiCard.className = 'testimonial-card';
    testiCard.innerHTML = `
      <span class="testimonial-quote-icon">“</span>
      <p class="testimonial-text">"${testi.comment}"</p>
      <div class="testimonial-author">
        <span class="author-name">${testi.name}</span>
        <span class="author-role">${testi.role}</span>
      </div>
    `;
    testimonialsContainer.appendChild(testiCard);
  });
}

// --- EVENT LISTENERS setup ---
function setupEventListeners() {
  // Sticky Navbar logic
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    hamburger.classList.toggle('active');

    // Hamburger animation
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  // Close Mobile Menu on Click on links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.querySelectorAll('span').forEach(span => span.style.transform = 'none');
      hamburger.querySelectorAll('span')[1].style.opacity = '1';
    });
  });

  // Cart Drawer open/close
  cartToggleBtn.addEventListener('click', toggleCart);
  cartCloseBtn.addEventListener('click', toggleCart);
  cartBackdrop.addEventListener('click', toggleCart);
  
  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      cartDrawer.classList.remove('open');
      cartBackdrop.classList.remove('open');
    });
  }

  // Product Filter Action
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const category = e.target.getAttribute('data-category');
      if (category === 'all') {
        renderProducts(dbData.products);
      } else {
        const filtered = dbData.products.filter(p => p.category === category);
        renderProducts(filtered);
      }
    });
  });

  // Lightbox Close
  lightboxCloseBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Checkout Form Submission (COD / Bank Transfer)
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }

    // Normal Checkout flow
    processCheckout();
  });

  // Send via Zalo Button Action
  submitZaloBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi gửi Zalo.');
      return;
    }

    // Verify form validity manually before processing
    if (!orderForm.checkValidity()) {
      orderForm.reportValidity();
      return;
    }

    sendOrderToZalo();
  });

  // Success Popup Close
  popupCloseBtn.addEventListener('click', () => {
    successPopup.classList.remove('open');
  });

  // Price Modal Elements & Slider Logic
  const priceModal = document.getElementById('price-modal');
  const viewPriceBtn = document.getElementById('view-price-btn');
  const priceModalClose = document.getElementById('price-modal-close');
  const pricePrevBtn = document.getElementById('price-prev-btn');
  const priceNextBtn = document.getElementById('price-next-btn');
  const priceSlides = document.querySelectorAll('.price-slide');
  const priceDots = document.querySelectorAll('.price-dot');
  let currentPriceSlideIndex = 0;

  function showPriceSlide(index) {
    if (index < 0) index = priceSlides.length - 1;
    if (index >= priceSlides.length) index = 0;

    priceSlides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    priceDots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    currentPriceSlideIndex = index;
  }

  if (viewPriceBtn && priceModal) {
    viewPriceBtn.addEventListener('click', () => {
      priceModal.classList.add('open');
      showPriceSlide(0);
    });

    priceModalClose.addEventListener('click', () => {
      priceModal.classList.remove('open');
    });

    priceModal.addEventListener('click', (e) => {
      if (e.target === priceModal) {
        priceModal.classList.remove('open');
      }
    });

    pricePrevBtn.addEventListener('click', () => {
      showPriceSlide(currentPriceSlideIndex - 1);
    });

    priceNextBtn.addEventListener('click', () => {
      showPriceSlide(currentPriceSlideIndex + 1);
    });

    priceDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showPriceSlide(i);
      });
    });

    // Keyboard support for price modal
    document.addEventListener('keydown', (e) => {
      if (priceModal.classList.contains('open')) {
        if (e.key === 'ArrowLeft') {
          showPriceSlide(currentPriceSlideIndex - 1);
        } else if (e.key === 'ArrowRight') {
          showPriceSlide(currentPriceSlideIndex + 1);
        } else if (e.key === 'Escape') {
          priceModal.classList.remove('open');
        }
      }
    });
  }
}

// --- CART LOGIC ---
function toggleCart() {
  cartDrawer.classList.toggle('open');
  cartBackdrop.classList.toggle('open');
}

window.addToCart = function (id, type) {
  let item = null;
  if (type === 'product') {
    item = dbData.products.find(p => p.id === id);
  } else if (type === 'combo') {
    item = dbData.combos.find(c => c.id === id);
  }

  if (!item) return;

  // Check if already in cart
  const cartItemIndex = cart.findIndex(c => c.id === id);

  if (cartItemIndex > -1) {
    cart[cartItemIndex].quantity += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  }

  saveCartToStorage();
  updateCartUI();

  // Open cart drawer so user sees it added
  toggleCart();
};

function updateCartQuantity(id, change) {
  const itemIndex = cart.findIndex(c => c.id === id);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;

    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }

    saveCartToStorage();
    updateCartUI();
  }
}

function removeCartItem(id) {
  cart = cart.filter(c => c.id !== id);
  saveCartToStorage();
  updateCartUI();
}

function updateCartUI() {
  // Update badge count
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadgeCount.textContent = totalQty;

  // Render cart items
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <i class="fa-solid fa-shopping-basket"></i>
        <span>Giỏ hàng đang trống</span>
      </div>
    `;
    cartTotalPrice.textContent = '0đ';
    summaryTotalPrice.textContent = '0đ';
    summaryItemsList.innerHTML = '<div style="font-size:0.9rem; color:var(--text-muted);">Không có sản phẩm nào.</div>';
    return;
  }

  cartItemsContainer.innerHTML = '';
  summaryItemsList.innerHTML = '';

  let totalPrice = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;

    // Render item in Drawer
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.name}</h4>
        <span class="cart-item-price">${formatPrice(item.price)}</span>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeCartItem('${item.id}')" aria-label="Xóa">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    cartItemsContainer.appendChild(itemEl);

    // Render item in Checkout Summary Form
    const summaryEl = document.createElement('div');
    summaryEl.className = 'summary-row';
    summaryEl.innerHTML = `
      <span>${item.name} x${item.quantity}</span>
      <span>${formatPrice(itemTotal)}</span>
    `;
    summaryItemsList.appendChild(summaryEl);
  });

  cartTotalPrice.textContent = formatPrice(totalPrice);
  summaryTotalPrice.textContent = formatPrice(totalPrice);
}

// --- CHECKOUT LOGIC ---
function processCheckout() {
  const fullname = document.getElementById('fullname').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const note = document.getElementById('note').value;
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;

  const orderDetails = {
    fullname,
    phone,
    address,
    note,
    paymentMethod,
    items: cart,
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };

  console.log('Đặt hàng thành công với thông tin:', orderDetails);

  // Send order to backend API
  fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderDetails)
  })
  .then(res => res.json())
  .then(data => console.log('Đã lưu đơn hàng vào hệ thống admin:', data))
  .catch(err => console.error('Lỗi lưu đơn hàng:', err));

  // Clear cart
  cart = [];
  saveCartToStorage();
  updateCartUI();
  orderForm.reset();

  // Close Cart Drawer if open
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');

  // Show Success Popup
  successPopup.classList.add('open');
}

// --- SEND ORDER TO ZALO ---
function sendOrderToZalo() {
  const fullname = document.getElementById('fullname').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const note = document.getElementById('note').value;
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;

  let totalPrice = 0;
  let itemsText = '';

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;
    itemsText += `${index + 1}. ${item.name} - SL: ${item.quantity} - Giá: ${formatPrice(itemTotal)}\n`;
  });

  const orderDetails = {
    fullname,
    phone,
    address,
    note,
    paymentMethod,
    items: cart,
    total: totalPrice
  };

  // Send order to backend API
  fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderDetails)
  })
  .then(res => res.json())
  .then(data => console.log('Đã lưu đơn hàng Zalo vào hệ thống admin:', data))
  .catch(err => console.error('Lỗi lưu đơn hàng Zalo:', err));

  // Create beautiful message text
  const messageText = `🔔 ĐƠN HÀNG MỚI TỪ MYMOON 🔔\n\n` +
    `👤 Khách hàng: ${fullname}\n` +
    `📞 Số điện thoại: ${phone}\n` +
    `📍 Địa chỉ giao nhận: ${address}\n` +
    `💳 Thanh toán: ${paymentMethod}\n` +
    `📝 Ghi chú: ${note || 'Không có'}\n\n` +
    `📦 Danh sách bánh đặt mua:\n${itemsText}\n` +
    `💰 Tổng đơn hàng: ${formatPrice(totalPrice)}\n\n` +
    `Cảm ơn shop, vui lòng xác nhận đơn hàng giúp mình nhé!`;

  // Copy to clipboard
  navigator.clipboard.writeText(messageText).then(() => {
    alert('Thông tin đơn hàng đã được tự động sao chép vào bộ nhớ tạm!\n\nSau khi bấm OK, bạn sẽ được chuyển hướng sang Zalo để nhắn gửi thông tin đơn hàng này cho shop.');

    // Redirect to Zalo
    const zaloUrl = dbData && dbData.brand ? dbData.brand.zaloUrl : 'https://zalo.me/0344582293';
    window.open(zaloUrl, '_blank');

    // Clear cart and reset form after redirect
    cart = [];
    saveCartToStorage();
    updateCartUI();
    orderForm.reset();
  }).catch(err => {
    console.error('Không thể sao chép đơn hàng:', err);
    // Fallback if copy fails, just redirect
    const zaloUrl = dbData && dbData.brand ? dbData.brand.zaloUrl : 'https://zalo.me/0344582293';
    window.open(zaloUrl, '_blank');
  });
}

// --- LIGHTBOX MODAL LOGIC ---
function openLightbox(item) {
  if (!lightboxMediaContainer) return;
  lightboxMediaContainer.innerHTML = '';

  if (item.type === 'video') {
    // Generate iframe for YouTube video
    const iframe = document.createElement('iframe');
    iframe.src = `${item.url}?autoplay=1`;
    iframe.className = 'lightbox-iframe';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    lightboxMediaContainer.appendChild(iframe);
  } else {
    // Generate image
    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.caption;
    img.className = 'lightbox-media';
    lightboxMediaContainer.appendChild(img);
  }

  lightboxCaption.textContent = item.caption;
  lightbox.classList.add('open');
}

function closeLightbox() {
  lightbox.classList.remove('open');
  // Clear container to stop videos or audio playing in background when closed
  setTimeout(() => {
    if (lightboxMediaContainer) {
      lightboxMediaContainer.innerHTML = '';
    }
  }, 400);
}

// --- LOCAL STORAGE HELPERS ---
function saveCartToStorage() {
  localStorage.setItem('mymoon_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  const storedCart = localStorage.getItem('mymoon_cart');
  if (storedCart) {
    try {
      cart = JSON.parse(storedCart);
    } catch (e) {
      cart = [];
    }
  }
}

// --- FORMAT PRICE ---
function formatPrice(number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}
