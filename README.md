# Airbnb like with MERN stack 

## Architecture (MVP)

1. Authentication (JWT)
2. Listing (logements)
3. Recherche simple (ville, prix)
4. Reservation (Choisir date)

## Roles:

- guest: peut rechercher et réserver
- host: peut créer et gérer ses logements
- admin: modère la plateforme

### guest

- Recherche par ville, prix et decouvrir le logement en detaille (photos , description, equipement)
- Reservation (choisit la date, calcul prix, verification disponibilites, confirmation)
- note de logement + historique de reservations

### Hote

-  Gestion des logements
créer une annonce : titre - description - prix - images
modifier / supprimer

- Gestion des reservations (accepter ou refuser) + voir demande et historique
### Admin

- gestion des utilisateurs
- modération des annonces
- suppression contenu
- analytics global

## MERN

### Frontend (React) + Tailwind
- Pages: Home (liste longements) - Login/Register - Dashboard

### Backend (Node.js + Express)
- API Rest : /auth, /listing, /bookings, /users

POST /auth/register
POST /auth/login

GET /listings?city=&minPrice=&maxPrice=
GET /listings/:id
POST /listings (host only)
PUT /listings/:id
DELETE /listings/:id

POST /bookings
GET /bookings/user
GET /bookings/host
PUT /bookings/:id (accept/refuse)

GET /users
GET /users/:id
PUT /users/:id
DELETE /users/:id

### BD (MongoDB) 
- Collections: User - Listing - Booking

User:
- _id
- name
- email
- password
- role (guest | host | admin)

Listing:
- _id
- title
- description
- price
- city
- images[]
- owner (userId)

Booking:
- _id
- userId
- listingId
- startDate
- endDate
- totalPrice
- status (pending | confirmed | cancelled)

### Redis
Cache:
- key: listings:city
- TTL: 10 minutes

Flow:
1. Check Redis
2. If not found → MongoDB
3. Save result in Redis

## Logique Metier

Booking rules:
- A listing cannot be booked if dates overlap
- totalPrice = number_of_days * price
- booking status = pending by default
- host must confirm booking

## Flow complet

User searches city:
GET /listings?city=Rabat

→ check Redis
→ else MongoDB
→ return listings

User books:
POST /bookings

→ check availability
→ create booking
→ set status = pending

## Structure de projet

airbnb/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── redis/
│   └── config.js
│
├── README.md

## Phases
Phase 1:
- Auth (JWT)
- User model

Phase 2:
- Listings CRUD

Phase 3:
- Booking system

Phase 4:
- Redis cache

Phase 5:
- UI improvement