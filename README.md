# Contact Management App

This is a web application for managing contacts using Oracle Service Cloud API.

## Structure

- **FRONT-END**: React application with Bootstrap for UI.
- **BACK-END**: Node.js Express server that proxies requests to Oracle API and caches data in SQLite.

## Features

- Search contacts by city, name, email, phone.
- Display contacts in a responsive table.
- Create, update, delete contacts.
- Offline support: Shows cached data if API is unavailable.

## Setup

1. Install dependencies:
   - Backend: `cd BACK-END && npm install`
   - Frontend: `cd FRONT-END && npm install`

2. Start backend: `cd BACK-END && npm start`

3. Start frontend: `cd FRONT-END && npm start`

4. Open http://localhost:3000

## Technologies

- React
- Node.js
- Express
- SQLite
- Bootstrap

## Good Practices

- Separation of frontend and backend.
- Error handling.
- Responsive design.
- Caching for reliability.