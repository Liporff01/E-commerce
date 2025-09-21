/**
 * Xano API Integration Module
 * Handles all API calls to Xano backend
 */

class XanoAPI {
    constructor() {
        this.baseURL = 'https://x8ki-letl-twmt.n7.xano.io/workspace/125314-0/api';
        this.authToken = localStorage.getItem('admin_token');
    }

    // Helper method to make API calls
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token for admin endpoints
        if (this.authToken && endpoint.includes('/admin/')) {
            config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Public API methods
    async getProducts(category = null) {
        let endpoint = '/products';
        if (category) {
            endpoint += `?category=${category}`;
        }
        return this.makeRequest(endpoint);
    }

    async getProduct(id) {
        return this.makeRequest(`/products/${id}`);
    }

    async createOrder(orderData) {
        return this.makeRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async verifyPayment(paymentData) {
        return this.makeRequest('/verify-payment', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    // Admin API methods
    async adminLogin(credentials) {
        try {
            const response = await this.makeRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
            
            if (response.authToken) {
                this.authToken = response.authToken;
                localStorage.setItem('admin_token', this.authToken);
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    }

    async adminLogout() {
        this.authToken = null;
        localStorage.removeItem('admin_token');
    }

    async getAdminProducts() {
        return this.makeRequest('/admin/products');
    }

    async createProduct(productData) {
        return this.makeRequest('/admin/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return this.makeRequest(`/admin/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return this.makeRequest(`/admin/products/${id}`, {
            method: 'DELETE'
        });
    }

    async getAdminOrders() {
        return this.makeRequest('/admin/orders');
    }

    async updateOrderStatus(id, status) {
        return this.makeRequest(`/admin/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Utility methods
    isAdminAuthenticated() {
        return !!this.authToken;
    }

    setAuthToken(token) {
        this.authToken = token;
        localStorage.setItem('admin_token', token);
    }
}

// Create global instance
window.xanoAPI = new XanoAPI();