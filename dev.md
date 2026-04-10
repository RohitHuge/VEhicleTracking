# 🚗 Car Tracking System — dev.md

## 📌 Project Goal

Build a simple full-stack car tracking system where a user can:

* Register/Login
* Add vehicles
* Track vehicles on a map
* Simulate movement in near real-time

---

# 🧠 System Architecture

### Frontend

* HTML + Tailwind + Vanilla JS
* Handles UI rendering and API calls
* Uses Leaflet.js for map

### Backend

* Node.js + Express
* REST API based
* Handles auth + vehicle logic

### Database

* PostgreSQL (Neon DB)
* Stores users and vehicles

---

# 🔄 Application Flow

## 1️⃣ User Authentication Flow

### Register

1. User enters:

   * name
   * email
   * password
2. Frontend sends POST request:

   ```
   /auth/register
   ```
3. Backend:

   * Inserts user into DB
4. Response:

   * Success message

---

### Login

1. User enters:

   * email
   * password
2. Frontend sends:

   ```
   /auth/login
   ```
3. Backend:

   * Checks user in DB
4. If valid:

   * Returns user object
5. Frontend:

   * Stores user in `localStorage`
   * Redirects to dashboard

---

## 2️⃣ Dashboard Flow

1. On load:

   * Fetch user from `localStorage`
2. Initialize map (Leaflet)
3. Call API:

   ```
   GET /vehicles/:user_id
   ```
4. Backend:

   * Returns all vehicles for user
5. Frontend:

   * Renders markers on map
   * Displays vehicle list

---

## 3️⃣ Add Vehicle Flow

1. User clicks "Add Vehicle"
2. Frontend sends:

   ```
   POST /vehicles
   ```

   with:

   * user_id
   * vehicle_name
3. Backend:

   * Inserts vehicle with default:

     * lat/lng (Pune default)
     * speed = 0
     * status = stopped
4. Frontend:

   * Reloads vehicle list

---

## 4️⃣ Vehicle Tracking Flow (Simulation)

### Trigger Movement

1. User clicks "Move"
2. Frontend sends:

   ```
   POST /vehicles/update/:id
   ```

### Backend Logic

* Updates:

  * lat += random offset
  * lng += random offset
  * speed = random
  * status = moving

---

## 5️⃣ Real-Time Update (Polling)

1. Frontend runs:

   ```js
   setInterval(loadVehicles, 3000);
   ```
2. Every 3 seconds:

   * Fetch updated vehicle data
   * Update map markers
   * Update sidebar list

---

# 🗄️ Database Design

## Users Table

| Field    | Type   |
| -------- | ------ |
| id       | SERIAL |
| name     | TEXT   |
| email    | TEXT   |
| password | TEXT   |

---

## Vehicles Table

| Field        | Type   |
| ------------ | ------ |
| id           | SERIAL |
| user_id      | INT    |
| vehicle_name | TEXT   |
| lat          | FLOAT  |
| lng          | FLOAT  |
| speed        | INT    |
| status       | TEXT   |

---

# 🔌 API Design

## Auth APIs

### Register

```
POST /auth/register
```

### Login

```
POST /auth/login
```

---

## Vehicle APIs

### Add Vehicle

```
POST /vehicles
```

### Get Vehicles

```
GET /vehicles/:user_id
```

### Update Vehicle (Simulate)

```
POST /vehicles/update/:id
```

---

# 🧪 Dummy Data Strategy

* Default vehicle location:

  ```
  lat: 18.52
  lng: 73.85
  ```
* Random movement:

  ```
  (random() - 0.5) / 100
  ```
* Speed:

  ```
  0 - 80 km/h
  ```

---

# ⚙️ State Management

* No global state library
* Use:

  * `localStorage` → store user
  * DOM updates → for UI refresh

---

# 🔐 Authentication Strategy

* Plain email + password check
* No:

  * hashing
  * JWT
  * sessions

⚠️ NOTE: This is **not secure**, only for quick prototype.

---

# 🌍 Map Integration

* Library: Leaflet.js
* Tile source:

  ```
  OpenStreetMap
  ```
* Marker rendering:

  * One marker per vehicle
  * Updated every poll cycle

---

# 📦 Deployment Notes (Optional)

### Backend

* Can deploy on:

  * Render / Railway

### Frontend

* Static hosting:

  * Netlify / Vercel

### Database

* Neon DB (cloud PostgreSQL)

---

# 🚀 Future Improvements

* JWT Authentication
* Password hashing (bcrypt)
* WebSockets (Socket.io)
* Real GPS integration
* Vehicle history tracking
* Better UI/UX

---

# ⚠️ Known Limitations

* No authentication security
* No real-time sockets (polling only)
* Map markers may duplicate (no cleanup logic)
* No error handling system

---

# 🧠 Key Idea

This project is designed to:

> **Ship fast → then improve later**

---

# ✅ End of dev.md
