# ToolShare Microservices

ToolShare is a peer-to-peer equipment and tool sharing microservice platform built with **Spring Boot 3**, **Spring Cloud Gateway**, **Spring Cloud Netflix Eureka**, **Spring Cloud Config**, and **PostgreSQL**.

---

## 🚀 Services Overview & Ports

| Service | Port | Base URL (Direct) | Description |
| :--- | :---: | :--- | :--- |
| **API Gateway** | `8080` | `http://localhost:8080` | Entry point for all client requests & routing |
| **Auth Service** | `8081` | `http://localhost:8081` | User registration, authentication & session tokens |
| **User Service** | `8082` | `http://localhost:8082` | User profiles, bio, contact info & ratings |
| **Tool Service** | `8083` | `http://localhost:8083` | Tool listings, search, category & availability |
| **Booking Service** | `8084` | `http://localhost:8084` | Tool rental reservations & status lifecycle |
| **Review Service** | `8085` | `http://localhost:8085` | Ratings (1–5 stars) & review management |
| **Discovery Server (Eureka)**| `8761` | `http://localhost:8761` | Service registration & discovery dashboard |
| **Config Server** | `8888` | `http://localhost:8888` | Centralized Spring Cloud configuration |

---

## 🛠️ How to Start Services

### Startup Order
1. **Config Server**: `mvn spring-boot:run` inside `backend/config-server`
2. **Discovery Server**: `mvn spring-boot:run` inside `backend/discovery-server`
3. **API Gateway**: `mvn spring-boot:run` inside `backend/api-gateway`
4. **Microservices**: Run `mvn spring-boot:run` inside `backend/auth-service`, `backend/user-service`, `backend/tool-service`, `backend/booking-service`, and `backend/review-service`.

---

## 🧪 Complete API Testing Guide

All API requests can be tested via the **API Gateway** on port `8080`.

---

### 1. 🔐 Auth Service (`/api/auth/**`)

#### A. Register User
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/register`
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "fullName": "Dixit Luvani",
      "email": "dixit@gmail.com",
      "password": "123456"
    }'
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "message": "User registered successfully"
  }
  ```

#### B. Login User
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/login`
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "dixit@gmail.com",
      "password": "123456"
    }'
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "fullName": "Dixit Luvani",
    "email": "dixit@gmail.com",
    "token": "TS-cc86a631-ee3f-47f5-b451-2fc9e326406a",
    "tokenType": "Bearer"
  }
  ```

#### C. Get User by Email
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/auth/user?email=dixit@gmail.com`
- **cURL Request**:
  ```bash
  curl -X GET "http://localhost:8080/api/auth/user?email=dixit@gmail.com"
  ```

---

### 2. 👤 User Service (`/api/users/**`)

#### A. Create or Update User Profile
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/users`
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/users \
    -H "Content-Type: application/json" \
    -d '{
      "userId": 1,
      "fullName": "Dixit Luvani",
      "email": "dixit@gmail.com",
      "phone": "9876543210",
      "address": "Ahmedabad, India",
      "bio": "Passionate DIYer and Tool Enthusiast"
    }'
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "id": 1,
    "userId": 1,
    "fullName": "Dixit Luvani",
    "email": "dixit@gmail.com",
    "phone": "9876543210",
    "address": "Ahmedabad, India",
    "bio": "Passionate DIYer and Tool Enthusiast",
    "avatarUrl": null,
    "rating": 5.0,
    "createdAt": "2026-08-05T23:30:57.179"
  }
  ```

#### B. Get All Profiles
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/users`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/users
  ```

#### C. Get Profile by ID
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/users/1`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/users/1
  ```

---

### 3. 🧰 Tool Service (`/api/tools/**`)

#### A. Create a New Tool Listing
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/tools`
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/tools \
    -H "Content-Type: application/json" \
    -d '{
      "title": "DeWalt Cordless Drill",
      "description": "20V MAX Cordless Drill Combo Kit with 2 Batteries",
      "category": "Power Tools",
      "pricePerDay": 25.00,
      "depositAmount": 50.00,
      "location": "Ahmedabad",
      "ownerId": 1
    }'
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "id": 1,
    "title": "DeWalt Cordless Drill",
    "description": "20V MAX Cordless Drill Combo Kit with 2 Batteries",
    "category": "Power Tools",
    "pricePerDay": 25.00,
    "depositAmount": 50.00,
    "location": "Ahmedabad",
    "imageUrl": null,
    "ownerId": 1,
    "isAvailable": true,
    "createdAt": "2026-08-05T23:31:58.779"
  }
  ```

#### B. Get All Tools (with Optional Search Filter)
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/tools`
- **Query Params**: `category=Power Tools` or `query=DeWalt`
- **cURL Request**:
  ```bash
  curl -X GET "http://localhost:8080/api/tools?category=Power%20Tools"
  ```

#### C. Get Tool by ID
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/tools/1`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/tools/1
  ```

#### D. Get Tools by Owner
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/tools/owner/1`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/tools/owner/1
  ```

#### E. Update Tool Details
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/tools/1`
- **cURL Request**:
  ```bash
  curl -X PUT http://localhost:8080/api/tools/1 \
    -H "Content-Type: application/json" \
    -d '{
      "pricePerDay": 30.00,
      "location": "Gandhinagar"
    }'
  ```

#### F. Toggle Availability
- **Method**: `PATCH`
- **URL**: `http://localhost:8080/api/tools/1/availability?available=false`
- **cURL Request**:
  ```bash
  curl -X PATCH "http://localhost:8080/api/tools/1/availability?available=false"
  ```

---

### 4. 📅 Booking Service (`/api/bookings/**`)

#### A. Create a Rental Booking Request
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/bookings`
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/bookings \
    -H "Content-Type: application/json" \
    -d '{
      "toolId": 1,
      "borrowerId": 2,
      "ownerId": 1,
      "startDate": "2026-08-10",
      "endDate": "2026-08-12",
      "totalPrice": 50.00
    }'
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "id": 1,
    "toolId": 1,
    "borrowerId": 2,
    "ownerId": 1,
    "startDate": "2026-08-10",
    "endDate": "2026-08-12",
    "totalPrice": 50.00,
    "status": "PENDING",
    "createdAt": "2026-08-05T23:31:59.662"
  }
  ```

#### B. Get Bookings by Borrower (Rental History)
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/bookings/borrower/2`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/bookings/borrower/2
  ```

#### C. Get Bookings by Owner (Incoming Tool Requests)
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/bookings/owner/1`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/bookings/owner/1
  ```

#### D. Update Booking Status (`APPROVED`, `REJECTED`, `COMPLETED`, `CANCELLED`)
- **Method**: `PATCH`
- **URL**: `http://localhost:8080/api/bookings/1/status?status=APPROVED`
- **cURL Request**:
  ```bash
  curl -X PATCH "http://localhost:8080/api/bookings/1/status?status=APPROVED"
  ```

---

### 5. ⭐ Review Service (`/api/reviews/**`)

#### A. Submit Tool Review
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/reviews`
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/reviews \
    -H "Content-Type: application/json" \
    -d '{
      "toolId": 1,
      "reviewerId": 2,
      "rating": 5,
      "comment": "Great tool! Works perfectly for heavy drilling."
    }'
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "id": 1,
    "toolId": 1,
    "reviewerId": 2,
    "rating": 5,
    "comment": "Great tool! Works perfectly for heavy drilling.",
    "createdAt": "2026-08-05T23:32:00.402"
  }
  ```

#### B. Get Reviews for a Tool
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/reviews/tool/1`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/reviews/tool/1
  ```

#### C. Get Calculated Average Rating for a Tool
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/reviews/tool/1/rating`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/reviews/tool/1/rating
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "toolId": 1,
    "averageRating": 5.0
  }
  ```

---

## ⚡ Automated Testing Script (PowerShell)

You can run this PowerShell script to test all endpoints automatically in sequence:

```powershell
# 1. Login
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email": "dixit@gmail.com", "password": "123456"}'
Write-Host "Auth Login Token:" $login.token

# 2. User Profile
$user = Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method Post -ContentType "application/json" -Body '{"userId": 1, "fullName": "Dixit Luvani", "email": "dixit@gmail.com", "phone": "9876543210", "address": "Ahmedabad, India", "bio": "Passionate DIYer"}'
Write-Host "User Profile ID:" $user.id

# 3. Create Tool
$tool = Invoke-RestMethod -Uri "http://localhost:8080/api/tools" -Method Post -ContentType "application/json" -Body '{"title": "DeWalt Cordless Drill", "description": "20V MAX Cordless Drill Combo Kit", "category": "Power Tools", "pricePerDay": 25.00, "depositAmount": 50.00, "location": "Ahmedabad", "ownerId": 1}'
Write-Host "Tool ID:" $tool.id

# 4. Create Booking
$booking = Invoke-RestMethod -Uri "http://localhost:8080/api/bookings" -Method Post -ContentType "application/json" -Body '{"toolId": 1, "borrowerId": 2, "ownerId": 1, "startDate": "2026-08-10", "endDate": "2026-08-12", "totalPrice": 50.00}'
Write-Host "Booking ID:" $booking.id "Status:" $booking.status

# 5. Create Review
$review = Invoke-RestMethod -Uri "http://localhost:8080/api/reviews" -Method Post -ContentType "application/json" -Body '{"toolId": 1, "reviewerId": 2, "rating": 5, "comment": "Great tool! Works perfectly."}'
Write-Host "Review ID:" $review.id

# 6. Check Rating
$rating = Invoke-RestMethod -Uri "http://localhost:8080/api/reviews/tool/1/rating" -Method Get
Write-Host "Average Rating:" $rating.averageRating
```