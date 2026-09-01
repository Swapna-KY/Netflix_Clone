// ==========================================
// NETFLIX CLONE — FRONTEND SCRIPT
// ==========================================

const API_URL = '/api';

const TVMAZE_API = 'https://api.tvmaze.com';

// ==========================================
// STATE
// ==========================================

let currentUser = null;
let watchlist = [];
let trendingShows = [];
let trendingOffset = 0;
let myListOffset = 0;
const CARDS_PER_PAGE = 5;

// ==========================================
// DOM ELEMENTS
// ==========================================

const navbar = document.getElementById('navbar');
const heroSection = document.getElementById('heroSection');
const featuresWrapper = document.getElementById('featuresWrapper');
const browseHero = document.getElementById('browseHero');
const heroBgImg = document.getElementById('heroBgImg');
const heroTitle = document.getElementById('heroTitle');
const heroDesc = document.getElementById('heroDesc');
const trendingRow = document.getElementById('trendingRow');
const trendingContainer = document.getElementById('trendingContainer');
const myListSection = document.getElementById('myListSection');
const myListContainer = document.getElementById('myListContainer');
const resultsSection = document.getElementById('resultsSection');
const movieResults = document.getElementById('movieResults');
const resultTitle = document.getElementById('resultTitle');
const navLinks = document.getElementById('navLinks');
const navSearchBtn = document.getElementById('navSearchBtn');
const notificationMenu = document.getElementById('notificationMenu');
const navBellBtn = document.getElementById('navBellBtn');
const notificationDropdown = document.getElementById('notificationDropdown');

// Auth elements
const loginOverlay = document.getElementById('loginOverlay');
const signupOverlay = document.getElementById('signupOverlay');
const openLoginBtn = document.getElementById('openLogin');
const userMenu = document.getElementById('userMenu');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const authButtons = document.querySelector('.nav-signin-btn');

// Forms
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const searchForm = document.getElementById('searchForm');
const heroEmailForm = document.getElementById('heroEmailForm');
const faqEmailForm = document.getElementById('faqEmailForm');

// Search bar
const searchBarOverlay = document.getElementById('searchBarOverlay');
const searchCloseBtn = document.getElementById('searchCloseBtn');
const keyword = document.getElementById('keyword');

// Detail modal
const detailOverlay = document.getElementById('detailOverlay');
const detailClose = document.getElementById('detailClose');
const detailImage = document.getElementById('detailImage');
const detailTitle = document.getElementById('detailTitle');
const detailDesc = document.getElementById('detailDesc');
const detailYear = document.getElementById('detailYear');
const detailGenres = document.getElementById('detailGenres');
const detailLanguage = document.getElementById('detailLanguage');
const detailStatus = document.getElementById('detailStatus');
const detailSite = document.getElementById('detailSite');
const detailFavBtn = document.getElementById('detailFavBtn');
const detailPlayBtn = document.getElementById('detailPlayBtn');

// Video Player
const videoOverlay = document.getElementById('videoOverlay');
const videoClose = document.getElementById('videoClose');
const videoPlayer = document.getElementById('videoPlayer');
const videoShowTitle = document.getElementById('videoShowTitle');

// Toast
const toast = document.getElementById('toast');

// ==========================================
// INIT
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    setupNavScroll();
    await checkAuthStatus();
    loadTrendingShows();
    setupEventListeners();
    setupFAQ();
    setupSliders();
    setupNavLinks();
    
    // Wire password toggles
    setupPasswordToggle('loginPassword', 'loginPasswordToggle');
    setupPasswordToggle('signupPassword', 'signupPasswordToggle');
});

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================

function setupNavScroll() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

// ==========================================
// AUTH STATUS CHECK
// ==========================================

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_URL}/auth-status`, { credentials: 'include' });
        const data = await response.json();

        if (data.authenticated) {
            currentUser = data;
            setLoggedInUI(data);
            await loadWatchlist();
        } else {
            setLoggedOutUI();
        }
    } catch {
        setLoggedOutUI();
    }
}

function setLoggedInUI(user) {
    currentUser = user;

    // Show browse hero, hide landing hero
    heroSection.style.display = 'none';
    featuresWrapper.style.display = 'none';
    browseHero.style.display = 'flex';

    // Navbar
    openLoginBtn.style.display = 'none';
    userMenu.style.display = 'block';
    navLinks.style.display = 'flex';
    navSearchBtn.style.display = 'flex';
    notificationMenu.style.display = 'block';
    userName.textContent = user.name || user.email.split('@')[0];
}

function setLoggedOutUI() {
    currentUser = null;
    watchlist = [];

    // Show landing hero, hide browse
    heroSection.style.display = 'flex';
    featuresWrapper.style.display = 'block';
    browseHero.style.display = 'none';
    myListSection.style.display = 'none';

    // Navbar
    openLoginBtn.style.display = 'block';
    userMenu.style.display = 'none';
    navLinks.style.display = 'none';
    navSearchBtn.style.display = 'none';
    notificationMenu.style.display = 'none';
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Open/close login modal
    openLoginBtn.addEventListener('click', () => openModal(loginOverlay));
    document.getElementById('switchToSignup').addEventListener('click', () => {
        closeModal(loginOverlay);
        openModal(signupOverlay);
    });
    document.getElementById('switchToLogin').addEventListener('click', () => {
        closeModal(signupOverlay);
        openModal(loginOverlay);
    });

    // Close modals on overlay click
    loginOverlay.addEventListener('click', e => {
        if (e.target === loginOverlay) closeModal(loginOverlay);
    });
    signupOverlay.addEventListener('click', e => {
        if (e.target === signupOverlay) closeModal(signupOverlay);
    });

    // Close detail modal
    detailClose.addEventListener('click', () => closeModal(detailOverlay));
    detailOverlay.addEventListener('click', e => {
        if (e.target === detailOverlay) closeModal(detailOverlay);
    });

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Forms
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    searchForm.addEventListener('submit', handleSearch);

    // Hero email forms — open signup modal
    heroEmailForm && heroEmailForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('heroEmail').value.trim();
        if (email) {
            openModal(signupOverlay);
            document.getElementById('signupEmail').value = email;
        } else {
            openModal(signupOverlay);
        }
    });

    faqEmailForm && faqEmailForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('faqEmail').value.trim();
        if (email) {
            openModal(signupOverlay);
            document.getElementById('signupEmail').value = email;
        } else {
            openModal(signupOverlay);
        }
    });

    // Search bar
    navSearchBtn && navSearchBtn.addEventListener('click', () => {
        searchBarOverlay.classList.add('active');
        keyword.focus();
    });
    searchCloseBtn && searchCloseBtn.addEventListener('click', closeSearchBar);

    // Close search results
    document.getElementById('closeSearchResults').addEventListener('click', () => {
        resultsSection.style.display = 'none';
    });

    // Escape key to close modals/search
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal(loginOverlay);
            closeModal(signupOverlay);
            closeModal(detailOverlay);
            closeSearchBar();
            if (videoOverlay.classList.contains('active')) {
                closeVideoPlayer();
            }
        }
    });

    // Video player close
    videoClose.addEventListener('click', closeVideoPlayer);

    // Click outside video container to close
    videoOverlay.addEventListener('click', e => {
        if (e.target === videoOverlay) closeVideoPlayer();
    });

    // Password toggles removed to prevent overlap with native browser icons
    
    // Notifications toggle
    navBellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (!notificationMenu.contains(e.target)) {
            notificationDropdown.classList.remove('open');
        }
    });


    // Logo home
    document.getElementById('logoHome').addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Browse hero play
    document.getElementById('featuredPlayBtn') && document.getElementById('featuredPlayBtn').addEventListener('click', () => {
        if (window.heroShowRef) openVideoPlayer(window.heroShowRef);
    });

    // Detail modal play — open in-site video player
    detailPlayBtn.addEventListener('click', () => {
        if (window.detailShowRef) openVideoPlayer(window.detailShowRef);
    });

    // Language selections
    const handleLanguageChange = async (e) => {
        const val = e.target.value;
        // Sync both dropdowns
        const navLang = document.getElementById('languageSelect');
        const footLang = document.getElementById('footerLanguageSelect');
        if (navLang) navLang.value = val;
        if (footLang) footLang.value = val;

        if (val === 'en') {
            resultsSection.style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const langMap = { 'hi': 'Hindi', 'kn': 'Kannada', 'ta': 'Tamil' };
            const langName = langMap[val];
            if (langName) {
                await searchAndDisplayLang(langName);
            }
        }
    };

    document.getElementById('languageSelect')?.addEventListener('change', handleLanguageChange);
    document.getElementById('footerLanguageSelect')?.addEventListener('change', handleLanguageChange);
}

// ==========================================
// MODAL HELPERS
// ==========================================

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// VIDEO PLAYER
// ==========================================

/**
 * openVideoPlayer(show)
 * Requires the user to be signed in.
 * If not signed in, opens the login modal instead.
 * If signed in, searches YouTube for the show's official trailer.
 */
function openVideoPlayer(show) {
    if (!currentUser) {
        // Not logged in — prompt sign-in
        openModal(loginOverlay);
        showToast('Please sign in to watch content.');
        return;
    }
    const query = encodeURIComponent((show.name || 'trailer') + ' official trailer');
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
}

// closeVideoPlayer kept for safety (Escape key etc.)
function closeVideoPlayer() {
    videoPlayer.src = '';
    closeModal(videoOverlay);
}



// ==========================================
// SEARCH BAR
// ==========================================

function closeSearchBar() {
    searchBarOverlay.classList.remove('active');
    keyword.value = '';
    resultsSection.style.display = 'none';
}

// ==========================================
// PASSWORD TOGGLE
// ==========================================

function setupPasswordToggle(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
}

// ==========================================
// AUTHENTICATION
// ==========================================

async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const btn = document.getElementById('signupSubmitBtn');
    const msg = document.getElementById('signupMessage');

    clearErrors(['signupEmailError', 'signupPasswordError', 'signupMessage']);

    if (!name || !email || !password) {
        showFieldError('signupMessage', 'All fields are required.');
        return;
    }
    if (!isValidEmail(email)) {
        showFieldError('signupEmailError', 'Please enter a valid email.');
        return;
    }
    if (password.length < 6) {
        showFieldError('signupPasswordError', 'Password must be at least 6 characters.');
        return;
    }

    btn.textContent = 'Creating account...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, name })
        });

        const data = await res.json();

        if (!res.ok) {
            showFieldError('signupMessage', data.error || 'Sign up failed.');
            btn.textContent = 'Sign Up';
            btn.disabled = false;
            return;
        }

        msg.className = 'message success';
        msg.textContent = '✓ Account created!';

        setTimeout(() => {
            closeModal(signupOverlay);
            signupForm.reset();
            msg.textContent = '';
            setLoggedInUI({ email: email, name: name });
            loadWatchlist();
        }, 1200);

    } catch {
        showFieldError('signupMessage', 'Sign up failed. Please try again.');
    } finally {
        btn.textContent = 'Sign Up';
        btn.disabled = false;
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginSubmitBtn');
    const msg = document.getElementById('loginMessage');

    clearErrors(['loginEmailError', 'loginPasswordError', 'loginMessage']);

    if (!email || !password) {
        showFieldError('loginMessage', 'Please enter your email and password.');
        return;
    }

    btn.textContent = 'Signing in...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showFieldError('loginMessage', data.error || 'Incorrect password. Please try again.');
            btn.textContent = 'Sign In';
            btn.disabled = false;
            return;
        }

        msg.className = 'message success';
        msg.textContent = '✓ Welcome back!';

        setTimeout(() => {
            closeModal(loginOverlay);
            loginForm.reset();
            msg.textContent = '';
            setLoggedInUI(data);
            loadWatchlist();
        }, 1200);

    } catch {
        showFieldError('loginMessage', 'Sign in failed. Please try again.');
    } finally {
        btn.textContent = 'Sign In';
        btn.disabled = false;
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_URL}/signout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch {}

    setLoggedOutUI();
    resultsSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('You have been signed out.');
}

// ==========================================
// SEARCH
// ==========================================

async function handleSearch(e) {
    e.preventDefault();
    const q = keyword.value.trim();
    if (!q) return;

    closeSearchBar();
    
    // Show explicit loading state for search
    resultsSection.style.display = 'block';
    resultTitle.textContent = `Searching for "${q}"...`;
    movieResults.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:50px;"><i class="fas fa-spinner fa-spin" style="font-size:30px;color:#e50914;"></i></div>';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    try {
        const res = await fetch(`${TVMAZE_API}/search/shows?q=${encodeURIComponent(q)}`);
        const results = await res.json();

        movieResults.innerHTML = '';
        resultTitle.textContent = `Search results for "${q}"`;
        resultsSection.style.display = 'block';

        if (!results.length) {
            movieResults.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#808080;padding:40px 0;font-size:18px;">No results found. Try a different title.</p>';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        results.forEach(item => {
            const card = createMovieCard(item.show);
            movieResults.appendChild(card);
        });

        resultsSection.scrollIntoView({ behavior: 'smooth' });
    } catch {
        showToast('Search failed. Please try again.');
    }
}

// ==========================================
// CONTENT LOADING
// ==========================================

async function loadTrendingShows() {
    // Show skeletons
    showSkeletons(trendingContainer, 6);

    try {
        const res = await fetch(`${TVMAZE_API}/shows?page=0`);
        trendingShows = await res.json();

        trendingContainer.innerHTML = '';
        const shows = trendingShows.filter(s => s.image).slice(0, 20);

        // Update Dynamic Hero with a highly rated show
        if (shows.length > 0) {
            const heroShow = shows.find(s => s.rating && s.rating.average >= 8.5) || shows[0];
            window.heroShowRef = heroShow; // store reference for Play button
            const heroImg = heroShow.image.original || heroShow.image.medium;
            if (heroBgImg) heroBgImg.src = heroImg;
            if (heroTitle) heroTitle.textContent = heroShow.name;
            if (heroDesc) {
                const summary = heroShow.summary ? heroShow.summary.replace(/<[^>]+>/g, '') : 'No description available.';
                heroDesc.textContent = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
            }
            
            // Re-wire hero 'More Info' button dynamically
            const featuredMoreBtn = document.getElementById('featuredMoreBtn');
            if (featuredMoreBtn) {
                // Remove old event listeners by cloning
                const newMoreBtn = featuredMoreBtn.cloneNode(true);
                featuredMoreBtn.parentNode.replaceChild(newMoreBtn, featuredMoreBtn);
                newMoreBtn.addEventListener('click', () => openDetailModal(heroShow));
            }
        }

        shows.forEach((show, i) => {
            const card = createNetflixCard(show, i);
            trendingContainer.appendChild(card);
        });

    } catch {
        trendingContainer.innerHTML = '<p style="color:#808080;padding:20px;">Could not load shows.</p>';
    }
}

// ==========================================
// CARD CREATORS
// ==========================================

function createNetflixCard(show, index) {
    const card = document.createElement('div');
    card.className = 'netflix-card';
    card.setAttribute('data-show-id', show.id);

    const imgUrl = show.image ? (show.image.medium || show.image.original) : 'https://via.placeholder.com/284x160/1a1a1a/ffffff?text=No+Image';
    const genres = show.genres ? show.genres.slice(0, 3).join(' • ') : 'Drama';
    const rating = show.rating?.average ? `${show.rating.average}/10` : 'N/A';
    const premiered = show.premiered ? show.premiered.split('-')[0] : '';
    const inList = watchlist.some(w => w.show_id === String(show.id));

    card.innerHTML = `
        <img src="${imgUrl}" alt="${show.name}" loading="lazy" class="card-thumb" onerror="this.src='https://via.placeholder.com/284x160/1a1a1a/808080?text=No+Image'">
        <div class="card-popup">
            <div class="card-popup-actions">
                <button class="popup-play-btn" title="Play">
                    <i class="fas fa-play"></i>
                </button>
                <button class="popup-fav-btn ${inList ? 'added' : ''}" title="${inList ? 'Remove from My List' : 'Add to My List'}">
                    <i class="fas ${inList ? 'fa-check' : 'fa-plus'}"></i>
                </button>
                <button class="popup-more-btn" title="More Info">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <p class="card-popup-title">${show.name}</p>
            <div class="card-popup-meta">
                ${show.rating?.average ? `<span class="meta-match">${Math.round(show.rating.average * 10)}% Match</span>` : ''}
                ${premiered ? `<span>${premiered}</span>` : ''}
            </div>
            ${genres ? `<p class="card-popup-genres">${genres}</p>` : ''}
        </div>
    `;

    // Play button — open in-site video player
    card.querySelector('.popup-play-btn').addEventListener('click', e => {
        e.stopPropagation();
        openVideoPlayer(show);
    });

    // Fav button
    const favBtn = card.querySelector('.popup-fav-btn');
    favBtn.addEventListener('click', e => {
        e.stopPropagation();
        toggleWatchlist(show, favBtn);
    });

    // More info
    card.querySelector('.popup-more-btn').addEventListener('click', e => {
        e.stopPropagation();
        openDetailModal(show);
    });

    // Click on card itself
    card.addEventListener('click', () => openDetailModal(show));

    return card;
}

function createMovieCard(show) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const image = show.image
        ? (show.image.original || show.image.medium)
        : 'https://via.placeholder.com/300x450/1a1a1a/808080?text=No+Image';
    const rating = show.rating?.average ? `${show.rating.average}/10` : 'N/A';
    const inList = watchlist.some(w => w.show_id === String(show.id));

    card.innerHTML = `
        <img src="${image}" alt="${show.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/808080?text=No+Image'">
        <div class="movie-card-overlay">
            <p class="movie-card-title">${show.name}</p>
            <p class="movie-card-rating">⭐ ${rating}</p>
            <div class="movie-card-actions">
                <button class="mc-play-btn">
                    <i class="fas fa-play"></i> Play
                </button>
                <button class="mc-fav-btn ${inList ? 'added' : ''}" title="${inList ? 'Remove from list' : 'Add to My List'}">
                    <i class="fas ${inList ? 'fa-check' : 'fa-plus'}"></i>
                </button>
            </div>
        </div>
    `;

    card.querySelector('.mc-play-btn').addEventListener('click', e => {
        e.stopPropagation();
        openVideoPlayer(show);
    });

    const favBtn = card.querySelector('.mc-fav-btn');
    favBtn.addEventListener('click', e => {
        e.stopPropagation();
        toggleWatchlist(show, favBtn);
    });

    card.addEventListener('click', () => openDetailModal(show));

    return card;
}

// ==========================================
// DETAIL MODAL
// ==========================================

function openDetailModal(show) {
    const imgUrl = show.image ? (show.image.original || show.image.medium) : 'https://via.placeholder.com/850x480/1a1a1a/808080?text=No+Image';
    const summary = show.summary ? show.summary.replace(/<[^>]+>/g, '') : 'No description available.';
    const premiered = show.premiered ? show.premiered.split('-')[0] : '';
    const genres = show.genres ? show.genres.join(', ') : 'N/A';
    const inList = watchlist.some(w => w.show_id === String(show.id));

    detailImage.src = imgUrl;
    detailImage.alt = show.name;
    detailTitle.textContent = show.name;
    detailDesc.textContent = summary;
    detailYear.textContent = premiered;
    detailGenres.textContent = genres;
    detailLanguage.textContent = show.language || 'N/A';
    detailStatus.textContent = show.status || 'N/A';
    
    if (show.officialSite || show.url) {
        detailSite.href = show.officialSite || show.url;
        detailSite.textContent = 'Visit Official Site';
    } else {
        detailSite.href = '#';
        detailSite.textContent = 'N/A';
    }

    // Always query fresh reference (in case node was replaced previously)
    const currentFavBtn = document.getElementById('detailFavBtn');
    currentFavBtn.innerHTML = inList ? '<i class="fas fa-check"></i>' : '<i class="fas fa-plus"></i>';
    currentFavBtn.title = inList ? 'Remove from My List' : 'Add to My List';

    // Clone to remove old event listeners
    const newFavBtn = currentFavBtn.cloneNode(true);
    newFavBtn.id = 'detailFavBtn';
    currentFavBtn.parentNode.replaceChild(newFavBtn, currentFavBtn);

    newFavBtn.addEventListener('click', async () => {
        if (!currentUser) {
            closeModal(detailOverlay);
            openModal(loginOverlay);
            return;
        }
        const isAdded = watchlist.some(w => w.show_id === String(show.id));
        if (isAdded) {
            await removeFromWatchlist(show.id);
            newFavBtn.innerHTML = '<i class="fas fa-plus"></i>';
            newFavBtn.title = 'Add to My List';
        } else {
            await addToWatchlist(show.id, show.name, imgUrl);
            newFavBtn.innerHTML = '<i class="fas fa-check"></i>';
            newFavBtn.title = 'Remove from My List';
        }
    });

    // Store show reference for Play button
    window.detailShowRef = show;

    openModal(detailOverlay);
}

// ==========================================
// WATCHLIST
// ==========================================

async function toggleWatchlist(show, btn) {
    if (!currentUser) {
        openModal(loginOverlay);
        return;
    }

    const imgUrl = show.image ? (show.image.original || show.image.medium) : '';
    const isAdded = watchlist.some(w => w.show_id === String(show.id));

    if (isAdded) {
        await removeFromWatchlist(show.id);
        btn.classList.remove('added');
        btn.innerHTML = '<i class="fas fa-plus"></i>';
        btn.title = 'Add to My List';
    } else {
        await addToWatchlist(show.id, show.name, imgUrl);
        btn.classList.add('added');
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.title = 'Remove from My List';
    }
}

async function addToWatchlist(showId, showName, showImage) {
    try {
        const res = await fetch(`${API_URL}/watchlist/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ show_id: showId, show_name: showName, show_image: showImage })
        });
        if (res.ok) {
            await loadWatchlist();
            showToast(`✓ Added to My List`);
        }
    } catch {
        showToast('Failed to add to list.');
    }
}

async function removeFromWatchlist(showId) {
    try {
        const res = await fetch(`${API_URL}/watchlist/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ show_id: showId })
        });
        if (res.ok) {
            await loadWatchlist();
            showToast('Removed from My List');
        }
    } catch {
        showToast('Failed to remove from list.');
    }
}

async function loadWatchlist() {
    try {
        const res = await fetch(`${API_URL}/watchlist`, { credentials: 'include' });
        if (!res.ok) return;
        watchlist = await res.json();
        renderMyList();
    } catch {}
}

function renderMyList() {
    if (!currentUser || watchlist.length === 0) {
        myListSection.style.display = 'none';
        return;
    }

    myListSection.style.display = 'block';
    myListContainer.innerHTML = '';

    watchlist.forEach(item => {
        const card = document.createElement('div');
        card.className = 'netflix-card';

        const imgUrl = item.show_image || 'https://via.placeholder.com/284x160/1a1a1a/808080?text=No+Image';

        card.innerHTML = `
            <img src="${imgUrl}" alt="${item.show_name}" loading="lazy" class="card-thumb"
                onerror="this.src='https://via.placeholder.com/284x160/1a1a1a/808080?text=No+Image'">
            <div class="card-popup">
                <div class="card-popup-actions">
                    <button class="popup-play-btn" title="Play">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="popup-fav-btn added" title="Remove from My List">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
                <p class="card-popup-title">${item.show_name}</p>
                <div class="card-popup-meta">
                    <span class="meta-match">Saved</span>
                </div>
            </div>
        `;

        card.querySelector('.popup-play-btn').addEventListener('click', e => {
            e.stopPropagation();
            // My List cards only store show_id and name — open player with minimal show object
            openVideoPlayer({ id: item.show_id, name: item.show_name });
        });

        card.querySelector('.popup-fav-btn').addEventListener('click', async e => {
            e.stopPropagation();
            await removeFromWatchlist(item.show_id);
        });

        myListContainer.appendChild(card);
    });
}

// ==========================================
// NAVBAR LINK HANDLERS
// ==========================================

function setupNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', async e => {
            e.preventDefault();
            const label = link.textContent.trim();

            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            switch (label) {
                case 'Home':
                    resultsSection.style.display = 'none';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    break;

                case 'TV Shows':
                    await showFilteredContent('TV Shows', s => s.type === 'Scripted' || s.type === 'Reality');
                    break;

                case 'TV Dramas':
                    // TVMaze is TV-only; filter for drama genre shows
                    await showFilteredContent('TV Dramas', s => {
                        const genres = s.genres || [];
                        return genres.includes('Drama') || genres.includes('Thriller') || genres.includes('Crime');
                    });
                    break;

                case 'New & Popular':
                    await showFilteredContent('New & Popular', s => {
                        const year = s.premiered ? parseInt(s.premiered.split('-')[0]) : 0;
                        const rating = s.rating && s.rating.average ? s.rating.average : 0;
                        // Return shows rated 8.0+ or premiered recently
                        return rating >= 8.5 || year >= 2015;
                    });
                    break;

                case 'My List':
                    if (watchlist.length > 0) {
                        myListSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        showToast('Your list is empty — add shows first!');
                    }
                    break;
            }
        });
    });
}

async function showFilteredContent(title, filterFn) {
    resultsSection.style.display = 'block';
    resultTitle.textContent = title;
    movieResults.innerHTML = '<p style="grid-column:1/-1;color:#808080;padding:40px 20px;font-size:16px;">Loading...</p>';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    // Use already-loaded trendingShows if available
    let source = trendingShows.length ? trendingShows : [];
    if (!source.length) {
        try {
            const res = await fetch(`${TVMAZE_API}/shows?page=0`);
            source = await res.json();
        } catch { }
    }

    const filtered = source.filter(s => s.image && filterFn(s));
    movieResults.innerHTML = '';

    if (!filtered.length) {
        movieResults.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#808080;padding:40px 0;font-size:18px;">No results found.</p>';
        return;
    }

    filtered.slice(0, 24).forEach(show => {
        movieResults.appendChild(createMovieCard(show));
    });
}

async function searchAndDisplay(title, query) {
    resultsSection.style.display = 'block';
    resultTitle.textContent = title;
    movieResults.innerHTML = '<p style="grid-column:1/-1;color:#808080;padding:40px 20px;font-size:16px;">Loading...</p>';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    try {
        const res = await fetch(`${TVMAZE_API}/search/shows?q=${encodeURIComponent(query)}`);
        const results = await res.json();
        movieResults.innerHTML = '';

        if (!results.length) {
            movieResults.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#808080;padding:40px 0;font-size:18px;">No results found.</p>';
            return;
        }

        results.forEach(item => {
            movieResults.appendChild(createMovieCard(item.show));
        });
    } catch {
        movieResults.innerHTML = '<p style="grid-column:1/-1;color:#e50914;padding:40px 20px;">Failed to load. Please try again.</p>';
    }
}

async function searchAndDisplayLang(langName) {
    resultsSection.style.display = 'block';
    resultTitle.textContent = `${langName} Movies & TV`;
    movieResults.innerHTML = '<p style="grid-column:1/-1;color:#808080;padding:40px 20px;font-size:16px;">Loading regional content...</p>';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    try {
        // Cast a wide net to find regional shows on TVMaze
        const queries = ['india', langName, 'bigg boss', 'love', 'family', 'action', 'drama'];
        let allShows = [];
        
        await Promise.all(queries.map(async q => {
            try {
                const res = await fetch(`${TVMAZE_API}/search/shows?q=${q}`);
                const data = await res.json();
                allShows.push(...data.map(d => d.show));
            } catch(e) {}
        }));
        
        // Remove duplicates by ID
        const uniqueShows = Array.from(new Map(allShows.map(s => [s.id, s])).values());
        
        // Filter STRICTLY by language attribute to prevent 'Canada' matching 'Kannada'
        const filtered = uniqueShows.filter(s => s.language && s.language.toLowerCase() === langName.toLowerCase() && s.image);
        
        movieResults.innerHTML = '';
        if (!filtered.length) {
            movieResults.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#808080;padding:40px 0;font-size:18px;">No results found for this language.</p>';
            return;
        }

        filtered.slice(0, 24).forEach(show => {
            movieResults.appendChild(createMovieCard(show));
        });
    } catch {
        movieResults.innerHTML = '<p style="grid-column:1/-1;color:#e50914;padding:40px 20px;">Failed to load language content.</p>';
    }
}


// ==========================================
// SLIDERS
// ==========================================

function setupSliders() {
    setupSlider('trendingPrev', 'trendingNext', 'trendingContainer');
    setupSlider('myListPrev', 'myListNext', 'myListContainer');
}

function setupSlider(prevId, nextId, containerId) {
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const container = document.getElementById(containerId);

    if (!prevBtn || !nextBtn || !container) return;

    nextBtn.addEventListener('click', () => {
        const scrollAmt = container.clientWidth * 0.75;
        container.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        const scrollAmt = container.clientWidth * 0.75;
        container.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
    });
}

// ==========================================
// FAQ ACCORDION
// ==========================================

function setupFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Close all
            items.forEach(i => {
                i.classList.remove('open');
                i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current
            if (!isOpen) {
                item.classList.add('open');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

// ==========================================
// SKELETON LOADER
// ==========================================

function showSkeletons(container, count) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const sk = document.createElement('div');
        sk.className = 'skeleton skeleton-card';
        container.appendChild(sk);
    }
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================

let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// ==========================================
// UTILITY
// ==========================================

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'message error';
    el.textContent = msg;
}

function clearErrors(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '';
            el.className = el.tagName === 'SPAN' ? 'error-message' : 'message';
        }
    });
}
