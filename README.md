# TaskFlow

Personal To-Do Management web application built with React, TypeScript, Tailwind CSS, Vite, Firebase Authentication, and Cloud Firestore.

## Features

- **Authentication**: Email/password registration, login, password reset, email verification, and Google Sign-In.
- **Real-time Cloud Firestore Sync**: User-scoped tasks stored under `users/{userId}/tasks/{taskId}` with hardened Firestore Security Rules (`firestore.rules`).
- **Dashboard Overview**: Dynamic statistics (Total, Completed, Pending, Overdue), Today's Tasks, Upcoming Tasks, Completion Progress indicator, and Recent Activity.
- **Task CRUD & Organization**: Create, edit, complete/uncomplete, and delete tasks with validation, categories (`Personal`, `Study`, `Work`, `Shopping`, `Health`, `Other`), priorities (`Low`, `Medium`, `High`), due dates, and optional due times.
- **Search, Filtering & Sorting**: Search by title, filter by category/priority/status, and sort by due date, priority, or recently created.
- **Schedule & Monthly Calendar**: Upcoming deadlines grouped into Overdue, Today, Tomorrow, and This Week alongside an interactive monthly calendar.

## Local Development

```bash
npm install
npm run dev
```

## Build & Type Check

```bash
npm run lint
npm run build
```

## Vercel Deployment

1. Push this repository to GitHub and import the project into Vercel.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Configure `VITE_FIREBASE_*` environment variables (see `.env.example`) if overriding `firebase-applet-config.json`.
4. Ensure Email/Password and Google Sign-In providers are enabled in Firebase Console -> Authentication -> Sign-in method, and add your Vercel domain to Authorized domains.
