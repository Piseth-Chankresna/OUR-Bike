# OUR-Bikes Store - API Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Products](#products)
4. [Cart](#cart)
5. [Orders](#orders)
6. [Users](#users)
7. [Reviews](#reviews)
8. [Search](#search)
9. [Notifications](#notifications)
10. [Error Handling](#error-handling)

## 🌐 Overview

### Base URL
```
Development: http://localhost:4200/api
Staging: https://staging.ourbikes.com/api
Production: https://api.ourbikes.com
```

### Authentication
All API requests require authentication unless marked as public. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format
All responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-03-30T10:00:00Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2024-03-30T10:00:00Z"
}
```

## 🔐 Authentication

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "user_123",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user",
      "createdAt": 1711800000000
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "user_123",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user",
      "lastLogin": 1711800000000
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Social Login
```http
POST /auth/social/{provider}
```

**Providers:** `google`, `facebook`, `github`

**Request Body:**
```json
{
  "accessToken": "provider_access_token",
  "idToken": "provider_id_token"
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Request Headers:**
```
Authorization: Bearer <refresh-token>
```

### Logout
```http
POST /auth/logout
```

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

### Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## 🛍️ Products

### Get All Products
```http
GET /products
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `category`: Filter by category
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `sortBy`: Sort field (name, price, rating, dateAdded)
- `sortOrder`: Sort direction (asc, desc)
- `search`: Search query

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product_123",
        "name": "Honda CRF450R",
        "category": "bikes",
        "price": 9999,
        "description": "Professional motocross bike...",
        "images": ["https://picsum.photos/seed/honda/400/300.jpg"],
        "stock": 10,
        "dateAdded": 1711800000000,
        "specifications": {
          "brand": "Honda",
          "model": "CRF450R",
          "engineSize": "450cc",
          "color": "Red",
          "weight": "110kg"
        },
        "rating": 4.5,
        "reviews": 23
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 60,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Product by ID
```http
GET /products/{productId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "product_123",
    "name": "Honda CRF450R",
    "category": "bikes",
    "price": 9999,
    "description": "Detailed product description...",
    "images": [
      "https://picsum.photos/seed/honda1/400/300.jpg",
      "https://picsum.photos/seed/honda2/400/300.jpg"
    ],
    "stock": 10,
    "dateAdded": 1711800000000,
    "specifications": {
      "brand": "Honda",
      "model": "CRF450R",
      "engineSize": "450cc",
      "color": "Red",
      "weight": "110kg",
      "dimensions": "210x85x120cm",
      "material": "Aluminum",
      "features": ["Electric Start", "Fuel Injection"],
      "warranty": "2 years"
    },
    "rating": 4.5,
    "reviews": 23,
    "relatedProducts": ["product_456", "product_789"]
  }
}
```

### Get Featured Products
```http
GET /products/featured
```

**Query Parameters:**
- `limit`: Number of products to return (default: 6)

### Get Products by Category
```http
GET /products/category/{category}
```

**Categories:** `bikes`, `accessory`, `souvenir`, `tool`

### Search Products
```http
GET /products/search
```

**Query Parameters:**
- `q`: Search query
- `category`: Filter by category
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `page`: Page number
- `limit`: Items per page

## 🛒 Cart

### Get Cart
```http
GET /cart
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "product_123",
        "name": "Honda CRF450R",
        "price": 9999,
        "quantity": 2,
        "image": "https://picsum.photos/seed/honda/400/300.jpg",
        "subtotal": 19998
      }
    ],
    "summary": {
      "subtotal": 19998,
      "tax": 1599.84,
      "shipping": 50,
      "total": 21647.84,
      "itemCount": 2
    }
  }
}
```

### Add to Cart
```http
POST /cart/add
```

**Request Body:**
```json
{
  "productId": "product_123",
  "quantity": 2
}
```

### Update Cart Item
```http
PUT /cart/item/{itemId}
```

**Request Body:**
```json
{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /cart/item/{itemId}
```

### Clear Cart
```http
DELETE /cart/clear
```

### Apply Discount Code
```http
POST /cart/discount
```

**Request Body:**
```json
{
  "code": "SAVE10"
}
```

## 📦 Orders

### Get User Orders
```http
GET /orders
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_123",
        "userId": "user_123",
        "items": [
          {
            "productId": "product_123",
            "name": "Honda CRF450R",
            "price": 9999,
            "quantity": 2,
            "image": "https://picsum.photos/seed/honda/400/300.jpg"
          }
        ],
        "summary": {
          "subtotal": 19998,
          "tax": 1599.84,
          "shipping": 50,
          "total": 21647.84
        },
        "status": "delivered",
        "createdAt": 1711800000000,
        "shippingAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "trackingNumber": "1Z999AA1234567890",
        "estimatedDelivery": "2024-04-02T18:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 15
    }
  }
}
```

### Get Order by ID
```http
GET /orders/{orderId}
```

### Create Order
```http
POST /orders
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_123",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": {
    "type": "credit_card",
    "lastFour": "1234",
    "brand": "Visa"
  },
  "notes": "Please deliver after 5 PM"
}
```

### Cancel Order
```http
POST /orders/{orderId}/cancel
```

### Track Order
```http
GET /orders/{orderId}/track
```

## 👤 Users

### Get User Profile
```http
GET /users/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "user",
    "createdAt": 1711800000000,
    "lastLogin": 1711800000000,
    "preferences": {
      "newsletter": true,
      "emailNotifications": true,
      "language": "en",
      "currency": "USD"
    },
    "addresses": [
      {
        "id": "address_123",
        "type": "shipping",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA",
        "isDefault": true
      }
    ]
  }
}
```

### Update Profile
```http
PUT /users/profile
```

**Request Body:**
```json
{
  "fullName": "John Smith",
  "phoneNumber": "+1234567890",
  "preferences": {
    "newsletter": true,
    "emailNotifications": false,
    "language": "en",
    "currency": "USD"
  }
}
```

### Change Password
```http
POST /users/change-password
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

### Get User Addresses
```http
GET /users/addresses
```

### Add Address
```http
POST /users/addresses
```

**Request Body:**
```json
{
  "type": "shipping",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

### Update Address
```http
PUT /users/addresses/{addressId}
```

### Delete Address
```http
DELETE /users/addresses/{addressId}
```

## ⭐ Reviews

### Get Product Reviews
```http
GET /reviews/products/{productId}
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `sortBy`: Sort by (newest, oldest, rating, helpful)
- `rating`: Filter by rating (1-5)

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "productId": "product_123",
        "userId": "user_123",
        "userName": "John Doe",
        "rating": 5,
        "title": "Excellent bike!",
        "content": "Great performance and quality...",
        "verified": true,
        "helpful": 12,
        "createdAt": 1711800000000,
        "updatedAt": 1711800000000
      }
    ],
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 23,
      "ratingDistribution": {
        "5": 15,
        "4": 5,
        "3": 2,
        "2": 1,
        "1": 0
      }
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3
    }
  }
}
```

### Add Review
```http
POST /reviews/products/{productId}
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Excellent bike!",
  "content": "Great performance and quality..."
}
```

### Update Review
```http
PUT /reviews/{reviewId}
```

### Delete Review
```http
DELETE /reviews/{reviewId}
```

### Mark Review Helpful
```http
POST /reviews/{reviewId}/helpful
```

## 🔍 Search

### Search Suggestions
```http
GET /search/suggestions
```

**Query Parameters:**
- `q`: Search query
- `limit`: Number of suggestions (default: 8)

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "id": "product_123",
        "type": "product",
        "title": "Honda CRF450R",
        "subtitle": "$9,999",
        "image": "https://picsum.photos/seed/honda/400/300.jpg",
        "category": "bikes",
        "score": 95
      }
    ]
  }
}
```

### Search History
```http
GET /search/history
```

### Clear Search History
```http
DELETE /search/history
```

## 🔔 Notifications

### Get Notifications
```http
GET /notifications
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `type`: Filter by type (order, promo, system)
- `read`: Filter by read status (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "userId": "user_123",
        "type": "order",
        "title": "Order Shipped",
        "message": "Your order #12345 has been shipped.",
        "data": {
          "orderId": "order_123",
          "trackingNumber": "1Z999AA1234567890"
        },
        "read": false,
        "createdAt": 1711800000000
      }
    ],
    "unreadCount": 3
  }
}
```

### Mark Notification Read
```http
PUT /notifications/{notificationId}/read
```

### Mark All Notifications Read
```http
PUT /notifications/read-all
```

### Delete Notification
```http
DELETE /notifications/{notificationId}
```

## ❌ Error Handling

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity
- `429`: Too Many Requests
- `500`: Internal Server Error

### Error Codes
```json
{
  "AUTH_001": "Invalid credentials",
  "AUTH_002": "Token expired",
  "AUTH_003": "Account locked",
  "PROD_001": "Product not found",
  "PROD_002": "Product out of stock",
  "CART_001": "Cart item not found",
  "ORDER_001": "Order not found",
  "ORDER_002": "Cannot cancel shipped order",
  "RATE_001": "Review already exists",
  "RATE_002": "Cannot edit verified review",
  "SYS_001": "Maintenance mode active",
  "SYS_002": "Rate limit exceeded"
}
```

### Rate Limiting
- **Standard**: 100 requests per minute
- **Search**: 30 requests per minute
- **Upload**: 10 requests per minute
- **Burst**: 200 requests per 5 minutes

## 📚 SDK Examples

### JavaScript/TypeScript
```typescript
import { OurBikesAPI } from '@ourbikes/api-sdk';

const api = new OurBikesAPI({
  baseURL: 'https://api.ourbikes.com',
  token: 'your-jwt-token'
});

// Get products
const products = await api.products.getAll({
  category: 'bikes',
  minPrice: 5000,
  maxPrice: 15000
});

// Add to cart
await api.cart.add({
  productId: 'product_123',
  quantity: 2
});

// Create order
const order = await api.orders.create({
  items: [{ productId: 'product_123', quantity: 2 }],
  shippingAddress: address
});
```

### cURL Examples
```bash
# Get products
curl -X GET "https://api.ourbikes.com/products?category=bikes&limit=20" \
  -H "Authorization: Bearer your-jwt-token"

# Add to cart
curl -X POST "https://api.ourbikes.com/cart/add" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"productId": "product_123", "quantity": 2}'
```

## 🔧 Testing

### Sandbox Environment
- **URL**: https://sandbox-api.ourbikes.com
- **Purpose**: Development and testing
- **Data**: Reset daily
- **Rate Limits**: Higher limits for testing

### Test Data
- **Test Users**: Available in sandbox
- **Mock Products**: Sample product catalog
- **Simulated Orders**: Test order processing

---

*Last Updated: Phase 20 - Documentation & Training*
