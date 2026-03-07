// Optiks Mechatronics - Main JavaScript File

// ============================================
// GLOBAL VARIABLES
// ============================================
let products = [];
let cart = [];
let currentProduct = null;

// ============================================
// DOM ELEMENTS
// ============================================
const productGrid = document.getElementById('product-grid');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const noResults = document.getElementById('no-results');
const productCount = document.getElementById('product-count');
const productModal = document.getElementById('product-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const closeModal = document.getElementById('close-modal');
const productSearch = document.getElementById('product-search');
const categoryFilter = document.getElementById('category-filter');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mainHeader = document.getElementById('main-header');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const searchBtn = document.getElementById('search-btn');
const addToCartBtn = document.getElementById('add-to-cart-btn');

// ============================================
// CSV PARSING
// ============================================
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });
}

// ============================================
// FETCH PRODUCTS
// ============================================
async function fetchProducts() {
    try {
        loading.classList.remove('hidden');
        error.classList.add('hidden');
        
        const response = await fetch('Product.csv');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const csvText = await response.text();
        products = parseCSV(csvText);
        renderProducts(products);
        loading.classList.add('hidden');
    } catch (error) {
        console.error('Error fetching products:', error);
        loading.classList.add('hidden');
        error.classList.remove('hidden');
    }
}

// ============================================
// RENDER PRODUCTS
// ============================================
function renderProducts(productList) {
    loading.classList.add('hidden');
    productGrid.innerHTML = '';

    if (productList.length === 0) {
        productGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500 text-lg">No products found</p>
            </div>
        `;
        return;
    }

    productList.forEach((product, index) => {
        const card = createProductCard(product, index);
        productGrid.appendChild(card);
    });
}

// ============================================
// CREATE PRODUCT CARD
// ============================================
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'group relative bg-brand-lightGrey rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-silver';
    card.setAttribute('data-index', index);

    // Generate image URL based on product name
    const imageName = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const imageUrl = `assets/images/products/${imageName}.jpg`;

    card.innerHTML = `
        <div class="h-64 bg-white flex items-center justify-center p-8 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-brand-red/5"></div>
            <img src="${imageUrl}" 
                 alt="${product.name}" 
                 class="relative z-10 transform group-hover:scale-110 transition duration-500 w-full h-full object-cover"
                 onerror="this.src='https://via.placeholder.com/300x300/E5E7EB/2F5BFF?text=${encodeURIComponent(product.name)}'">
            <div class="absolute top-4 right-4 z-20">
                <span class="px-3 py-1 bg-brand-blue text-white text-xs font-semibold rounded-full">
                    ${product.size || product.wattage}W
                </span>
            </div>
            <div class="absolute bottom-4 left-4 z-20">
                <span class="px-3 py-1 bg-brand-red/10 text-brand-red text-xs font-semibold rounded-full">
                    IP${product.ip_rating}
                </span>
            </div>
        </div>
        <div class="p-6">
            <h3 class="text-xl font-bold text-brand-dark mb-2">${product.name}</h3>
            <p class="text-gray-500 text-sm mb-4 line-clamp-2">${product.description}</p>
            
            <div class="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div class="bg-white rounded-lg p-2">
                    <span class="text-gray-400 text-xs">Size/Dimensions</span>
                    <p class="font-semibold text-brand-dark">${product.size || product.wattage}W</p>
                </div>
                <div class="bg-white rounded-lg p-2">
                    <span class="text-gray-400 text-xs">Beam Angle</span>
                    <p class="font-semibold text-brand-dark">${product.beam_angle}°</p>
                </div>
                <div class="bg-white rounded-lg p-2">
                    <span class="text-gray-400 text-xs">IP Rating</span>
                    <p class="font-semibold text-brand-dark">IP${product.ip_rating}</p>
                </div>
                <div class="bg-white rounded-lg p-2">
                    <span class="text-gray-400 text-xs">IK Rating</span>
                    <p class="font-semibold text-brand-dark">IK${product.ik_rating || '08'}</p>
                </div>
                <div class="bg-white rounded-lg p-2">
                    <span class="text-gray-400 text-xs">Lens Type</span>
                    <p class="font-semibold text-brand-dark">${product.lens_type}</p>
                </div>
                <div class="bg-white rounded-lg p-2">
                    <span class="text-gray-400 text-xs">CCT</span>
                    <p class="font-semibold text-brand-dark">${product.cct}</p>
                </div>
            </div>

            <div class="flex justify-between items-center">
                <button class="text-brand-blue font-semibold text-sm hover:text-brand-blue/80 transition" onclick="openProductModal(${index})">
                    View Details
                </button>
                <button class="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center hover:bg-brand-blue transition shadow-lg" onclick="addToCart(${index})">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    return card;
}

// ============================================
// PRODUCT MODAL
// ============================================
function openProductModal(index) {
    currentProduct = products[index];
    
    // Populate modal with product data
    document.getElementById('modal-product-name').textContent = currentProduct.name;
    document.getElementById('modal-product-category').textContent = currentProduct.category;
    document.getElementById('modal-product-wattage').textContent = `${currentProduct.size || currentProduct.wattage}W`;
    document.getElementById('modal-product-description').textContent = currentProduct.description;
    
    // Populate specifications
    const specsHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Size/Dimensions</p>
                <p class="font-semibold text-brand-dark">${currentProduct.size || currentProduct.wattage}W</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Beam Angle</p>
                <p class="font-semibold text-brand-dark">${currentProduct.beam_angle}°</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Lens Type</p>
                <p class="font-semibold text-brand-dark">${currentProduct.lens_type}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Color Temperature</p>
                <p class="font-semibold text-brand-dark">${currentProduct.cct}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">IP Rating</p>
                <p class="font-semibold text-brand-dark">IP${currentProduct.ip_rating}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">IK Rating</p>
                <p class="font-semibold text-brand-dark">IK${currentProduct.ik_rating || '08'}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Customization</p>
                <p class="font-semibold text-brand-dark">${currentProduct.customization}</p>
            </div>
        </div>
    `;
    document.getElementById('modal-specifications').innerHTML = specsHTML;

    // Show modal
    productModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    productModal.classList.add('hidden');
    document.body.style.overflow = '';
    currentProduct = null;
}

// ============================================
// CART FUNCTIONALITY
// ============================================
function addToCart(index) {
    const product = products[index];
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartCount();
    showNotification('Product added to cart!', 'success');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-20 opacity-0 z-50 ${
        type === 'success' ? 'bg-brand-blue text-white' : 'bg-brand-red text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-y-20', 'opacity-0');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function setupSearch() {
    const searchBtn = document.getElementById('search-btn');
    let searchInput = null;
    
    searchBtn.addEventListener('click', () => {
        if (!searchInput) {
            searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search products...';
            searchInput.className = 'w-64 px-4 py-2 border border-brand-silver rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition';
            searchInput.addEventListener('input', (e) => filterProducts(e.target.value));
            
            searchBtn.parentNode.insertBefore(searchInput, searchBtn.nextSibling);
            searchInput.focus();
        } else {
            searchInput.focus();
        }
    });
}

function filterProducts(query) {
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.size.toLowerCase().includes(query.toLowerCase()) ||
        product.beam_angle.toLowerCase().includes(query.toLowerCase()) ||
        product.cct.toLowerCase().includes(query.toLowerCase())
    );
    renderProducts(filtered);
}

// ============================================
// MOBILE MENU
// ============================================
function setupMobileMenu() {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================
function setupHeaderScroll() {
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            mainHeader.classList.add('shadow-md');
            mainHeader.classList.add('bg-white/95');
        } else {
            mainHeader.classList.remove('shadow-md');
            mainHeader.classList.remove('bg-white/95');
        }
        
        lastScroll = currentScroll;
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// 3D VIEWER INITIALIZATION
// ============================================
function init3DViewer() {
    const modelViewer = document.getElementById('model-viewer');
    
    if (modelViewer) {
        modelViewer.addEventListener('load', () => {
            console.log('3D model loaded successfully');
        });
        
        modelViewer.addEventListener('error', (e) => {
            console.log('3D model load error:', e);
            // Show fallback image if model fails
            modelViewer.innerHTML = `
                <div class="flex items-center justify-center h-full bg-brand-lightGrey rounded-lg">
                    <div class="text-center">
                        <svg class="w-16 h-16 text-brand-silver mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-gray-500">3D Model Unavailable</p>
                    </div>
                </div>
            `;
        });
    }
}

// ============================================
// PRODUCT CONFIGURATOR
// ============================================
function setupProductConfigurator() {
    const configurator = document.getElementById('product-configurator');
    
    if (configurator) {
        configurator.addEventListener('change', (e) => {
            if (currentProduct) {
                const modelNumber = generateModelNumber(currentProduct, e.target.value);
                document.getElementById('model-number').textContent = modelNumber;
            }
        });
    }
}

function generateModelNumber(product, config) {
    // Example: OPT-FL-100W-60D-6500K
    const categoryCode = product.category.substring(0, 2).toUpperCase();
    return `OPT-${categoryCode}-${product.size || product.wattage}W-${config}`;
}

// ============================================
// NEWSLETTER SIGNUP
// ============================================
function setupNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletter-email').value;
            
            if (email && email.includes('@')) {
                showNotification('Thank you for subscribing!', 'success');
                newsletterForm.reset();
            } else {
                showNotification('Please enter a valid email', 'error');
            }
        });
    }
}

// ============================================
// CONTACT FORM
// ============================================
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Message sent successfully!', 'success');
            contactForm.reset();
        });
    }
}

// ============================================
// ANIMATIONS
// ============================================
function setupAnimations() {
    const observerOptions = {
        threshold:
