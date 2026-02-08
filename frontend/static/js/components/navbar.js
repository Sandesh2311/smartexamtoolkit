class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    background: rgba(2, 6, 23, 0.8);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    font-size: 1.25rem;
                    color: white;
                    text-decoration: none;
                }
                
                .logo span {
                    color: #38bdf8;
                }
                
                .nav-links {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }
                
                .nav-links a {
                    color: rgba(255, 255, 255, 0.8);
                    text-decoration: none;
                    transition: color 0.2s;
                    font-weight: 500;
                }
                
                .nav-links a:hover {
                    color: #38bdf8;
                }
                
                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                }
                
                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block;
                    }
                    
                    .nav-links {
                        display: none;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: #020617;
                        flex-direction: column;
                        padding: 1rem;
                        gap: 1rem;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    
                    .nav-links.active {
                        display: flex;
                    }
                }
            </style>
            
            <nav>
                <a href="index.html" class="logo">
                    <i data-feather="zap"></i>
                    Exam<span>Forge</span>
                </a>
                
                <button class="mobile-menu-btn">
                    <i data-feather="menu"></i>
                </button>
                
                <div class="nav-links">
                    <!-- Links will be populated based on auth state -->
                </div>
            </nav>
        `;
        
        // populate auth-aware links
        const navLinks = this.shadowRoot.querySelector('.nav-links');
        const isAuth = !!localStorage.getItem('accessToken');

        const renderLinks = (authed) => {
            navLinks.innerHTML = `
                <a href="index.html">Home</a>
                <a href="index.html#features">Features</a>
                <a href="dashboard.html">Dashboard</a>
                ${authed ? `<button id="logout-btn" class="bg-transparent border border-primary text-primary px-4 py-2 rounded-lg">Logout</button>` : `<a href="login.html">Login</a><a href="register.html" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Sign Up</a>`}
            `;

            if (authed) {
                const btn = this.shadowRoot.querySelector('#logout-btn');
                btn.addEventListener('click', () => {
                    if (window.appLogout) window.appLogout();
                    else {
                        localStorage.removeItem('accessToken');
                        window.location.href = 'index.html';
                    }
                });
            }
        };

        renderLinks(isAuth);
        
        // Ensure feather icons render inside the component's shadow DOM
        if (window.feather && typeof feather.replace === 'function') {
            feather.replace({}, this.shadowRoot);
        }
        
        // Mobile menu toggle
        this.shadowRoot.querySelector('.mobile-menu-btn').addEventListener('click', () => {
            const navLinks = this.shadowRoot.querySelector('.nav-links');
            navLinks.classList.toggle('active');
        });

        // Remove light-DOM fallback if present to avoid duplicate navs
        const fallback = this.querySelector('#fallback-nav');
        if (fallback) fallback.remove();

        // Debugging: log auth state and nav content for easier debugging
        console.debug('Navbar connected. isAuth=', isAuth);
        const shadowNavLinks = this.shadowRoot.querySelector('.nav-links');
        console.debug('Navbar links HTML:', shadowNavLinks ? shadowNavLinks.innerHTML : null);
        if (!shadowNavLinks || !shadowNavLinks.innerHTML.trim()) {
            // Ensure a visible login link as a last-resort fallback
            this.innerHTML = '<nav id="fallback-nav"><a href="index.html">Home</a> <a href="login.html">Login</a> <a href="register.html">Sign Up</a></nav>';
            console.warn('Navbar failed to populate shadow links; applied light-DOM fallback.');
        }
    }
}

customElements.define('custom-navbar', CustomNavbar);
