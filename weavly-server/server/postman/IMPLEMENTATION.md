# LuxZera / Weavly API Implementation & Execution Guide

This document outlines the **exact working flow**, **method signatures**, and **order of execution** for testing the complete customer onboarding, profile lifecycle, 15-area questionnaire, recommendation gallery, and Zyra User Encoder backend APIs.

---

## 1. Environment Configuration

- **Base URL**: `{{baseUrl}}` = `http://localhost:8081` (or `http://localhost:8082` depending on port)
- **Global Auth Header**: `Authorization: Bearer {{token}}`
- **Collection File**: [`LuxZera_Complete_Backend_API.postman_collection.json`](file:///Users/saketh/Desktop/Projects/weavly/weavly-server/server/postman/LuxZera_Complete_Backend_API.postman_collection.json)

---

## 2. API Execution Sequence (Workflow)

```
Step 1: Register Account (POST /api/auth/register)
           ↓
Step 2: Verify OTP (POST /api/auth/verify)  [OR Step 2b: Google Sign-In]
           ↓
Step 3: Login (POST /api/auth/login) ──> Saves {{token}}
           ↓
Step 4: Check Profile State (GET /api/users/me) ──> profileCompleted: false
           ↓
Step 5: Submit 15-Area Questionnaire (PUT /api/user-fit-data/me) ──> profileCompleted becomes true
           ↓
Step 6: Upload Primary Avatar (PUT /api/profile/me) [Optional]
           ↓
Step 7: Upload Style Recommendation Images (POST /api/recommendation-images/me) [Optional]
           ↓
Step 8: Retrieve Full Aggregated Profile (GET /api/profile/me)
           ↓
Step 9: Zyra AI User Encoder Vector Extract (GET /api/internal/users/{userId}/encoder-data)
```

---

## 3. Step-by-Step API Specification

### Step 1: Register New Account
- **Endpoint**: `POST {{baseUrl}}/api/auth/register`
- **Auth**: None (Public)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "alex_chen",
  "firstName": "Alex",
  "lastName": "Chen",
  "email": "alex@weavly.com",
  "password": "Password123!"
}
```
- **Response**: `200 OK`
```json
{
  "message": "Verification code sent to your email",
  "email": "alex@weavly.com"
}
```

---

### Step 2: Verify OTP
- **Endpoint**: `POST {{baseUrl}}/api/auth/verify`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "alex@weavly.com",
  "code": "123456"
}
```
- **Response**: `200 OK` ("Account verified successfully")

---

### Step 3: Login with Email & Password
- **Endpoint**: `POST {{baseUrl}}/api/auth/login`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "alex@weavly.com",
  "password": "Password123!"
}
```
- **Response**: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGV4QHdlYXZseS5jb20i...",
  "tokenType": "Bearer"
}
```
> **Note**: The Postman test script automatically stores `accessToken` into the `{{token}}` variable.

---

### Step 3b (Alternative): Google Sign-In
- **Endpoint**: `POST {{baseUrl}}/api/auth/google`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "idToken": "GOOGLE_OIDC_OR_ACCESS_TOKEN"
}
```
- **Response**: `200 OK` (Returns `accessToken` and automatically provisions user record).

---

### Step 4: Check Initial Profile State (Gating Verification)
- **Endpoint**: `GET {{baseUrl}}/api/users/me`
- **Auth**: Bearer `{{token}}`
- **Response**: `200 OK`
```json
{
  "id": "9e9e7b92-54db-4d77-9ee9-af5e3cccad79",
  "email": "alex@weavly.com",
  "firstName": "Alex",
  "lastName": "Chen",
  "role": "ROLE_CUSTOMER",
  "profileCompleted": false,
  "onboardingMessage": "Please complete your profile to get great outfit recommendations.",
  "generalProfile": {
    "phoneNumber": null,
    "gender": null,
    "dateOfBirth": null,
    "bio": null,
    "profilePicture": null
  },
  "fitData": null,
  "recommendationImages": []
}
```

---

### Step 5: Submit V1 UserFitData Questionnaire (15 Areas)
- **Endpoint**: `PUT {{baseUrl}}/api/user-fit-data/me` (or `PUT {{baseUrl}}/api/user-fit-data/{{userId}}`)
- **Auth**: Bearer `{{token}}`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "heightRange": "170–179 cm",
  "exactHeightCm": 175.5,
  "weightRange": "70–79 kg",
  "exactWeightKg": 73.0,
  "clothingSize": "L",
  "fitPreferences": ["Regular", "Relaxed"],
  "preferredStyles": ["Casual", "Minimal", "Streetwear"],
  "avoidedStyles": ["Experimental / Avant-garde"],
  "preferredClothingTypes": ["T-shirts", "Jeans", "Jackets / Outerwear"],
  "avoidedClothingTypes": ["Suits / Blazers"],
  "preferredColors": ["Black", "Navy", "Charcoal"],
  "avoidedColors": ["Neon Yellow", "Hot Pink"],
  "occasions": ["Everyday / Casual", "Work / Office"],
  "primaryOccasion": "Everyday / Casual",
  "budgetRange": "₹2,500–₹5,000",
  "shoppingPriorities": ["Fit", "Comfort", "Quality"],
  "fashionGoals": ["Build complete outfits", "Discover personal style"]
}
```
- **Response**: `200 OK` (`FitDataResponseDto`)
- **Effect**: Spring Boot sets `profileCompleted = true` and fires `UserProfileUpdatedEvent`.

---

### Step 6: Upload Primary Avatar & General Details
- **Endpoint**: `PUT {{baseUrl}}/api/profile/me` (or `PUT {{baseUrl}}/api/profile/{{userId}}`)
- **Auth**: Bearer `{{token}}`
- **Body**: `multipart/form-data`
  - `phoneNumber` (text): `9876543210`
  - `gender` (text): `MALE`
  - `dateOfBirth` (text): `1996-06-12`
  - `bio` (text): `Minimalist streetwear and tailoring enthusiast`
  - `image` (file): Select image file from your machine
- **Response**: `200 OK` (`UserProfileResponseDto` with updated `profilePicture` hosted on Cloudflare R2).

---

### Step 7: Upload Style Recommendation Images
- **Endpoint**: `POST {{baseUrl}}/api/recommendation-images/me` (or `POST {{baseUrl}}/api/recommendation-images/{{userId}}`)
- **Auth**: Bearer `{{token}}`
- **Body**: `multipart/form-data`
  - `image` (file): Select outfit inspiration photo
- **Response**: `200 OK`
```json
{
  "id": "b64750af-0764-4178-b5c9-fd266f4d3906",
  "imageUrl": "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/recommendation-images/outfit1.jpg",
  "createdAt": "2026-08-24T17:28:00"
}
```

---

### Step 8: View All Uploaded Recommendation Images
- **Endpoint**: `GET {{baseUrl}}/api/recommendation-images/me`
- **Auth**: Bearer `{{token}}`
- **Response**: `200 OK` (Array of `UserRecommendationImageResponseDto`).

---

### Step 9: Delete Recommendation Image
- **Endpoint**: `DELETE {{baseUrl}}/api/recommendation-images/{{imageId}}`
- **Auth**: Bearer `{{token}}`
- **Response**: `204 No Content`

---

### Step 10: Zyra User Encoder Data Extraction
- **Endpoint**: `GET {{baseUrl}}/api/internal/users/{{userId}}/encoder-data`
- **Auth**: Bearer `{{token}}` (Service / User authorization)
- **Response**: `200 OK`
```json
{
  "userId": "9e9e7b92-54db-4d77-9ee9-af5e3cccad79",
  "profileCompleted": true,
  "generalProfile": {
    "gender": "MALE",
    "dateOfBirth": "1996-06-12",
    "bio": "Minimalist streetwear and tailoring enthusiast"
  },
  "fitData": {
    "heightRange": "170–179 cm",
    "exactHeightCm": 175.5,
    "weightRange": "70–79 kg",
    "exactWeightKg": 73.0,
    "clothingSize": "L",
    "fitPreferences": ["Regular", "Relaxed"],
    "preferredStyles": ["Casual", "Minimal", "Streetwear"],
    "avoidedStyles": ["Experimental / Avant-garde"],
    "preferredClothingTypes": ["T-shirts", "Jeans", "Jackets / Outerwear"],
    "avoidedClothingTypes": ["Suits / Blazers"],
    "preferredColors": ["Black", "Navy", "Charcoal"],
    "avoidedColors": ["Neon Yellow", "Hot Pink"],
    "occasions": ["Everyday / Casual", "Work / Office"],
    "primaryOccasion": "Everyday / Casual",
    "budgetRange": "₹2,500–₹5,000",
    "shoppingPriorities": ["Fit", "Comfort", "Quality"],
    "fashionGoals": ["Build complete outfits", "Discover personal style"]
  },
  "profileImage": "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/profiles/avatar.jpg",
  "recommendationImages": [
    {
      "id": "b64750af-0764-4178-b5c9-fd266f4d3906",
      "imageUrl": "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/recommendation-images/outfit1.jpg",
      "createdAt": "2026-08-24T17:28:00"
    }
  ]
}
```

---

## 4. Key Implementation Rules & Constraints
1. **Source of Truth**: Spring Boot is the single authority for `profileCompleted`.
2. **Shopping Priorities Constraint**: Strictly max 3 items in `shoppingPriorities` array (`@Size(max = 3)`).
3. **No Unapproved Sizes**: `topSize`, `bottomSize`, `shoeSize` are excluded from the V1 Questionnaire DTO. Use `clothingSize`.
4. **Image Uploads**: Both Profile Avatar (`image`) and Recommendation Images (`image`) are dispatched as `multipart/form-data`.
