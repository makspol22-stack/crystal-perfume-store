/**
 * Crystal Perfume - Dynamic Catalog Engine
 */

let allPerfumes = [];
let filteredPerfumes = [];
let currentFilter = 'all';
let searchQuery = '';
let displayCount = 20;

const catalogContainer = document.getElementById('dynamicCatalog');
const searchInput = document.getElementById('catalogSearch');
const filterButtons = document.querySelectorAll('.filter-pill');

// Gentle pastel palette per direction
function getAuraGradient(direction, index) {
    const womenPalettes = [
        'linear-gradient(135deg, #fce7f3, #fbcfe8)',
        'linear-gradient(135deg, #ede9fe, #ddd6fe)',
        'linear-gradient(135deg, #e0f2fe, #bae6fd)',
        'linear-gradient(135deg, #fef3c7, #fde68a)',
        'linear-gradient(135deg, #f0fdf4, #bbf7d0)',
        'linear-gradient(135deg, #fff1f2, #fecdd3)',
    ];
    const menPalettes = [
        'linear-gradient(135deg, #dbeafe, #bfdbfe)',
        'linear-gradient(135deg, #d1fae5, #a7f3d0)',
        'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
        'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        'linear-gradient(135deg, #eff6ff, #dbeafe)',
    ];
    const uniPalettes = [
        'linear-gradient(135deg, #faf5ff, #ede9fe)',
        'linear-gradient(135deg, #fff7ed, #fed7aa)',
        'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        'linear-gradient(135deg, #ecfeff, #cffafe)',
        'linear-gradient(135deg, #fdf4ff, #fae8ff)',
        'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    ];
    if (direction === 'Женский') return womenPalettes[index % womenPalettes.length];
    if (direction === 'Мужской') return menPalettes[index % menPalettes.length];
    return uniPalettes[index % uniPalettes.length];
}

// Initialize
async function initCatalog() {
    try {
        const response = await fetch('catalog.json');
        allPerfumes = await response.json();
        
        // Remove static loader and render initial set
        catalogContainer.innerHTML = '';
        renderCatalog();
        
        // Setup Events
        setupEventListeners();
    } catch (error) {
        console.error('Error loading catalog:', error);
        catalogContainer.innerHTML = '<div class="loader">Ошибка загрузки каталога.</div>';
    }
}

function renderCatalog() {
    // Apply filter and search
    const query = searchQuery.toLowerCase();
    filteredPerfumes = allPerfumes.filter(p => {
        const matchesFilter = currentFilter === 'all' || p.direction === currentFilter;
        
        const name = (p.name || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const aura = (p.aura || "").toLowerCase();
        const notes = (p.notes || "").toLowerCase();
        const script = (p.script || "").toLowerCase();
        
        const matchesSearch = !query ||
                              name.includes(query) || 
                              brand.includes(query) || 
                              aura.includes(query) || 
                              notes.includes(query) ||
                              script.includes(query);

        return matchesFilter && matchesSearch;
    });

    const container = document.getElementById('dynamicCatalog');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    if (filteredPerfumes.length === 0) {
        container.innerHTML = '<div class="loader">Ничего не найдено... Попробуйте другой запрос.</div>';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        return;
    }

    const toDisplay = filteredPerfumes.slice(0, displayCount);
    container.innerHTML = '';
    toDisplay.forEach((p, index) => {
        container.appendChild(createPerfumeCard(p, index));
    });
    
    // Show/Hide Load More
    if (loadMoreContainer) {
        if (displayCount < filteredPerfumes.length) {
            loadMoreContainer.style.display = 'flex';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    // Re-run animation observer
    if (window.observer) {
        document.querySelectorAll('.product-card:not(.visible)').forEach(el => window.observer.observe(el));
    }
}

function createPerfumeCard(p, index) {
    const card = document.createElement('div');
    card.className = `product-card reveal`;
    card.style.transitionDelay = `${(index % 6) * 0.07}s`;

    const bgGradient = getAuraGradient(p.direction, index);
    const displayName = p.name || p.brand || 'Коллекция';
    const displayBrand = p.name ? p.brand : 'Exclusive Collection';

    // Direction icon mapping
    const dirIcon = p.direction === 'Мужской' ? 'fa-mars' : 
                    p.direction === 'Женский' ? 'fa-venus' : 'fa-venus-mars';

    card.innerHTML = `
        <div class="product-img-wrap">
            <div class="product-img" style="background: ${bgGradient};">
                <i class="fa-solid fa-gem product-gem-icon"></i>
            </div>
            <span class="product-tag"><i class="fa-solid ${dirIcon}"></i> ${p.direction}</span>
        </div>
        <div class="product-body">
            <h3 class="product-name">${displayName}</h3>
            <p class="product-subtitle">${displayBrand}</p>
            <div class="notes-list">
                <div class="note-row">
                    <span class="note-label">Аура</span>
                    <span class="note-value aura-value">${p.aura || 'Прозрачная'}</span>
                </div>
                <div class="note-row">
                    <span class="note-label">Ноты</span>
                    <span class="note-value">${p.notes || '—'}</span>
                </div>
            </div>
            <div class="product-price-row">
                <span class="product-price">от 4 900 ₽</span>
                <button class="product-btn" onclick="openProductModal(${allPerfumes.indexOf(p)})">
                    Детали <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        displayCount = 20; // Reset pagination on new search
        renderCatalog();
    });

    // Filters
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            displayCount = 20; // Reset pagination on filter change
            renderCatalog();
        });
    });

    // Navbar scroll effect
    const nav = document.getElementById('navbar');
    const hero = document.getElementById('hero');
    const isHeroLight = hero && hero.classList.contains('hero-light');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
            if (isHeroLight) nav.classList.remove('nav-light');
        } else {
            nav.classList.remove('scrolled');
            if (isHeroLight) nav.classList.add('nav-light');
        }
    });
    
    if (window.scrollY <= 50 && isHeroLight) nav.classList.add('nav-light');

    // Modal Close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('productModal')) closeModal();
        if (e.target === document.getElementById('cartOverlay')) closeCart();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeModal(); closeCart(); }
    });

    // Cart Events
    document.getElementById('cartToggle').addEventListener('click', openCart);
    document.getElementById('cartClose').addEventListener('click', closeCart);
    document.getElementById('modalAddToCart').addEventListener('click', () => {
        const name = document.getElementById('modalName').textContent;
        const brand = document.getElementById('modalBrand').textContent;
        addToCart({ name, brand, price: 4900 });
        closeModal();
    });

    // Load More Event
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        displayCount += 20;
        renderCatalog();
    });

    // Checkout via WhatsApp
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length === 0) return;
        const itemsList = cart.map(i => `- ${i.name} (${i.brand}): ${i.price.toLocaleString()} ₽`).join('%0A');
        const total = cart.reduce((sum, i) => sum + i.price, 0);
        const msg = encodeURIComponent(`Добрый день! Хочу заказать:\n${cart.map(i => `- ${i.name} (${i.brand})`).join('\n')}\nИтого: ${total.toLocaleString()} ₽`);
        window.open(`https://wa.me/79991234567?text=${msg}`, '_blank');
    });

    // Stone Matcher Logic
    document.querySelectorAll('.stone-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const stone = opt.dataset.stone;
            searchInput.value = stone;
            searchQuery = stone;
            displayCount = 20;
            renderCatalog();
            
            const catalogElem = document.getElementById('catalog');
            if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
            
            document.querySelectorAll('.stone-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        });
    });

    loadCart();
}

// CART LOGIC
let cart = [];

function addToCart(product) {
    cart.push(product);
    saveCart();
    updateCartUI();
    openCart();
    showCartNotification(product.name);
}

function showCartNotification(name) {
    const notif = document.createElement('div');
    notif.className = 'cart-notif';
    notif.innerHTML = `<i class="fa-solid fa-check"></i> «${name}» добавлен в корзину`;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('visible'), 10);
    setTimeout(() => {
        notif.classList.remove('visible');
        setTimeout(() => notif.remove(), 400);
    }, 2500);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('crystal_cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('crystal_cart');
    if (saved) cart = JSON.parse(saved);
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('cartItems');
    const cartCount = document.querySelector('.cart-count');
    const totalVal = document.getElementById('cartTotalVal');
    
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
    
    if (cart.length === 0) {
        cartList.innerHTML = '<div class="empty-cart-msg"><i class="fa-solid fa-bag-shopping" style="font-size:2rem;margin-bottom:12px;opacity:0.2;display:block"></i>Корзина пока пуста</div>';
        totalVal.textContent = '0 ₽';
        return;
    }

    let total = 0;
    cartList.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
            <div class="cart-item">
                <div class="cart-item-img"><i class="fa-solid fa-gem"></i></div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-brand">${item.brand}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                </div>
                <div class="cart-item-remove" onclick="removeFromCart(${index})" title="Удалить">
                    <i class="fa-solid fa-trash"></i>
                </div>
            </div>
        `;
    }).join('');
    
    totalVal.textContent = `${total.toLocaleString()} ₽`;
}

function openCart() {
    document.getElementById('cartOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '6px'; // Prevent layout shift if scrollbar disappears
}

function closeCart() {
    document.getElementById('cartOverlay').classList.remove('active');
    if (!document.getElementById('productModal').classList.contains('active')) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
}

function openProductModal(index) {
    const p = allPerfumes[index];
    if (!p) return;

    const modal = document.getElementById('productModal');
    const displayName = p.name || p.brand || 'Коллекция';
    const displayBrand = p.name ? p.brand : 'Exclusive Collection';

    document.getElementById('modalName').textContent = displayName;
    document.getElementById('modalBrand').textContent = displayBrand;
    document.getElementById('modalBadge').textContent = p.direction;
    document.getElementById('modalPronunciation').textContent = p.aura || '—';
    document.getElementById('modalDirectionVal').textContent = p.direction || '—';
    document.getElementById('modalTop').textContent = p.notes || '—';
    document.getElementById('modalDesc').textContent = p.script || 'Описание аромата скоро появится...';
    
    // Modal image with gradient
    const bgGradient = getAuraGradient(p.direction, index);
    const modalImg = document.getElementById('modalImg');
    modalImg.style.background = bgGradient;
    modalImg.innerHTML = `<i class="fa-solid fa-gem" style="font-size:5rem;opacity:0.15;color:#1e40af;"></i>`;

    // Update "add to cart" with correct product
    const addBtn = document.getElementById('modalAddToCart');
    addBtn.onclick = () => {
        addToCart({ name: displayName, brand: displayBrand, price: 4900 });
        closeModal();
    };

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '6px';
    
    // Focus Trap: Put focus on close button
    setTimeout(() => document.getElementById('modalClose').focus(), 100);
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    if (!document.getElementById('cartOverlay').classList.contains('active')) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
}

// Start
initCatalog();
