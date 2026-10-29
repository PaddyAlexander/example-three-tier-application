# Frontend Documentation

- The frontend is built with Next.js 16.2.9, React 19, and TypeScript, using Tailwind CSS v4 for styling with dark mode support
- Server actions in actions.ts handle API communication (getTasks, createTask, toggleTask, deleteTask) connecting to the backend API via the API_URL environment variable (defaults to http://localhost:3001)
- The TaskList component provides client-side task sorting by date, status, or title with ascending/descending order, persisting user preferences in localStorage for a better user experience
