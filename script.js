/* ============================================
   OPTIKS MECHATRONICS - MAIN JAVASCRIPT
   ============================================
   Version: 1.0.0
   Last Updated: 2024
   ============================================ */

// ============================================
// GLOBAL VARIABLES
// ============================================
let products = [];
let cart = [];
let currentProduct = null;
let filteredProducts = [];
let searchQuery = '';
let selectedCategory = 'all';

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
const cartCount = document.getElementById('cart-count');
const addToCartBtn = document.getElementById('add-to-cart-btn');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

// ============================================
// CSV PARSING
// ============================================
function parseCSV(text) {

const lines = text.trim().split("\n");
const headers = lines[0].split(",");

const data = [];

for (let i = 1; i < lines.length; i++) {

const values = lines[i].split(",");

let obj = {};

headers.forEach((header,index)=>{

obj[header.trim()] = values[index] ? values[index].trim() : "";

});

data.push(obj);

}

return data;

}

// ============================================
// FETCH PRODUCTS
// ============================================
async function fetchProducts() {
    try {
        if (loading) loading.classList.remove('hidden');
        if (error) error.classList.add('hidden');
        if (noResults) noResults.classList.add('hidden');
        
        const response = await fetch('Product.csv');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const csvText = await response.text();
        products = parseCSV(csvText);
        filteredProducts = [...products];
        
        renderProducts(filteredProducts);
        updateProductCount();
        if (loading) loading.classList.add('hidden');
    } catch (error) {
        console.error('Error fetching products:', error);
        if (loading) loading.classList.add('hidden');
        if (error) error.classList.remove('hidden');
    }
}

// ============================================
// UPDATE PRODUCT COUNT
// ============================================
function updateProductCount() {
    if (productCount) {
        productCount.innerHTML = `
            <span class="text-lg font-semibold text-brand-blue">${filteredProducts.length}</span>
            <span class="text-gray-500"> products available</span>
        `;
    }
}

// ============================================
// RENDER PRODUCTS
// ============================================
function renderProducts(productList) {
    if (loading) loading.classList.add('hidden');
    productGrid.innerHTML = '';

    if (productList.length === 0) {
        if (noResults) noResults.classList.remove('hidden');
        return;
    }

    if (noResults) noResults.classList.add('hidden');

    productList.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card animate-fade-in-up';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="product-image">
                <img src="assets/images/products/${product.category.toLowerCase().replace(/\s+/g, '-')}-${product.size}.jpg" 
                     alt="${product.name}"
                     onerror="this.src='assets/images/products/default.jpg'">
                <div class="product-badges">
                    <span class="product-badge wattage">${product.size}</span>
                    <span class="product-badge ip">IP${product.ip_rating}</span>
                </div>
            </div>
            <div class="product-content">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-specs">
                    <div class="spec-item">
                        <span class="spec-label">Beam Angle</span>
                        <span class="spec-value">${product.beam_angle}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">CCT</span>
                        <span class="spec-value">${product.cct}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">IP Rating</span>
                        <span class="spec-value">${product.ip_rating}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">IK Rating</span>
                        <span class="spec-value">${product.ik_rating}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="view-details" onclick="openProductModal('${product.name}')">
                        View Details
                    </button>
                    <button class="add-to-cart" onclick="addToCart('${product.name}')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        productGrid.appendChild(card);
    });
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function setupSearch() {
    if (!productSearch) return;
    
    productSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        filterProducts();
    });
}

// ============================================
// CATEGORY FILTER
// ============================================
function setupCategoryFilter() {
    if (!categoryFilter) return;
    
    categoryFilter.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        filterProducts();
    });
}

// ============================================
// FILTER PRODUCTS
// ============================================
function filterProducts() {
    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) ||
                             product.description.toLowerCase().includes(searchQuery) ||
                             product.category.toLowerCase().includes(searchQuery);
        
        const matchesCategory = selectedCategory === 'all' || 
                               product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    renderProducts(filteredProducts);
    updateProductCount();
}

// ============================================
// PRODUCT MODAL
// ============================================
function openProductModal(productName) {
    const product = products.find(p => p.name === productName);
    if (!product) return;
    
    currentProduct = product;
    
    // Populate modal content
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-category').textContent = product.category;
    document.getElementById('modal-product-description').textContent = product.description;
    
    // Populate specifications
    const specsContainer = document.getElementById('modal-specifications');
    specsContainer.innerHTML = `
        <div class="modal-spec-item">
            <span class="modal-spec-label">Size</span>
            <span class="modal-spec-value">${product.size}</span>
        </div>
        <div class="modal-spec-item">
            <span class="modal-spec-label">Beam Angle</span>
            <span class="modal-spec-value">${product.beam_angle}</span>
        </div>
        <div class="modal-spec-item">
            <span class="modal-spec-label">Lens Type</span>
            <span class="modal-spec-value">${product.lens_type}</span>
        </div>
        <div class="modal-spec-item">
            <span class="modal-spec-label">CCT</span>
            <span class="modal-spec-value">${product.cct}</span>
        </div>
        <div class="modal-spec-item">
            <span class="modal-spec-label">IP Rating</span>
            <span class="modal-spec-value">IP${product.ip_rating}</span>
        </div>
        <div class="modal-spec-item">
            <span class="modal-spec-label">IK Rating</span>
            <span class="modal-spec-value">IK${product.ik_rating}</span>
        </div>
    `;
    
    // Update IP and IK ratings
    document.getElementById('modal-ip-rating').textContent = product.ip_rating;
    document.getElementById('modal-ik-rating').textContent = product.ik_rating;
    
    // Show modal
    if (productModal) {
        productModal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

// ============================================
// CLOSE MODAL
// ============================================
function closeModalFunction() {
    if (productModal) {
        productModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// ============================================
// SHOPPING CART
// ============================================
function addToCart(productName) {
    const product = products.find(p => p.name === productName);
    if (!product) return;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartCount();
    showNotification('Product added to cart!', 'success');
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartCount();
    showNotification('Product removed from cart!', 'info');
}

function updateCartCount() {
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        if (totalItems > 0) {
            cartCount.classList.remove('hidden');
        } else {
            cartCount.classList.add('hidden');
        }
    }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in-up`;
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.style.color = 'white';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ============================================
// MOBILE MENU
// ============================================
function setupMobileMenu() {
    if (!mobileMenuBtn || !mobileMenu) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });
}

// ============================================
// MODAL KEYBOARD NAVIGATION
// ============================================
function setupModalKeyboard() {
    if (!productModal) return;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModal.classList.contains('active')) {
            closeModalFunction();
        }
    });
}

// ============================================
// SCROLL TO TOP ON NAVIGATION
// ============================================
function setupScrollToTop() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================
function setupHeaderScroll() {
    const header = document.querySelector('.header');
    
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    fetchProducts();
    setupSearch();
    setupCategoryFilter();
    setupMobileMenu();
    setupModalKeyboard();
    setupScrollToTop();
    setupHeaderScroll();
    
    // Close modal on backdrop click
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModalFunction);
    }
    
    // Close modal on close button click
    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunction);
    }
    
    // Add to cart button
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (currentProduct) {
                addToCart(currentProduct.name);
            }
        });
    }
    
    console.log('Optiks Mechatronics - All features initialized successfully!');
});

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ============================================
window.fetchProducts = fetchProducts;
window.openProductModal = openProductModal;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartCount = updateCartCount;
window.filterProducts = filterProducts;
// ============================================
// 31. LOCAL STORAGE PERSISTENCE
// ============================================
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('optiks-cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartCount();
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            cart = [];
        }
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('optiks-cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to storage:', error);
    }
}

// Initialize cart from storage
loadCartFromStorage();

// ============================================
// 32. CART MANAGEMENT
// ============================================
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
}

function getCartItems() {
    return cart;
}

function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartCount();
    showNotification('Cart cleared successfully!', 'success');
}

function updateCartItemQuantity(productName, quantity) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCartToStorage();
        updateCartCount();
    }
}

// ============================================
// 33. SEARCH SUGGESTIONS
// ============================================
function setupSearchSuggestions() {
    if (!productSearch) return;
    
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'search-suggestions';
    suggestionsContainer.className = 'search-suggestions absolute top-full left-0 right-0 bg-white rounded-lg shadow-xl z-50 hidden';
    suggestionsContainer.style.maxHeight = '300px';
    suggestionsContainer.style.overflowY = 'auto';
    suggestionsContainer.style.padding = 'var(--spacing-sm)';
    
    productSearch.parentNode.appendChild(suggestionsContainer);
    
    productSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) {
            suggestionsContainer.classList.add('hidden');
            return;
        }
        
        const matches = products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        ).slice(0, 5);
        
        if (matches.length > 0) {
            suggestionsContainer.innerHTML = matches.map(product => `
                <div class="search-suggestion-item p-3 hover:bg-brand-light-grey rounded cursor-pointer" onclick="selectSuggestion('${product.name}')">
                    <div class="font-semibold text-brand-dark">${product.name}</div>
                    <div class="text-sm text-brand-text-light">${product.category}</div>
                </div>
            `).join('');
            suggestionsContainer.classList.remove('hidden');
        } else {
            suggestionsContainer.classList.add('hidden');
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            suggestionsContainer.classList.add('hidden');
        }
    });
}

window.selectSuggestion = function(productName) {
    if (productSearch) {
        productSearch.value = productName;
        searchQuery = productName.toLowerCase();
        filterProducts();
        document.getElementById('search-suggestions').classList.add('hidden');
    }
};

// ============================================
// 34. IMAGE LAZY LOADING
// ============================================
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ============================================
// 35. PRODUCT COMPARISON
// ============================================
let comparisonList = [];

function addToComparison(productName) {
    const product = products.find(p => p.name === productName);
    if (!product) return;
    
    if (comparisonList.length >= 3) {
        showNotification('Maximum 3 products can be compared', 'error');
        return;
    }
    
    if (!comparisonList.find(p => p.name === productName)) {
        comparisonList.push(product);
        updateComparisonCount();
        showNotification('Product added to comparison', 'success');
    } else {
        showNotification('Product already in comparison', 'info');
    }
}

function removeFromComparison(productName) {
    comparisonList = comparisonList.filter(p => p.name !== productName);
    updateComparisonCount();
    showNotification('Product removed from comparison', 'info');
}

function updateComparisonCount() {
    const comparisonCount = document.getElementById('comparison-count');
    if (comparisonCount) {
        comparisonCount.textContent = comparisonList.length;
        if (comparisonList.length > 0) {
            comparisonCount.classList.remove('hidden');
        } else {
            comparisonCount.classList.add('hidden');
        }
    }
}

function compareProducts() {
    if (comparisonList.length < 2) {
        showNotification('Select at least 2 products to compare', 'error');
        return;
    }
    
    // Open comparison modal or view
    showComparisonModal();
}

function showComparisonModal() {
    const modal = document.getElementById('comparison-modal');
    if (modal) {
        const tableBody = document.getElementById('comparison-table-body');
        tableBody.innerHTML = comparisonList.map(product => `
            <tr>
                <td class="p-4 border-b">${product.name}</td>
                <td class="p-4 border-b">${product.category}</td>
                <td class="p-4 border-b">${product.size}</td>
                <td class="p-4 border-b">${product.beam_angle}</td>
                <td class="p-4 border-b">${product.cct}</td>
                <td class="p-4 border-b">IP${product.ip_rating}</td>
                <td class="p-4 border-b">IK${product.ik_rating}</td>
            </tr>
        `).join('');
        
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

// ============================================
// 36. NEWSLETTER SUBSCRIPTION
// ============================================
function setupNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('newsletter-email').value;
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate subscription
        showNotification('Thank you for subscribing!', 'success');
        newsletterForm.reset();
        
        // Save to local storage (for demo)
        const subscribers = JSON.parse(localStorage.getItem('optiks-subscribers') || '[]');
        subscribers.push(email);
        localStorage.setItem('optiks-subscribers', JSON.stringify(subscribers));
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// 37. CONTACT FORM VALIDATION
// ============================================
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();
        
        let isValid = true;
        
        if (name.length < 2) {
            showNotification('Name must be at least 2 characters', 'error');
            isValid = false;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            isValid = false;
        }
        
        if (phone.length < 10) {
            showNotification('Please enter a valid phone number', 'error');
            isValid = false;
        }
        
        if (message.length < 10) {
            showNotification('Message must be at least 10 characters', 'error');
            isValid = false;
        }
        
        if (isValid) {
            showNotification('Message sent successfully!', 'success');
            contactForm.reset();
            
            // Save to local storage (for demo)
            const messages = JSON.parse(localStorage.getItem('optiks-messages') || '[]');
            messages.push({ name, email, phone, message, date: new Date().toISOString() });
            localStorage.setItem('optiks-messages', JSON.stringify(messages));
        }
    });
}

// ============================================
// 38. SMOOTH SCROLLING
// ============================================
function setupSmoothScrolling() {
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
// 39. PAGE LOADING ANIMATION
// ============================================
function setupPageLoading() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        window.addEventListener('load', () => {
            loader.classList.add('hidden');
        });
    }
}

// ============================================
// 40. PERFORMANCE OPTIMIZATION
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// 41. ERROR HANDLING
// ============================================
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global Error:', {
        message: message,
        source: source,
        line: lineno,
        column: colno,
        error: error
    });
    
    showNotification('An error occurred. Please refresh the page.', 'error');
    return false;
};

// ============================================
// 42. SERVICE WORKER REGISTRATION (PWA)
// ============================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
}

// ============================================
// 43. ANALYTICS TRACKING (Optional)
// ============================================
function trackEvent(category, action, label) {
    if (window.gtag) {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// ============================================
// 44. UTILITY FUNCTIONS
// ============================================
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(price);
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(dateString));
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ============================================
// 45. FINAL INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Additional initialization
    setupSearchSuggestions();
    setupLazyLoading();
    setupNewsletter();
    setupContactForm();
    setupSmoothScrolling();
    setupPageLoading();
    
    // Log initialization
    console.log('Optiks Mechatronics - All features initialized successfully!');
    console.log('Products loaded:', products.length);
    console.log('Cart items:', cart.length);
    console.log('Comparison items:', comparisonList.length);
});

// ============================================
// 46. EXPORT ALL FUNCTIONS
// ============================================
window.fetchProducts = fetchProducts;
window.openProductModal = openProductModal;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartCount = updateCartCount;
window.filterProducts = filterProducts;
window.addToComparison = addToComparison;
window.removeFromComparison = removeFromComparison;
window.compareProducts = compareProducts;
window.selectSuggestion = selectSuggestion;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.truncateText = truncateText;
window.clearCart = clearCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.getCartTotal = getCartTotal;
window.getCartItems = getCartItems;

// ============================================
// END OF JAVASCRIPT
// ============================================
