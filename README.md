# BufeFront

BufeFront is a React + TypeScript web application for a school buffet ordering workflow.
Users can browse menu items by category, search products, manage a cart, place orders, and track order status in real time.
Admins can manage categories, items, and incoming orders.

## Main Features

- Authentication-based routing
- Menu browsing with featured items and category filtering
- Cart and checkout flow
- Payment and post-payment order tracking
- Real-time order status updates via websocket
- Admin pages for item/category/order management

## Tech Stack

- React
- TypeScript
- Vite
- Redux Toolkit
- Tailwind CSS
- Axios

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app at the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

## Docker (optional)

```bash
docker build -t bufefrontend:local .
docker run --rm -p 8080:80 bufefrontend:local
```
