# 🎬 Netflix Clone - Full Stack Project

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSwapna-KY%2Fnetflix-clone)
**Live Demo:** [https://netflix-clone-swapna-ky1.vercel.app](https://netflix-clone-swapna-ky1.vercel.app)

A professional Netflix clone built with **Node.js/Express**, **MySQL**, and **Vanilla JavaScript**. Features user authentication, watchlist management, and real TV show data from TVMaze API.

## 📋 Features

- ✅ **Modern Netflix UI:** Brand new "More Reasons to Join" responsive 4-card grid layout.
- ✅ **Clean FAQ Section:** Styled with smooth accordions and premium dark-mode aesthetics.
- ✅ **User Authentication:** Secure Sign Up / Sign In with session management.
- ✅ **Password Hashing:** Integrated bcryptjs for top-tier security.
- ✅ **MySQL Database:** Permanent storage for user data and watchlists.
- ✅ **Real-Time Data:** Pulls real TV show data from the TVMaze API.
- ✅ **"My List" Functionality:** Add and remove shows to your personalized watchlist seamlessly.
- ✅ **Fully Responsive:** Beautifully adapts to Desktop, Tablet, and Mobile screens.

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- MySQL 2
- bcryptjs
- express-session
- CORS

**Frontend:**
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- TVMaze API

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (running locally or remotely)
- npm or yarn

### Step 1: Clone & Setup

```bash
# Navigate to project directory
cd netflix-clone

# Install dependencies
npm install
```

### Step 2: Database Setup

```sql
-- Create database (optional - server will create automatically)
CREATE DATABASE netflix_clone;

-- The server will create tables automatically on first run
```

### Step 3: Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=netflix_clone

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=netflix-clone-secret-key-2024
```

**Update the following:**
- `DB_USER`: Your MySQL username
- `DB_PASSWORD`: Your MySQL password (if any)
- `SESSION_SECRET`: Any random string for session encryption

### Step 4: Start the Server

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

Server will run at: `http://localhost:3000`

## 📁 Project Structure

```
netflix-clone/
├── server.js                 # Main Express server
├── package.json             # Dependencies
├── .env                     # Environment variables
├── README.md                # This file
└── public/
    ├── index.html           # Main HTML
    ├── style.css            # Styling
    ├── script.js            # Frontend JavaScript
    └── README.md            # Frontend docs
```

## 🚀 Usage

1. **Open Browser**: Navigate to `http://localhost:3000`

2. **Create Account**: Click "Sign Up" and fill in your details
   - Email (must be valid)
   - Password (min 6 characters)
   - Full Name

3. **Sign In**: Use your credentials to log in

4. **Search Shows**: Use the search bar to find movies/shows

5. **Add to List**: Click the plus button on any show to add to your watchlist

6. **View My List**: Your saved shows appear in the "My List" section

7. **Sign Out**: Click the logout button in the top-right

## 📊 Database Schema

### users table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### watchlist table
```sql
CREATE TABLE watchlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    show_id VARCHAR(255) NOT NULL,
    show_name VARCHAR(255) NOT NULL,
    show_image VARCHAR(1000),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_watchlist (user_id, show_id)
);
```

## 🔐 Security Features

- ✅ Password hashing with bcryptjs (salt rounds: 10)
- ✅ Session-based authentication
- ✅ CORS protection
- ✅ SQL injection prevention (prepared statements)
- ✅ Input validation
- ✅ Secure session cookies (httpOnly)

## 📱 Responsive Breakpoints

- **Desktop (1024px and up):** Full 4-card row for features, expansive movie grids.
- **Tablet (768px - 1023px):** 2x2 grid for feature cards, optimized navigation.
- **Mobile (Below 768px):** 1-column stacked cards, scaled-down typography for readability.

## 🐛 Troubleshooting

### "Cannot find module 'mysql2'"
```bash
npm install mysql2
```

### "Connection refused" error
- Check if MySQL is running
- Verify DB_HOST, DB_USER, DB_PASSWORD in .env
- Ensure database exists

### "Port 3000 already in use"
Change PORT in .env to another port (e.g., 3001)

### CORS errors
- Frontend and backend must be on the same origin
- Check API_URL in script.js matches server address

## 🎨 Customization

### Change Colors
Edit `public/style.css`:
```css
:root {
    --primary-color: #e50914;  /* Netflix Red */
    --bg-dark: #000;
    --bg-light: #1a1a1a;
}
```

### Add More Shows
TVMaze API is free and has 1000s of shows. Modify search limits in `script.js`:
```javascript
const trending = shows.slice(0, 20);  // Show more
```

### Change Logo
Edit in `public/index.html` and `style.css`

## 📚 API Endpoints

### Authentication
- `POST /api/signup` - Create new account
- `POST /api/signin` - Sign in user
- `POST /api/signout` - Sign out user
- `GET /api/auth-status` - Check login status

### Watchlist
- `POST /api/watchlist/add` - Add show to watchlist
- `POST /api/watchlist/remove` - Remove show from watchlist
- `GET /api/watchlist` - Get user's watchlist

## 📝 Request/Response Examples

### Sign Up
```javascript
POST /api/signup
{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
}

Response:
{
    "success": true,
    "message": "Account created successfully",
    "userId": 1
}
```

### Sign In
```javascript
POST /api/signin
{
    "email": "user@example.com",
    "password": "password123"
}

Response:
{
    "success": true,
    "message": "Sign in successful",
    "userId": 1
}
```

## ⚡ Performance Tips

1. **Database Indexing**: Already optimized with PRIMARY KEY and UNIQUE constraints
2. **Image Lazy Loading**: All images use `loading="lazy"`
3. **API Calls**: Minimize TVMaze API calls, consider caching
4. **CSS**: Minify before production
5. **JavaScript**: Use production builds

## 🔮 Future Enhancements

- [ ] Movie ratings and reviews
- [ ] User profiles with profile pictures
- [ ] Advanced search filters (genre, year, rating)
- [ ] Recommendations engine
- [ ] Watch history tracking
- [ ] Wishlist feature
- [ ] Social sharing
- [ ] Dark/Light mode toggle
- [ ] Multiple language support
- [ ] Payment integration

## 📄 License

This is an educational project. Netflix® is a trademark of Netflix, Inc.

## 👨‍💻 Author

Created for learning full-stack web development.

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review error messages in browser console
3. Check server logs in terminal

## 📞 Contact

For questions about this project, feel free to reach out!

---

**Happy Coding! 🎬**
