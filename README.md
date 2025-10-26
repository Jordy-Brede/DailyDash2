# DailyDash — PWA Prototype
DailyDash is a Progressive Web App (PWA) prototype built as a course project to demonstrate PWA features: offline caching, installability, and a responsive design using Materialize CSS.

## Features
- Responsive UI built with Materialize CSS
- Add/complete/delete tasks stored in `localStorage`
- Simple habits list and quick notes (localStorage)
- Installable via web manifest
- Service worker caches app shell and assets for offline use
- Sidenav, modals, and interactive components included

## How to view locally
1. Clone or download the repository.
2. Because service workers require localhost, run a simple static server in the project folder

# Explanations 
- This PWA uses a service worker to cache essential static assets such as HTML, CSS, JavaScript, manifest, icons, and an offline fallback page. The service worker intercepts fetch requests and serves cached versions when the user is offline, ensuring the app remains usable without an internet connection.
- This project uses a "Cache, falling back to network" strategy. On installation, the service worker pre-caches core application shells. During fetch events, the service worker checks the cache first for speed and offline support. If the resource is not in cache, it attempts to fetch it from the network.
- The web app manifest includes app name, short name, description, icon sizes (192x192 and 512x512), theme colors, background colors, display mode (standalone), and start_url. The manifest allows the application to be added to a user's home screen.
