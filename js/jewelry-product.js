        // Paystack public key (replace with your live key)
        const PAYSTACK_PUBLIC_KEY = 'pk_live_your_live_public_key_here'; // Replace with your actual key

        // EmailJS configuration (replace with your actual credentials)
        const EMAILJS_CONFIG = {
            SERVICE_ID: 'your_service_id',
            TEMPLATE_ID: 'your_template_id',
            USER_ID: 'your_user_id'
        };


        // Fetch products from Xano API
        async function fetchProducts() {
            try {
                const products = await window.xanoAPI.getProducts('jewelry');
                return products.map(product => ({
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: parseFloat(product.price),
                    stock: product.stock || 0,
                    stockStatus: getStockStatus(product.stock || 0),
                    image: product.image_url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'
                }));
            } catch (error) {
                console.error('Error fetching products:', error);
                // Show error message to user
                showErrorMessage('Failed to load products. Please refresh the page.');
                return [];
            }
        }
        
        // Helper function to determine stock status
        function getStockStatus(stock) {
            if (stock === 0) return 'out-of-stock';
            if (stock <= 5) return 'low-stock';
            return 'in-stock';
        }
        
        // Show error message to user
        function showErrorMessage(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #e74c3c;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                max-width: 300px;
            `;
            notification.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 5000);
        }

        // Cart functionality
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Update cart count
        function updateCartCount() {
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            document.querySelector('.cart-count').textContent = count;
            localStorage.setItem('cartCount', count);
        }
        
        // Add to cart
        function addToCart(product, quantity = 1) {
            const existingItem = cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showAddedToCartMessage(product.name);
        }
        
        // Remove from cart
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCart();
        }
        
        // Update quantity
        function updateQuantity(productId, quantity) {
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    removeFromCart(productId);
                } else {
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                }
            }
        }
        
        // Calculate cart total
        function calculateCartTotal() {
            return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        }
        
        // Show added to cart message
        function showAddedToCartMessage(productName) {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = 'var(--primary)';
            notification.style.color = 'white';
            notification.style.padding = '15px 20px';
            notification.style.borderRadius = '5px';
            notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            notification.style.zIndex = '1000';
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            notification.innerHTML = `<i class="fas fa-check-circle"></i> ${productName} added to cart!`;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
            }, 10);
            
            // Animate out and remove after 3 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
        
        // Render cart items
        function renderCart() {
            const cartItems = document.getElementById('cart-items');
            const cartTotal = document.getElementById('cart-total');
            
            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                    </div>
                `;
                cartTotal.textContent = '₦0.00';
                return;
            }
            
            let itemsHTML = '';
            cart.forEach(item => {
                itemsHTML += `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">₦${item.price.toFixed(2)}</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="remove-item" data-id="${item.id}"><i class="fas fa-times"></i></button>
                    </div>
                `;
            });
            
            cartItems.innerHTML = itemsHTML;
            cartTotal.textContent = `₦${calculateCartTotal().toFixed(2)}`;
            
            // Add event listeners to quantity buttons
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    const item = cart.find(item => item.id === id);
                    if (item) {
                        updateQuantity(id, item.quantity - 1);
                    }
                });
            });
            
            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    const item = cart.find(item => item.id === id);
                    if (item) {
                        updateQuantity(id, item.quantity + 1);
                    }
                });
            });
            
            document.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    const quantity = parseInt(this.value) || 1;
                    updateQuantity(id, quantity);
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    removeFromCart(id);
                });
            });
        }
        
        // Render checkout summary
        function renderCheckoutSummary() {
            const summaryContainer = document.getElementById('checkout-summary-items');
            const checkoutTotal = document.getElementById('checkout-total');
            
            let summaryHTML = '';
            cart.forEach(item => {
                summaryHTML += `
                    <div class="summary-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>₦${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;
            });
            
            summaryContainer.innerHTML = summaryHTML;
            checkoutTotal.textContent = `₦${calculateCartTotal().toFixed(2)}`;
        }
        
        // Send order via EmailJS
        function sendOrderEmail(orderData) {
            // Initialize EmailJS
            emailjs.init(EMAILJS_CONFIG.USER_ID);
            
            // Prepare email parameters
            const templateParams = {
                to_name: orderData.name,
                to_email: orderData.email,
                phone: orderData.phone,
                whatsapp: orderData.whatsapp,
                address: orderData.address,
                order_total: `₦${orderData.total.toFixed(2)}`,
                order_items: orderData.items.map(item => 
                    `${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toFixed(2)}`
                ).join('\n')
            };
            
            // Send email
            emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams)
                .then(response => {
                    console.log('Email sent successfully!', response.status, response.text);
                })
                .catch(error => {
                    console.error('Failed to send email:', error);
                });
        }
        
        // Process payment with Paystack
        function processPayment(orderData) {
            // First create the order in Xano
            createOrderInXano(orderData).then(order => {
                // Then process payment
                processPaystackPayment(orderData, order.id);
            }).catch(error => {
                console.error('Error creating order:', error);
                alert('Failed to create order. Please try again.');
            });
        }
        
        // Create order in Xano
        async function createOrderInXano(orderData) {
            const orderPayload = {
                customer_name: orderData.name,
                customer_email: orderData.email,
                customer_phone: orderData.phone,
                customer_whatsapp: orderData.whatsapp,
                delivery_address: orderData.address,
                items: orderData.items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                total_amount: orderData.total,
                payment_status: 'pending',
                order_status: 'pending'
            };
            
            return await window.xanoAPI.createOrder(orderPayload);
        }
        
        // Process Paystack payment
        function processPaystackPayment(orderData, orderId) {
            const handler = PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,
                email: orderData.email,
                amount: Math.round(orderData.total * 100), // Convert to kobo
                currency: 'NGN',
                ref: `ELG-${orderId}-${Date.now()}`, // Use order ID in reference
                callback: async function(response) {
                    // Payment successful
                    console.log('Payment successful!', response);
                    
                    try {
                        // Verify payment with Xano
                        await window.xanoAPI.verifyPayment({
                            reference: response.reference,
                            order_id: orderId
                        });
                        
                        // Save order to local storage for reference
                        saveOrderToStorage(orderData, response.reference);
                        
                        // Send order email
                        sendOrderEmail(orderData);
                        
                        // Show success message
                        document.getElementById('order-success').classList.add('active');
                        document.getElementById('modal-overlay').classList.add('active');
                        
                        // Clear cart
                        cart = [];
                        localStorage.removeItem('cart');
                        updateCartCount();
                        
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed. Please contact support with reference: ' + response.reference);
                    }
                },
                onClose: function() {
                    // User closed the payment window
                    alert('Payment was not completed. Please try again.');
                }
            });
            
            handler.openIframe();
        }
        
        // Save order to local storage
        function saveOrderToStorage(orderData, reference) {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const order = {
                id: reference,
                date: new Date().toISOString(),
                customer: {
                    name: orderData.name,
                    email: orderData.email,
                    phone: orderData.phone,
                    whatsapp: orderData.whatsapp,
                    address: orderData.address
                },
                items: orderData.items,
                total: orderData.total,
                status: 'completed'
            };
            
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
        }

        document.addEventListener('DOMContentLoaded', async function() {
            // Mobile menu toggle
            const hamburger = document.getElementById('hamburger');
            const navMenu = document.getElementById('nav-menu');
            const loadingOverlay = document.getElementById('loading-overlay');
            const cartModal = document.getElementById('cart-modal');
            const cartIcon = document.getElementById('cart-icon');
            const closeCart = document.getElementById('close-cart');
            const checkoutBtn = document.getElementById('checkout-btn');
            const checkoutModal = document.getElementById('checkout-modal');
            const closeCheckout = document.getElementById('close-checkout');
            const checkoutForm = document.getElementById('checkout-form');
            const paystackBtn = document.getElementById('paystack-btn');
            const modalOverlay = document.getElementById('modal-overlay');
            const orderSuccess = document.getElementById('order-success');
            const successOkBtn = document.getElementById('success-ok-btn');
            
            // Initialize cart
            updateCartCount();
            
            // Mobile menu toggle
            hamburger.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                hamburger.innerHTML = navMenu.classList.contains('active') ? 
                    '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            });
            
            // Cart modal toggle
            cartIcon.addEventListener('click', function(e) {
                e.preventDefault();
                cartModal.classList.add('active');
                modalOverlay.classList.add('active');
                renderCart();
            });
            
            closeCart.addEventListener('click', function() {
                cartModal.classList.remove('active');
                modalOverlay.classList.remove('active');
            });
            
            // Checkout modal toggle
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('Your cart is empty. Add some products first.');
                    return;
                }
                
                cartModal.classList.remove('active');
                checkoutModal.classList.add('active');
                renderCheckoutSummary();
            });
            
            closeCheckout.addEventListener('click', function() {
                checkoutModal.classList.remove('active');
                modalOverlay.classList.remove('active');
            });
            
            // Process checkout form
            checkoutForm.addEventListener('submit', function(e) {
                e.preventDefault();
            });
            
            // Paystack payment
            paystackBtn.addEventListener('click', function() {
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const whatsapp = document.getElementById('whatsapp').value;
                const address = document.getElementById('address').value;
                
                if (!name || !email || !phone || !whatsapp || !address) {
                    alert('Please fill in all fields');
                    return;
                }
                
                const orderData = {
                    name,
                    email,
                    phone,
                    whatsapp,
                    address,
                    items: [...cart],
                    total: calculateCartTotal()
                };
                
                // Process payment
                processPayment(orderData);
                
                // Close checkout modal
                checkoutModal.classList.remove('active');
            });
            
            // Order success modal
            successOkBtn.addEventListener('click', function() {
                orderSuccess.classList.remove('active');
                modalOverlay.classList.remove('active');
            });
            
            // Close modals when clicking overlay
            modalOverlay.addEventListener('click', function() {
                cartModal.classList.remove('active');
                checkoutModal.classList.remove('active');
                orderSuccess.classList.remove('active');
                this.classList.remove('active');
            });
            
            // Initialize page with products
            let currentPage = 1;
            const productsPerPage = 12;
            let allProducts = [];
            let filteredProducts = [];
            
            // Show loading animation
            function showLoading() {
                loadingOverlay.classList.add('active');
            }
            
            // Hide loading animation
            function hideLoading() {
                setTimeout(() => {
                    loadingOverlay.classList.remove('active');
                }, 500);
            }
            
            // Get stock status class based on quantity
            function getStockStatusClass(quantity) {
                if (quantity === 0) return 'out-of-stock';
                if (quantity <= 5) return 'low-stock';
                return 'in-stock';
            }
            
            // Get stock status text based on quantity
            function getStockStatusText(quantity) {
                if (quantity === 0) return 'Out of stock';
                if (quantity <= 5) return `Only ${quantity} left in stock`;
                return `${quantity} in stock`;
            }
            
            // Render products based on current page
            function renderProducts() {
                showLoading();
                
                setTimeout(() => {
                    const container = document.getElementById('products-container');
                    container.innerHTML = '';
                    
                    const startIndex = (currentPage - 1) * productsPerPage;
                    const endIndex = startIndex + productsPerPage;
                    const productsToRender = filteredProducts.slice(startIndex, endIndex);
                    
                    document.getElementById('showing-count').textContent = productsToRender.length;
                    document.getElementById('total-count').textContent = filteredProducts.length;
                    
                    if (productsToRender.length === 0) {
                        container.innerHTML = '<div class="no-results">No products found matching your criteria.</div>';
                        hideLoading();
                        return;
                    }
                    
                    productsToRender.forEach((product, index) => {
                        const productEl = document.createElement('div');
                        productEl.className = 'product-card';
                        productEl.setAttribute('data-category', product.category);
                        productEl.setAttribute('data-price', product.price);
                        productEl.setAttribute('data-stock', product.stockStatus);
                        productEl.style.animationDelay = `${index * 0.05}s`;
                        
                        // Add out of stock label if needed
                        const outOfStockLabel = product.stock === 0 ? 
                            '<div class="out-of-stock-label">Out of Stock</div>' : '';
                        
                        productEl.innerHTML = `
                            ${outOfStockLabel}
                            <div class="product-img-container">
                                <img src="${product.image}" alt="${product.name}" class="product-img">
                                <div class="product-overlay">
                                    ${product.stock > 0 ? 
                                        '<button class="add-to-cart" data-id="${product.id}">Add to Cart</button>' : 
                                        '<button class="add-to-cart" disabled>Out of Stock</button>'}
                                </div>
                            </div>
                            <div class="product-info">
                                <p class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                                <h3 class="product-name">${product.name}</h3>
                                <p class="product-price">₦${product.price.toFixed(2)}</p>
                                <p class="stock-info ${getStockStatusClass(product.stock)}">
                                    ${getStockStatusText(product.stock)}
                                </p>
                            </div>
                        `;
                        
                        container.appendChild(productEl);
                    });
                    
                    // Add event listeners to the new Add to Cart buttons
                    document.querySelectorAll('.add-to-cart:not([disabled])').forEach(button => {
                        button.addEventListener('click', function() {
                            const productId = parseInt(this.getAttribute('data-id'));
                            const product = allProducts.find(p => p.id === productId);
                            
                            if (product) {
                                addToCart(product);
                                renderCart();
                            }
                        });
                    });
                    
                    renderPagination();
                    hideLoading();
                }, 500); // Simulate loading for 0.5s
            }
            
            // Render pagination controls
            function renderPagination() {
                const paginationContainer = document.getElementById('pagination');
                paginationContainer.innerHTML = '';
                
                const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
                
                if (totalPages <= 1) return;
                
                // Previous button
                if (currentPage > 1) {
                    const prevBtn = document.createElement('a');
                    prevBtn.href = '#';
                    prevBtn.className = 'pagination-item';
                    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                    prevBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        showLoading();
                        setTimeout(() => {
                            currentPage--;
                            renderProducts();
                            window.scrollTo(0, 0);
                        }, 500);
                    });
                    paginationContainer.appendChild(prevBtn);
                }
                
                // Page numbers
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                
                if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }
                
                if (startPage > 1) {
                    const firstPage = document.createElement('a');
                    firstPage.href = '#';
                    firstPage.className = 'pagination-item';
                    firstPage.textContent = '1';
                    firstPage.addEventListener('click', function(e) {
                        e.preventDefault();
                        showLoading();
                        setTimeout(() => {
                            currentPage = 1;
                            renderProducts();
                            window.scrollTo(0, 0);
                        }, 500);
                    });
                    paginationContainer.appendChild(firstPage);
                    
                    if (startPage > 2) {
                        const dots = document.createElement('span');
                        dots.className = 'pagination-dots';
                        dots.textContent = '...';
                        paginationContainer.appendChild(dots);
                    }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                    const pageBtn = document.createElement('a');
                    pageBtn.href = '#';
                    pageBtn.className = `pagination-item ${i === currentPage ? 'active' : ''}`;
                    pageBtn.textContent = i;
                    pageBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        showLoading();
                        setTimeout(() => {
                            currentPage = i;
                            renderProducts();
                            window.scrollTo(0, 0);
                        }, 500);
                    });
                    paginationContainer.appendChild(pageBtn);
                }
                
                if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                        const dots = document.createElement('span');
                        dots.className = 'pagination-dots';
                        dots.textContent = '...';
                        paginationContainer.appendChild(dots);
                    }
                    
                    const lastPage = document.createElement('a');
                    lastPage.href = '#';
                    lastPage.className = 'pagination-item';
                    lastPage.textContent = totalPages;
                    lastPage.addEventListener('click', function(e) {
                        e.preventDefault();
                        showLoading();
                        setTimeout(() => {
                            currentPage = totalPages;
                            renderProducts();
                            window.scrollTo(0, 0);
                        }, 500);
                    });
                    paginationContainer.appendChild(lastPage);
                }
                
                // Next button
                if (currentPage < totalPages) {
                    const nextBtn = document.createElement('a');
                    nextBtn.href = '#';
                    nextBtn.className = 'pagination-item';
                    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                    nextBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        showLoading();
                        setTimeout(() => {
                            currentPage++;
                            renderProducts();
                            window.scrollTo(0, 0);
                        }, 500);
                    });
                    paginationContainer.appendChild(nextBtn);
                }
            }
            
            // Filter functionality
            function filterProducts() {
                const selectedCategories = Array.from(document.querySelectorAll('.filter-option input:checked')).map(input => input.id);
                const selectedStockStatus = Array.from(document.querySelectorAll('#stock-status-filter input:checked')).map(input => input.id);
                const searchTerm = document.getElementById('search-input').value.toLowerCase();
                
                filteredProducts = allProducts.filter(product => {
                    // Category filter
                    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
                    
                    // Stock status filter
                    const stockMatch = selectedStockStatus.length === 0 || selectedStockStatus.includes(product.stockStatus);
                    
                    // Search filter
                    const searchMatch = searchTerm === '' || 
                        product.name.toLowerCase().includes(searchTerm) ||
                        product.category.toLowerCase().includes(searchTerm);
                    
                    return categoryMatch && stockMatch && searchMatch;
                });
                
                currentPage = 1;
                renderProducts();
            }
            
            // Sort functionality
            function sortProducts(sortOption) {
                switch(sortOption) {
                    case 'Price: Low to High':
                        filteredProducts.sort((a, b) => a.price - b.price);
                        break;
                    case 'Price: High to Low':
                        filteredProducts.sort((a, b) => b.price - a.price);
                        break;
                    case 'Newest First':
                        filteredProducts.sort((a, b) => b.id - a.id);
                        break;
                    default:
                        // Default sorting (by ID)
                        filteredProducts.sort((a, b) => a.id - a.id);
                }
                
                currentPage = 1;
                renderProducts();
            }
            
            // Initialize the page
            async function initPage() {
                showLoading();
                
                // Fetch products
                allProducts = await fetchProducts();
                filteredProducts = [...allProducts];
                
                // Add event listeners to filter options
                document.querySelectorAll('.filter-option input').forEach(checkbox => {
                    checkbox.addEventListener('change', filterProducts);
                });
                
                // Search functionality
                document.getElementById('search-input').addEventListener('input', filterProducts);
                
                // Sort functionality
                document.getElementById('sort-select').addEventListener('change', function() {
                    sortProducts(this.value);
                });
                
                // Reset filters
                document.querySelectorAll('.reset-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const widget = this.closest('.filter-widget');
                        const checkboxes = widget.querySelectorAll('input[type="checkbox"]');
                        checkboxes.forEach(checkbox => {
                            checkbox.checked = true;
                        });
                        filterProducts();
                    });
                });
                
                // Load cart count from local storage
                const savedCount = localStorage.getItem('cartCount');
                if (savedCount) {
                    document.querySelector('.cart-count').textContent = savedCount;
                }
                
                // Initial render
                renderProducts();
                
                // Dropdown menu for mobile
                const dropdowns = document.querySelectorAll('.dropdown');
                
                dropdowns.forEach(dropdown => {
                    dropdown.addEventListener('click', function(e) {
                        if (window.innerWidth <= 992) {
                            e.preventDefault();
                            this.classList.toggle('active');
                        }
                    });
                });
            }
            
            // Start the page initialization
            initPage();
        });