# Note 3: Frontend

The frontend is built with Next.js 16 and React 19, using Tailwind CSS for styling. It provides a user-friendly interface for managing tasks.

- **Technology Stack**: Next.js 16, React 19, Tailwind CSS 4, TypeScript 5
- **Main Page**: A to-do list interface at `src/web/app/page.tsx` that displays all tasks, allows adding new tasks, and toggling completion status
- **Server Actions**: Uses Next.js server actions (`getTasks`, `createTask`, `toggleTask`) to communicate with the API without exposing it directly to the browser
