# [stop-test-1793253500] Web Guide

This guide provides comprehensive instructions for working with the web tier of the three-tier application. The web tier is a Next.js application that provides a user interface for managing tasks.

## Overview

The web tier is built with Next.js 16, React 19, and TypeScript. It communicates with the API tier to fetch and manage tasks. The application features a responsive, dark-mode-aware interface built with Tailwind CSS for styling.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- API tier running on port 3001 (or configured via `API_URL` environment variable)
- npm or yarn package manager

### Installation

Navigate to the web directory and install dependencies:

```bash
cd src/web
npm install
```

### Running the Web Application

For development with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

For production build and start:

```bash
npm run build
npm start
```

## Environment Configuration

The web tier uses the following environment variables:

- `API_URL`: The base URL for the API tier (default: `http://localhost:3001`)

Set this before running the application:

```bash
export API_URL=http://api.example.com:3001
npm run dev
```

## Project Structure

```
src/web/
├── app/
│   ├── page.tsx          # Main page component (To-Do List UI)
│   ├── actions.ts        # Server actions for API communication
│   ├── layout.tsx        # Root layout component
│   ├── globals.css       # Global styles
│   └── favicon.ico       # Favicon
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── postcss.config.mjs    # PostCSS configuration
```

## Key Components

### Page Component (page.tsx)

The main page displays a to-do list interface with:

- **Task Input Form:** Allows users to add new tasks
- **Task List:** Displays all tasks with completion status
- **Completion Counter:** Shows progress (e.g., "2 / 5 completed")
- **Responsive Design:** Works on mobile, tablet, and desktop
- **Dark Mode Support:** Automatically adapts to system preferences

### Server Actions (actions.ts)

Server actions handle communication with the API tier:

#### `getTasks()`

Fetches all tasks from the API.

```typescript
const tasks = await getTasks();
```

#### `createTask(formData)`

Creates a new task from form data.

```typescript
await createTask(formData);
```

#### `toggleTask(id, completed)`

Updates a task's completion status.

```typescript
await toggleTask(taskId, true);
```

## Styling

The application uses Tailwind CSS for styling with a utility-first approach. Key styling features:

- **Dark Mode:** Uses `dark:` prefix for dark mode styles
- **Responsive:** Mobile-first design with responsive utilities
- **Color Scheme:** Zinc color palette for a modern look
- **Transitions:** Smooth hover and state transitions

Example classes:
```tsx
className="bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-700 transition-colors"
```

## API Integration

The web tier communicates with the API tier through server actions. Each action:

1. Constructs the appropriate API endpoint URL
2. Sends the HTTP request with proper headers
3. Handles the response
4. Revalidates the page cache to reflect changes

Example:

```typescript
export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  revalidatePath('/');
}
```

## Development Tips

- Use `npm run dev` for development with hot module replacement
- Run `npm run lint` to check code quality with ESLint
- TypeScript provides type safety for React components and API responses
- The `Task` type is defined in `actions.ts` for type consistency
- Use React DevTools browser extension for component debugging
- Check browser console for any fetch errors or warnings

## Building for Production

Create an optimized production build:

```bash
npm run build
npm start
```

The build process:
1. Compiles TypeScript to JavaScript
2. Optimizes React components
3. Generates static and dynamic pages
4. Creates a production-ready bundle

## Troubleshooting

**Issue:** "Failed to fetch tasks" error

**Solution:** Ensure the API tier is running and `API_URL` is correctly configured.

**Issue:** Tasks don't update after adding/completing

**Solution:** Check that `revalidatePath('/')` is being called in server actions.

**Issue:** Styling looks broken

**Solution:** Ensure Tailwind CSS is properly built. Run `npm install` and rebuild.

## Performance Considerations

- Server actions reduce client-side JavaScript
- `cache: 'no-store'` ensures fresh task data on each request
- Tailwind CSS is optimized for production builds
- Next.js automatically code-splits components
