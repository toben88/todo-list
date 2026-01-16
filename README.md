# Todo List App

A React-based todo list application with drag-and-drop functionality.

## Features
- Create and delete todos
- Mark todos as complete/incomplete
- Drag and drop to reorder
- Filter by active/completed/all status
- Customizable accent color (7 color options)
- Persistent storage with PHP backend
- Deploy to any folder (relative paths)

## Technologies
- React 18
- Tailwind CSS
- react-beautiful-dnd
- Lucide React icons
- PHP (backend)

## Installation
1. Clone this repository
2. Run `npm install` to install dependencies

## Development
1. Start the PHP development server:
   ```
   php -S localhost:8000
   ```

2. In a separate terminal, start the React application:
   ```
   npm start
   ```

3. Open http://localhost:3000 in your browser

## Production Build
```
npm run build
```
Upload contents of `build/` folder to any directory on your PHP-enabled server.

## License
MIT License

## Changelog

### v2.0.0 (2026-01-16)
- Portable deployment: app now works in any folder without path changes
- Added Settings menu with accent color picker (7 color options)
- Accent color applies to header line, Add button, and active filter text
- Color preference saved to localStorage
- Simplified build output (removed legacy /do folder structure)
- Added install.php for optional .htaccess auto-configuration

### v1.0.1 (2025-02-04)
- Initial public release
- Basic todo CRUD operations
- Drag and drop reordering
- PHP/JSON backend
