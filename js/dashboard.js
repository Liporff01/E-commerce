        // Check admin authentication on page load
        document.addEventListener('DOMContentLoaded', function() {
            if (!window.xanoAPI.isAdminAuthenticated()) {
                window.location.href = '/html/admin-login.html';
                return;
            }
            
            // Load existing products
            loadProducts();
        });
        
        // Load products from Xano
        async function loadProducts() {
            try {
                const products = await window.xanoAPI.getAdminProducts();
                displayProducts(products);
            } catch (error) {
                console.error('Error loading products:', error);
                alert('Failed to load products. Please refresh the page.');
            }
        }
        
        // Display products in a table or list
        function displayProducts(products) {
            // Add a products list section to the dashboard
            const mainContent = document.querySelector('.main-content');
            
            // Check if products list already exists
            let productsList = document.getElementById('products-list');
            if (!productsList) {
                productsList = document.createElement('div');
                productsList.id = 'products-list';
                productsList.className = 'form-container';
                productsList.innerHTML = `
                    <h2>Existing Products</h2>
                    <div class="products-table-container">
                        <table class="products-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="products-table-body">
                            </tbody>
                        </table>
                    </div>
                `;
                mainContent.appendChild(productsList);
            }
            
            const tbody = document.getElementById('products-table-body');
            tbody.innerHTML = '';
            
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${product.image_url || 'https://via.placeholder.com/50'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>₦${parseFloat(product.price).toFixed(2)}</td>
                    <td>${product.stock || 0}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-secondary" onclick="deleteProduct(${product.id})" style="background: #e74c3c;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
        
        // Edit product function
        async function editProduct(id) {
            try {
                const product = await window.xanoAPI.getProduct(id);
                
                // Populate form with product data
                document.getElementById('productName').value = product.name;
                document.getElementById('productCategory').value = product.category;
                document.getElementById('about').value = product.description || '';
                document.getElementById('productPrice').value = product.price;
                document.getElementById('initialStock').value = product.stock || 0;
                
                // Change form title and button text
                document.querySelector('.form-container h2').textContent = 'Edit Product';
                document.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Update Product';
                
                // Store product ID for update
                document.getElementById('productForm').setAttribute('data-product-id', id);
                
            } catch (error) {
                console.error('Error loading product:', error);
                alert('Failed to load product details.');
            }
        }
        
        // Delete product function
        async function deleteProduct(id) {
            if (!confirm('Are you sure you want to delete this product?')) {
                return;
            }
            
            try {
                await window.xanoAPI.deleteProduct(id);
                alert('Product deleted successfully!');
                loadProducts(); // Reload the products list
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product.');
            }
        }
        
        // Image preview functionality
        const imageInput = document.getElementById('image');
        const imagePreview = document.getElementById('imagePreview');
        const fileButtonText = document.getElementById('fileButtonText');
        const addVariationBtn = document.getElementById('addVariationBtn');
        const variationsList = document.getElementById('variationsList');
        let variationCount = 0;
        
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.addEventListener('load', function() {
                    imagePreview.style.display = 'block';
                    imagePreview.querySelector('img').src = this.result;
                    fileButtonText.textContent = ' Change image';
                });
                
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
                imagePreview.querySelector('img').src = '';
                fileButtonText.textContent = ' Choose an image';
            }
        });
        
        // Add variation functionality
        addVariationBtn.addEventListener('click', function() {
            variationCount++;
            const variationId = `variation-${variationCount}`;
            
            const variationItem = document.createElement('div');
            variationItem.className = 'variation-item';
            variationItem.id = variationId;
            
            variationItem.innerHTML = `
                <div class="variation-item-header">
                    <div class="variation-title">Variation #${variationCount}</div>
                    <div class="variation-actions">
                        <button type="button" class="btn btn-secondary" onclick="removeVariation('${variationId}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
                
                <div class="variation-grid">
                    <div>
                        <div class="form-group">
                            <label>Variation Name</label>
                            <input type="text" placeholder="e.g., Color, Size, etc." class="input-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Options</label>
                            <input type="text" placeholder="e.g., Red, Blue, Green (comma separated)" class="input-control" required>
                            <small style="color: #777; display: block; margin-top: 5px;">Separate options with commas</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Additional Price ($)</label>
                            <input type="number" placeholder="0.00" min="0" step="0.01" class="input-control">
                            <small style="color: #777; display: block; margin-top: 5px;">Extra cost for this variation (if any)</small>
                        </div>
                    </div>
                    
                    <div>
                        <div class="form-group">
                            <label>Stock Quantity</label>
                            <input type="number" placeholder="Enter quantity" min="0" class="input-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label>SKU (Stock Keeping Unit)</label>
                            <input type="text" placeholder="e.g., TSHIRT-RED-M" class="input-control">
                        </div>
                        
                        <div class="form-group">
                            <label>Variation Image (Optional)</label>
                            <div class="file-input-container">
                                <input type="file" accept="image/*" class="input-control variation-image">
                                <div class="file-input-button">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <span>Choose variation image</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            variationsList.appendChild(variationItem);
            
            // Add event listener for the new variation image input
            const variationImageInput = variationItem.querySelector('.variation-image');
            variationImageInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    const buttonText = this.parentElement.querySelector('.file-input-button span');
                    
                    reader.addEventListener('load', function() {
                        buttonText.textContent = ' Change image';
                    });
                    
                    reader.readAsDataURL(file);
                }
            });
        });
        
        // Remove variation function
        function removeVariation(id) {
            const variation = document.getElementById(id);
            if (variation) {
                variation.remove();
            }
        }
        
        // Form submission handling
        document.getElementById('productForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            const productId = this.getAttribute('data-product-id');
            
            // Collect form data
            const productData = {
                name: document.getElementById('productName').value,
                category: document.getElementById('productCategory').value,
                description: document.getElementById('about').value,
                price: parseFloat(document.getElementById('productPrice').value),
                stock: parseInt(document.getElementById('initialStock').value) || 0
            };
            
            // Handle image upload if present
            const imageFile = imageInput.files[0];
            if (imageFile) {
                // In a real implementation, you'd upload the image to a service like Cloudinary
                // For now, we'll use a placeholder
                productData.image_url = 'https://via.placeholder.com/400x300';
            }
            
            try {
                if (productId) {
                    // Update existing product
                    await window.xanoAPI.updateProduct(productId, productData);
                    alert('Product updated successfully!');
                } else {
                    // Create new product
                    await window.xanoAPI.createProduct(productData);
                    alert('Product created successfully!');
                }
                
                // Reset form
                this.reset();
                this.removeAttribute('data-product-id');
                imagePreview.style.display = 'none';
                fileButtonText.textContent = ' Choose an image';
                variationsList.innerHTML = '';
                variationCount = 0;
                
                // Reset form title
                document.querySelector('.form-container h2').textContent = 'Add New Product';
                document.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Add to Store';
                
                // Reload products list
                loadProducts();
                
            } catch (error) {
                console.error('Error saving product:', error);
                alert('Failed to save product. Please try again.');
            }
        });
        
        // Add logout functionality
        function addLogoutButton() {
            const userInfo = document.querySelector('.user-info');
            const logoutBtn = document.createElement('button');
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            logoutBtn.className = 'btn btn-secondary';
            logoutBtn.style.marginLeft = '10px';
            logoutBtn.onclick = function() {
                if (confirm('Are you sure you want to logout?')) {
                    window.xanoAPI.adminLogout();
                    window.location.href = '/html/admin-login.html';
                }
            };
            userInfo.appendChild(logoutBtn);
        }
        
        // Add logout button when page loads
        document.addEventListener('DOMContentLoaded', function() {
            addLogoutButton();
        });