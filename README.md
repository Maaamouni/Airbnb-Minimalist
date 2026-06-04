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

## Run with Docker

The project includes a Docker Compose setup for:

- frontend React/Vite
- backend Express API
- MongoDB
- Redis

Start everything:

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up -d --build
```

Open the app:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5001
Health:   http://localhost:5001/health
```

Stop containers:

```bash
docker compose down
```

Stop containers and delete MongoDB/Redis data volumes:

```bash
docker compose down -v
```

View logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo
docker compose logs -f redis
```

Access MongoDB shell:

```bash
docker compose exec mongo mongosh
```

Inside `mongosh`:

```js
show dbs
use airbnb
show collections
db.listings.find()
```

Access Redis CLI:

```bash
docker compose exec redis redis-cli
```

The backend uses service names inside Docker:

```env
MONGO_URI=mongodb://mongo:27017/airbnb
REDIS_URL=redis://redis:6379
```

The frontend still uses the host URL because the browser calls the API from your machine:

```env
VITE_API_URL=http://localhost:5001
```

MongoDB data persists in the Docker volume `mongo_data`. Redis data persists in `redis_data`.

If you already created a manual MongoDB container named `airbnb-mongo`, Compose cannot create another container with the same name. Keep the data volume and remove only the old container:

```bash
docker stop airbnb-mongo
docker rm airbnb-mongo
docker compose up -d --build
```

This Compose file reuses the existing Docker volume named `airbnb-volume` for MongoDB data.


!! redis sert juste a accelerer la recherche des logements
