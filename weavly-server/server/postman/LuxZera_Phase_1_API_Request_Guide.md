# LuxZera Phase 1 API Request Guide

Base URL:

```text
{{baseUrl}} = http://localhost:8080
```

Protected APIs need:

```text
Authorization: Bearer {{token}}
```

Public GET APIs do not need auth.

---

## Products

### Get Products

```http
GET {{baseUrl}}/api/products
```

Auth: No auth

Body: None

### Create Product

```http
POST {{baseUrl}}/api/products
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Content-Type: `multipart/form-data`

Form fields:

```text
product = JSON string
images = file[] optional
```

Valid `product` JSON:

```json
{
  "name": "Luxury Silk Shirt",
  "sku": "LS-SHIRT-001",
  "description": "Premium silk shirt",
  "basePrice": 249.99,
  "salePrice": 199.99,
  "currency": "USD",
  "audience": "MEN",
  "status": "ACTIVE",
  "categoryId": "{{categoryId}}",
  "subcategoryId": "{{categoryId}}",
  "brandIds": ["{{brandId}}"],
  "thumbnailUrl": "https://example.com/shirt-thumb.jpg",
  "featured": true,
  "trending": false,
  "newArrival": true,
  "tags": ["silk", "luxury"],
  "seoSlug": "luxury-silk-shirt",
  "variants": [
    {
      "sku": "LS-SHIRT-001-M-BLACK",
      "stockQuantity": 25,
      "priceOverride": 209.99,
      "attributes": {
        "size": "M",
        "color": "Black"
      },
      "imageUrl": "https://example.com/shirt-black.jpg"
    }
  ]
}
```

Required fields:

```text
name, sku, basePrice, audience, categoryId, variants
```

Allowed `audience` values:

```text
MEN, WOMEN, UNISEX, KIDS
```

Allowed `status` values:

```text
DRAFT, ACTIVE, HIDDEN, OUT_OF_STOCK, DISCONTINUED
```

### Update Product

```http
PUT {{baseUrl}}/api/products/{{productId}}
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Content-Type: `multipart/form-data`

Form fields:

```text
product = JSON string
images = file[] optional
```

Valid `product` JSON:

```json
{
  "name": "Luxury Silk Shirt Updated",
  "sku": "LS-SHIRT-001",
  "description": "Updated description",
  "basePrice": 249.99,
  "salePrice": 189.99,
  "currency": "USD",
  "audience": "MEN",
  "status": "ACTIVE",
  "categoryId": "{{categoryId}}",
  "subcategoryId": "{{categoryId}}",
  "brandIds": ["{{brandId}}"],
  "thumbnailUrl": "https://example.com/new-thumb.jpg",
  "featured": true,
  "trending": true,
  "newArrival": false,
  "tags": ["silk", "luxury", "edited"],
  "seoSlug": "luxury-silk-shirt-updated",
  "existingImageUrls": ["https://example.com/old-image.jpg"],
  "variants": [
    {
      "sku": "LS-SHIRT-001-M-BLACK",
      "stockQuantity": 30,
      "priceOverride": 199.99,
      "attributes": {
        "size": "M",
        "color": "Black"
      },
      "imageUrl": "https://example.com/shirt-black.jpg"
    }
  ]
}
```

All update fields are optional, but send the fields you want to change.

---

## Categories

### Get Categories

```http
GET {{baseUrl}}/api/categories
```

Auth: No auth

Body: None

### Create Category

```http
POST {{baseUrl}}/api/categories
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Content-Type: `application/json`

```json
{
  "name": "Men",
  "slug": "men",
  "description": "Menswear collection",
  "parentId": null,
  "hidden": false,
  "displayOrder": 1
}
```

Required fields:

```text
name
```

For subcategory:

```json
{
  "name": "Shirts",
  "slug": "shirts",
  "description": "Men shirts",
  "parentId": "{{categoryId}}",
  "hidden": false,
  "displayOrder": 1
}
```

### Update Category

```http
PUT {{baseUrl}}/api/categories/{{categoryId}}
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Content-Type: `application/json`

```json
{
  "name": "Men Updated",
  "slug": "men-updated",
  "description": "Updated collection",
  "parentId": null,
  "hidden": false,
  "displayOrder": 2
}
```

### Hide or Show Category

```http
PATCH {{baseUrl}}/api/categories/{{categoryId}}/visibility?hidden=true
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Body: None

Use `hidden=false` to show it again.

### Change Category Display Order

```http
PATCH {{baseUrl}}/api/categories/{{categoryId}}/display-order?displayOrder=3
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Body: None

### Delete Category

```http
DELETE {{baseUrl}}/api/categories/{{categoryId}}
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Body: None

---

## Brands

### Get Brands

```http
GET {{baseUrl}}/api/brands
```

Auth: No auth

Body: None

### Create Brand

```http
POST {{baseUrl}}/api/brands
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Content-Type: `application/json`

```json
{
  "name": "LuxZera Atelier",
  "logoUrl": "https://example.com/logo.png",
  "description": "Luxury house brand",
  "active": true,
  "categoryIds": ["{{categoryId}}"]
}
```

Required fields:

```text
name
```

### Update Brand

```http
PUT {{baseUrl}}/api/brands/{{brandId}}
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Content-Type: `application/json`

```json
{
  "name": "LuxZera Atelier Updated",
  "logoUrl": "https://example.com/logo-updated.png",
  "description": "Updated brand",
  "active": true,
  "categoryIds": ["{{categoryId}}"]
}
```

---

## Inventory

### Get Inventory

```http
GET {{baseUrl}}/api/inventory
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Body: None

### Upsert Inventory

```http
PUT {{baseUrl}}/api/inventory
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Content-Type: `application/json`

```json
{
  "productId": "{{productId}}",
  "variantId": "{{variantId}}",
  "currentStock": 100,
  "reservedStock": 5,
  "lowStockThreshold": 10
}
```

Required fields:

```text
productId, currentStock
```

Use `variantId: null` for product-level inventory without a variant.

### Restock Inventory

```http
POST {{baseUrl}}/api/inventory/{{inventoryItemId}}/restock
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Content-Type: `application/json`

```json
{
  "quantity": 50,
  "note": "Supplier restock"
}
```

Required fields:

```text
quantity
```

---

## Orders

### Create Order

```http
POST {{baseUrl}}/api/orders
```

Auth: Bearer token

Content-Type: `application/json`

```json
{
  "userId": "{{userId}}",
  "discountTotal": 10.00,
  "currency": "USD",
  "items": [
    {
      "productId": "{{productId}}",
      "variantId": "{{variantId}}",
      "quantity": 1,
      "unitPrice": 199.99
    }
  ]
}
```

Required fields:

```text
userId, items, items[].productId, items[].quantity, items[].unitPrice
```

### Get Orders By User

```http
GET {{baseUrl}}/api/orders/users/{{userId}}
```

Auth: Bearer token

Body: None

### Update Order Status

```http
PATCH {{baseUrl}}/api/orders/{{orderId}}/status?status=PROCESSING
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Body: None

Allowed `status` values:

```text
PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED
```

---

## Reviews

### Create Review

```http
POST {{baseUrl}}/api/reviews
```

Auth: Bearer token

Content-Type: `application/json`

```json
{
  "userId": "{{userId}}",
  "productId": "{{productId}}",
  "rating": 5,
  "comment": "Excellent quality."
}
```

Required fields:

```text
userId, productId, rating
```

Rating must be between `1` and `5`.

### Get Reviews By Product

```http
GET {{baseUrl}}/api/reviews/products/{{productId}}
```

Auth: No auth

Body: None

### Get Reviews By User

```http
GET {{baseUrl}}/api/reviews/users/{{userId}}
```

Auth: Bearer token

Body: None

---

## Coupons

### Get Coupons

```http
GET {{baseUrl}}/api/coupons
```

Auth: No auth

Body: None

### Create Coupon

```http
POST {{baseUrl}}/api/coupons
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Content-Type: `application/json`

```json
{
  "code": "LUX20",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "expiresAt": "2026-12-31T23:59:59",
  "usageLimit": 100,
  "minimumOrderValue": 150,
  "active": true
}
```

Required fields:

```text
code, discountType, discountValue
```

Allowed `discountType` values:

```text
PERCENTAGE, FLAT
```

---

## Homepage

### Get Homepage Sections

```http
GET {{baseUrl}}/api/homepage
```

Auth: No auth

Body: None

### Create Homepage Section

```http
POST {{baseUrl}}/api/homepage/sections
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Content-Type: `application/json`

```json
{
  "type": "HERO_BANNER",
  "title": "Luxury Collection",
  "displayOrder": 1,
  "active": true,
  "content": {
    "headline": "New arrivals",
    "imageUrl": "https://example.com/hero.jpg",
    "productIds": ["{{productId}}"]
  }
}
```

Required fields:

```text
type, title
```

Allowed `type` values:

```text
HERO_BANNER, TRENDING_PRODUCTS, FEATURED_CATEGORIES, BEST_SELLERS, LUXURY_COLLECTION
```

### Delete Homepage Section

```http
DELETE {{baseUrl}}/api/homepage/sections/{{homepageSectionId}}
```

Auth: Bearer token with `ADMIN` or `SUPER_ADMIN`

Body: None

---

## Zera Cart

### Get Zera Cart By User

```http
GET {{baseUrl}}/api/zera-cart/users/{{userId}}
```

Auth: Bearer token

Body: None

### Add Product To Zera Cart

```http
POST {{baseUrl}}/api/zera-cart
```

Auth: Bearer token

Content-Type: `application/json`

```json
{
  "userId": "{{userId}}",
  "productId": "{{productId}}",
  "source": "MANUAL",
  "recommendationContext": {
    "reason": "Saved by customer"
  }
}
```

Required fields:

```text
userId, productId
```

`source` can be `MANUAL` now. Later it can support values like `AI_RECOMMENDATION`, `BROWSING_HISTORY`, or `VIRTUAL_TRY_ON`.

### Remove Product From Zera Cart

```http
DELETE {{baseUrl}}/api/zera-cart/users/{{userId}}/products/{{productId}}
```

Auth: Bearer token

Body: None

### Move Product To Shopping Cart

```http
POST {{baseUrl}}/api/zera-cart/users/{{userId}}/products/{{productId}}/move-to-cart
```

Auth: Bearer token

Body: None

Note: This currently removes the item from Zera Cart. A real shopping cart module can be connected later.
