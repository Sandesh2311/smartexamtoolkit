class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    background: rgba(2, 6, 23, 0.9);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 3rem 2rem;
                }
                
                .footer-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                }
                
                .footer-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    font-size: 1.25rem;
                    color: white;
                    margin-bottom: 1rem;
                }
                
                .footer-logo span {
                    color: #38bdf8;
                }
                
                .footer-description {
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }
                
                .footer-links h3 {
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                
                .footer-links ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .footer-links li {
                    margin-bottom: 0.5rem;
                }
                
                .footer-links a {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: color 0.2s;
                }
                
                .footer-links a:hover {
                    color: #38bdf8;
                }
                
                .social-links {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                
                .social-links a {
                    color: rgba(255, 255, 255, 0.7);
                    transition: color 0.2s;
                }
                
                .social-links a:hover {
                    color: #38bdf8;
                }
                
                .copyright {
                    text-align: center;
                    margin-top: 3rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.875rem;
                }
                
                @media (max-width: 768px) {
                    .footer-container {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
            <div class="footer-container">
                <div>
                    <div class="footer-logo">
                        <i data-feather="zap"></i>
                        Exam<span>Forge</span>
                    </div>
                    <p class="footer-description">
                        AI-powered exam generator for educators. Save hours of manual work with our automated tools.
                    </p>
                    <div class="social-links">
                        <a href="#"><i data-feather="twitter"></i></a>
                        <a href="#"><i data-feather="facebook"></i></a>
                        <a href="#"><i data-feather="linkedin"></i></a>
                        <a href="#"><i data-feather="github"></i></a>
                    </div>
                </div>
                
                <div class="footer-links">
                    <h3>Product</h3>
                    <ul>
                        <li><a href="#features">Features</a></li>
                        <li><a href="pricing.html">Pricing</a></li>
                        <li><a href="dashboard.html">Dashboard</a></li>
                        <li><a href="premium.html">Premium</a></li>
                    </ul>
                </div>
                
                <div class="footer-links">
                    <h3>Company</h3>
                    <ul>
                        <li><a href="about.html">About</a></li>
                        <li><a href="blog.html">Blog</a></li>
                        <li><a href="careers.html">Careers</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </div>
                
                <div class="footer-links">
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="privacy.html">Privacy</a></li>
                        <li><a href="terms.html">Terms</a></li>
                        <li><a href="cookies.html">Cookies</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="copyright">
                &copy; ${new Date().getFullYear()} SmartExamToolkit. All rights reserved.
            </div>
        `;
        
        // Replace feather icons inside the shadow DOM
        if (window.feather && typeof feather.replace === 'function') {
            feather.replace({}, this.shadowRoot);
        }
    }
}

customElements.define('custom-footer', CustomFooter);