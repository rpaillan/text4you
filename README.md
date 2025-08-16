# Kanban Board

A modern, responsive kanban board application built with React, Vite, SASS, and SQLite. Features drag and drop functionality, real-time updates, and a beautiful UI.

## Features

- 🎯 **Three Columns**: Idea, In Progress, and Done
- 🖱️ **Drag & Drop**: Move cards between columns seamlessly
- 💾 **SQLite Database**: Persistent data storage in `/data` folder
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful gradients and smooth animations
- ✏️ **CRUD Operations**: Create, read, update, and delete cards
- 🏷️ **Priority System**: High, Medium, and Low priority levels
- 📅 **Timestamps**: Track creation and update times

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, SASS
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite3
- **Drag & Drop**: @dnd-kit (modern drag & drop library)
- **Styling**: SASS with modern CSS features

## Project Structure

```
kanban/
├── data/                 # SQLite database files
├── src/
│   ├── components/       # React components
│   │   ├── KanbanBoard.jsx
│   │   ├── Column.jsx
│   │   ├── Card.jsx
│   │   ├── AddCardModal.jsx
│   │   └── EditCardModal.jsx
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # React entry point
│   └── *.scss           # SASS stylesheets
├── server.js            # Express backend server
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kanban
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm run server
   ```
   The server will start on `http://localhost:5001` and create the SQLite database in the `/data` folder.

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The React app will start on `http://localhost:3000`.

5. **Open your browser**
   Navigate to `http://localhost:3000` to see the kanban board.

## Usage

### Adding Cards
- Click the "+ Add Card" button in the header or any column
- Fill in the title, description, status, and priority
- Click "Add Card" to create the card

### Editing Cards
- Click the edit button (✏️) on any card
- Modify the card details
- Click "Update Card" to save changes

### Moving Cards
- Drag and drop cards between columns
- Cards will automatically update their status
- Reorder cards within the same column

### Deleting Cards
- Click the delete button (🗑️) on any card
- Cards are permanently removed from the database

### Priority Levels
- **High**: Red dot (urgent tasks)
- **Medium**: Orange dot (normal priority)
- **Low**: Green dot (low priority tasks)

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/cards` - Get all cards
- `POST /api/cards` - Create a new card
- `PUT /api/cards/:id` - Update a card
- `DELETE /api/cards/:id` - Delete a card
- `PATCH /api/cards/:id/status` - Update card status (for drag & drop)

## Database Schema

The SQLite database contains a single `cards` table:

```sql
CREATE TABLE cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'idea',
  priority TEXT DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run server` - Start TypeScript backend server
- `npm run start` - Start both backend and frontend
- `npm run type-check` - Run TypeScript type checking

### Adding New Features

1. **New Columns**: Modify the `columns` array in `KanbanBoard.jsx`
2. **Card Fields**: Update the database schema and form components
3. **Styling**: Modify the SASS files in the components directory

## Production Deployment

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Deploy the backend**
   - Upload `server.js` and the `data` folder to your server
   - Install production dependencies: `npm install --production`
   - Use a process manager like PM2: `pm2 start server.js`

3. **Environment Variables**
   - Set `PORT` for the server port (default: 5001)
   - Configure database path if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
