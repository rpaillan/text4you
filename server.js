import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'data', 'kanban.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  // Create cards table
  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'idea',
      priority TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert some sample data if table is empty
  db.get("SELECT COUNT(*) as count FROM cards", (err, row) => {
    if (row.count === 0) {
      const sampleCards = [
        { title: 'Design new logo', description: 'Create a modern logo for the company', status: 'idea', priority: 'high' },
        { title: 'Setup development environment', description: 'Install all necessary tools and dependencies', status: 'in_progress', priority: 'high' },
        { title: 'Write documentation', description: 'Document the API endpoints and usage', status: 'done', priority: 'medium' },
        { title: 'Code review', description: 'Review pull requests from team members', status: 'idea', priority: 'low' },
        { title: 'Deploy to production', description: 'Deploy the latest version to production server', status: 'in_progress', priority: 'high' }
      ];

      const stmt = db.prepare("INSERT INTO cards (title, description, status, priority) VALUES (?, ?, ?, ?)");
      sampleCards.forEach(card => {
        stmt.run(card.title, card.description, card.status, card.priority);
      });
      stmt.finalize();
    }
  });
});

// API Routes

// Get all cards
app.get('/api/cards', (req, res) => {
  db.all("SELECT * FROM cards ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new card
app.post('/api/cards', (req, res) => {
  const { title, description, status, priority } = req.body;
  
  if (!title || !status) {
    res.status(400).json({ error: 'Title and status are required' });
    return;
  }

  db.run(
    "INSERT INTO cards (title, description, status, priority) VALUES (?, ?, ?, ?)",
    [title, description, status, priority],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Get the newly created card
      db.get("SELECT * FROM cards WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// Update a card
app.put('/api/cards/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority } = req.body;
  
  db.run(
    "UPDATE cards SET title = ?, description = ?, status = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, description, status, priority, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }
      
      // Get the updated card
      db.get("SELECT * FROM cards WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// Delete a card
app.delete('/api/cards/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM cards WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    
    res.json({ message: 'Card deleted successfully' });
  });
});

// Update card status (for drag and drop)
app.patch('/api/cards/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }
  
  db.run(
    "UPDATE cards SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }
      
      res.json({ message: 'Status updated successfully' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database path: ${dbPath}`);
});
