# BookNest Web

A small React + TypeScript frontend for the BookNest backend.

Setup

1. Install dependencies

   npm install

2. Copy environment variables

   cp .env.example .env

3. Start dev server

   npm run dev

Environment

- VITE_API_BASE: base URL of BookNest backend (default http://localhost:8080)

Notes

This project was scaffolded to interface with the BookNest-Platform backend. Adjust API paths in `src/services/api.ts` if your backend uses different routes.

Backend routes and CORS

- This frontend expects the BookNest-Platform backend routes:
  - GET /books -> list books
  - GET /book/:id -> get single book
  - POST /books -> create book
  - PUT /book/:id -> update book
  - DELETE /book/:id -> delete book

- Make sure the backend enables CORS for the frontend origin (or use a permissive CORS during local development) so the browser can call the API.
