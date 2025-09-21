# Xano Backend Setup Guide

## Required Database Tables

### 1. Products Table
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Orders Table
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_whatsapp VARCHAR(50),
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_reference VARCHAR(255),
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. Order Items Table
```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 4. Admins Table
```sql
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Required API Endpoints

### Public Endpoints

#### GET /products
- **Purpose**: Fetch all products or filter by category
- **Query Parameters**: 
  - `category` (optional): Filter by product category
- **Response**: Array of product objects

#### GET /products/{id}
- **Purpose**: Fetch single product details
- **Response**: Single product object

#### POST /orders
- **Purpose**: Create a new order
- **Body**:
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+234123456789",
  "customer_whatsapp": "+234123456789",
  "delivery_address": "123 Main St, Lagos",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 89.99
    }
  ],
  "total_amount": 179.98,
  "payment_status": "pending",
  "order_status": "pending"
}
```

#### POST /verify-payment
- **Purpose**: Verify Paystack payment and update order
- **Body**:
```json
{
  "reference": "paystack_reference",
  "order_id": 123
}
```
- **Logic**: 
  1. Verify payment with Paystack API
  2. Update order payment_status to 'completed'
  3. Reduce product stock quantities

### Admin Endpoints (Require Authentication)

#### POST /auth/login
- **Purpose**: Admin login
- **Body**:
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```
- **Response**:
```json
{
  "authToken": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```

#### GET /admin/products
- **Purpose**: Get all products for admin management
- **Headers**: `Authorization: Bearer {token}`

#### POST /admin/products
- **Purpose**: Create new product
- **Headers**: `Authorization: Bearer {token}`
- **Body**: Product object

#### PUT /admin/products/{id}
- **Purpose**: Update existing product
- **Headers**: `Authorization: Bearer {token}`
- **Body**: Updated product object

#### DELETE /admin/products/{id}
- **Purpose**: Delete product
- **Headers**: `Authorization: Bearer {token}`

#### GET /admin/orders
- **Purpose**: Get all orders for admin management
- **Headers**: `Authorization: Bearer {token}`

#### PUT /admin/orders/{id}
- **Purpose**: Update order status
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
```json
{
  "status": "processing"
}
```

## Xano Configuration Steps

### 1. Database Setup
1. Create the four tables above in your Xano database
2. Set up proper relationships between tables
3. Add indexes on frequently queried columns (category, email, etc.)

### 2. Authentication Setup
1. Enable JWT authentication in Xano
2. Create authentication endpoints for admin login
3. Set token expiration (recommended: 24 hours)

### 3. API Endpoints Creation
1. Create all endpoints listed above
2. Add proper input validation
3. Set up error handling and appropriate HTTP status codes
4. Configure CORS headers for your domain

### 4. Paystack Integration
1. Add your Paystack secret key to Xano environment variables
2. Create function to verify payments with Paystack API
3. Implement stock reduction logic after successful payment

### 5. Security Considerations
1. Hash admin passwords using bcrypt
2. Validate all input data
3. Implement rate limiting on public endpoints
4. Use HTTPS only
5. Sanitize database queries to prevent SQL injection

## Environment Variables Needed
- `PAYSTACK_SECRET_KEY`: Your Paystack secret key
- `JWT_SECRET`: Secret key for JWT token generation
- `FRONTEND_URL`: Your frontend domain for CORS

## Testing Checklist
- [ ] Products can be fetched and displayed
- [ ] Admin can login and manage products
- [ ] Orders can be created successfully
- [ ] Paystack payments are verified correctly
- [ ] Stock quantities are updated after purchase
- [ ] Admin can view and update order statuses