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
        navLinks.innerHTML = `
            <a href="index.html">Home</a>
            <a href="#features">Features</a>
            <a href="dashboard.html">Dashboard</a>
            ${isAuth ? `<button id="logout-btn" class="bg-transparent border border-primary text-primary px-4 py-2 rounded-lg">Logout</button>` : `<a href="login.html">Login</a><a href="register.html" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Sign Up</a>`}
        `;

        if (isAuth) {
            const btn = this.shadowRoot.querySelector('#logout-btn');
            btn.addEventListener('click', () => {
                // clear token and refresh
                localStorage.removeItem('accessToken');
                // If main page exposes logout helper, call it
                if (window.appLogout) window.appLogout();
                else window.location.href = 'index.html';
            });
        }
        
        // Ensure feather icons render inside the component's shadow DOM
        if (window.feather && typeof feather.replace === 'function') {
            feather.replace({}, this.shadowRoot);
        }
        
        // Mobile menu toggle
        this.shadowRoot.querySelector('.mobile-menu-btn').addEventListener('click', () => {
            const navLinks = this.shadowRoot.querySelector('.nav-links');
            navLinks.classList.toggle('active');
        });
    }
}

customElements.define('custom-navbar', CustomNavbar);