# Task Management Features

## Overview
This document describes the task sorting, filtering, and search features that allow users to organize and find tasks efficiently. User preferences are persisted across sessions using localStorage.

## Features

### Sorting Options
Users can sort tasks by:
- **Date** (created_at): Sort by creation date
- **Status** (completed): Sort by completion status (incomplete first or completed first)
- **Title**: Sort alphabetically by task title

### Sort Order
- Click a sort button once to sort in ascending order (↑)
- Click the same button again to toggle to descending order (↓)
- Clicking a different sort option resets to ascending order

### Filtering
Users can filter tasks by completion status:
- **All**: Show all tasks (default)
- **Active**: Show only incomplete tasks
- **Completed**: Show only completed tasks

### Search
Users can search tasks by title:
- Type in the search box to filter tasks in real-time
- Search is case-insensitive
- Works in combination with status filters

### Persistence
- Sort preferences are automatically saved to browser localStorage
- Preferences are restored when the user returns to the page
- Works across browser sessions

## Implementation Details

### Backend (API)
**Endpoint**: `GET /tasks`

**Query Parameters**:
- `sort`: Field to sort by (`created_at`, `completed`, or `title`)
- `order`: Sort order (`asc` or `desc`)

**Example**:
```
GET /tasks?sort=completed&order=desc
```

### Frontend
**Component**: `TaskList.tsx` (Client Component)

**Features**:
- Interactive sort buttons with visual feedback
- Optimistic UI updates for better responsiveness
- localStorage integration for persistence
- Responsive design with dark mode support

**localStorage Keys**:
- `taskSortBy`: Stores the selected sort field
- `taskSortOrder`: Stores the sort order (asc/desc)

## User Experience

1. **Initial Load**: Tasks are sorted by creation date (ascending) by default
2. **Changing Sort**: Click any sort button to change the sorting criteria
3. **Toggle Order**: Click the active sort button again to reverse the order
4. **Persistence**: Sort preference is saved automatically and restored on next visit
5. **Visual Feedback**: Active sort button is highlighted with an arrow indicator (↑/↓)

## Technical Notes

- Client-side sorting is applied for immediate feedback
- Server-side sorting is available via API query parameters for future optimization
- Optimistic updates ensure smooth UX during task mutations
- No database changes required - uses localStorage for persistence
- Easy to extend with additional sort options in the future

## Future Enhancements

Potential improvements:
- Add user preferences table in database for cross-device sync
- Add more sort options (e.g., due date when implemented)
- Add multi-level sorting (primary and secondary sort fields)
- Add bulk operations (select multiple tasks, bulk delete/complete)
