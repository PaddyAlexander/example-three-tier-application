# Frontend Layer

- The Next.js 16 frontend uses React Server Components for the main page with Server Actions (getTasks, createTask, toggleTask, deleteTask) that communicate with the API and revalidate the page cache
- The TaskList client component implements interactive sorting by date, status, or title with ascending/descending order, persisting user preferences to localStorage and displaying sort indicators
- The UI features optimistic updates for task completion and deletion, Tailwind CSS styling with dark mode support, and displays task completion statistics showing completed vs total tasks
