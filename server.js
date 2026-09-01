// ==========================================
// NETFLIX CLONE - BACKEND SERVER
// ==========================================

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');

dotenv.config();

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors({
    origin: true,           // reflect request origin — works on any domain
    credentials: true       // allow session cookies cross-origin
}));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'netflix-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS on Vercel, HTTP locally
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// ==========================================
// DATABASE CONNECTION POOL
// ==========================================

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'netflix_clone',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ==========================================
// INITIALIZE DATABASE
// ==========================================

async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();

        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create watchlist table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS watchlist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                show_id VARCHAR(255) NOT NULL,
                show_name VARCHAR(255) NOT NULL,
                show_image VARCHAR(1000),
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_watchlist (user_id, show_id)
            )
        `);

        connection.release();
        console.log('\u2713 Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error.message);
        // Do not call process.exit — Vercel serverless functions cannot recover from it
    }
}

// ==========================================
// ROUTES
// ==========================================

// Sign Up
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const connection = await pool.getConnection();

        // Check if user exists
        const [existingUser] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            connection.release();
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await connection.execute(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashedPassword, name]
        );

        connection.release();

        req.session.userId = result.insertId;
        req.session.userEmail = email;
        req.session.userName = name;

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            userId: result.insertId,
            name: name,
            email: email
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

// Sign In
app.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const connection = await pool.getConnection();

        const [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        connection.release();

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userName = user.name;

        res.json({
            success: true,
            message: 'Sign in successful',
            userId: user.id,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Sign in failed' });
    }
});

// Sign Out
app.post('/api/signout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Sign out failed' });
        }
        res.json({ success: true, message: 'Signed out successfully' });
    });
});

// Check Auth Status
app.get('/api/auth-status', (req, res) => {
    if (req.session.userId) {
        res.json({
            authenticated: true,
            userId: req.session.userId,
            email: req.session.userEmail,
            name: req.session.userName
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Add to Watchlist
app.post('/api/watchlist/add', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { show_id, show_name, show_image } = req.body;

        const connection = await pool.getConnection();

        await connection.execute(
            'INSERT INTO watchlist (user_id, show_id, show_name, show_image) VALUES (?, ?, ?, ?)',
            [req.session.userId, show_id, show_name, show_image]
        );

        connection.release();

        res.json({ success: true, message: 'Added to watchlist' });

    } catch (error) {
        console.error('Watchlist add error:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

// Remove from Watchlist
app.post('/api/watchlist/remove', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { show_id } = req.body;

        const connection = await pool.getConnection();

        await connection.execute(
            'DELETE FROM watchlist WHERE user_id = ? AND show_id = ?',
            [req.session.userId, show_id]
        );

        connection.release();

        res.json({ success: true, message: 'Removed from watchlist' });

    } catch (error) {
        console.error('Watchlist remove error:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

// Get Watchlist
app.get('/api/watchlist', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const connection = await pool.getConnection();

        const [watchlist] = await connection.execute(
            'SELECT show_id, show_name, show_image FROM watchlist WHERE user_id = ? ORDER BY added_at DESC',
            [req.session.userId]
        );

        connection.release();

        res.json(watchlist);

    } catch (error) {
        console.error('Watchlist fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// ==========================================
// ERROR HANDLING
// ==========================================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 3000;

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🎬 Netflix Clone Server running at http://localhost:${PORT}`);
        console.log(`📊 Database: ${process.env.DB_NAME || 'netflix_clone'}\n`);
    });
});

module.exports = app;
