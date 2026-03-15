# Wish-Cart AI Personal Shopper Agent

An AI-powered personal shopper web application that allows users to search for products using natural language and receive personalized shopping recommendations.

## Project Structure

This repository contains both the frontend and backend architectures:

### `frontend/`
A modern web interface built with **React** and **Vite**.
- Features an interactive chat-like UI.
- Communicates directly with the backend API.
- Implements a functional Shopping Cart with sliding drawer.

**To run the frontend locally:**
```bash
cd frontend
npm install
npm run dev
```

### `backend/`
A lightweight **Node.js (Express)** server with AI and database integration.
- Integrates with **Google GenAI (Gemini)** to parse user intent and extract shopping keywords from natural language prompts.
- Uses **better-sqlite3** as a local database, populated with 15+ mock products across varied categories.
- Features dynamic `LIKE` search matching to serve recommendations.

**To run the backend locally:**
```bash
cd backend
npm install
# Note: Ensure you set GEMINI_API_KEY in the .env file!
node seed.js  # Optional, seeds the SQLite database
npm run start # Starts server on port 3000
```

## Features
- **Conversational Search**: Type what you are looking for in natural language (e.g., "I need a cozy gift for my mom").
- **Intent Extraction**: Gemini intelligently extracts keywords bypassing conversational fluff.
- **Local Database**: Products are queried securely from a SQLite database.
- **Shopping Cart**: Fully functional add/remove cart feature with total price calculation.
