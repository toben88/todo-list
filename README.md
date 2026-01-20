# Todo List App

A React-based todo list application with drag-and-drop functionality.

## Features
- Create, edit, and delete todos
- Mark todos as complete/incomplete
- Drag and drop to reorder
- Filter by active/completed/all status
- Double-click to edit todo text inline
- Customizable accent color (7 presets + custom color picker)
- Editable page title
- Server-side settings storage
- Visitor analytics dashboard at `/stats.php`
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

### v2.2.0 (2026-01-20)
- Visitor analytics dashboard at `/stats.php`
- Track unique visitors with combined matching (localStorage + fingerprint)
- View visitor history grouped by unique visitor ID
- Click to expand visit details (IP, timezone, language)
- Browser and OS statistics
- Mobile vs desktop breakdown
- Custom color picker (in addition to 7 presets)
- noindex meta tag on stats page for privacy

### v2.1.0 (2026-01-18)
- Server-side settings storage (moved from localStorage)
- Editable page title in Profile menu
- Double-click to edit todo text inline
- Settings persist across devices

### v2.0.0 (2026-01-16)
- Portable deployment: app now works in any folder without path changes
- Added Settings menu with accent color picker (7 color options)
- Accent color applies to header line, Add button, and active filter text
- Color preference saved to localStorage
- Simplified build output (removed legacy /do folder structure)
- Added install.php for optional .htaccess auto-configuration

### v1.0.0
- Initial release
- Basic todo CRUD operations
- Drag and drop reordering
- PHP/JSON backend
