# Online Clinic System

This project is a full-featured clinic management system built with React, Vite, Firebase, and Tailwind CSS.

## Getting Started

### 1. Clone the Repository

```
git clone https://github.com/your-org/OnlineClinic.git
cd OnlineClinic/ClinicSystem
```

### 2. Install Dependencies

```
npm install
```

### 3. Configure Firebase

Create a `.env` file in the root of `ClinicSystem` and add your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Start the Development Server

```
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to view the app.

## Features

- Patient appointment booking
- Admin dashboard for queue and patient management
- Real-time updates using Firebase
- Responsive design with Tailwind CSS

## Project Structure

- `src/client` — Patient-facing pages and components
- `src/admin` — Admin dashboard and management tools
- `src/shared` — Shared services, Firebase config, and utilities

## Customization

You can modify the Firebase rules, UI, and features to fit your clinic's workflow.

LICENSE

Danielle JOshua C. Esternon
