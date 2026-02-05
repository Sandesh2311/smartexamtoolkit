// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const target = href && href !== '#' ? document.querySelector(href) : null;
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Animate elements when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-card').forEach(card => {
        observer.observe(card);
    });
});

// Form validation for login/register
function validateForm(form) {
    const email = form.querySelector('input[type="email"]');
    const password = form.querySelector('input[type="password"]');
    const confirm = form.querySelector('input[id="confirm-password"], input[name="confirm-password"]');
    const name = form.querySelector('input[name="name"], input[id="name"]');

    if (name && name.value.trim().length < 2) {
        alert('Please enter your full name');
        return false;
    }

    if (!email || !email.value || !email.value.includes('@')) {
        alert('Please enter a valid email address');
        return false;
    }

    if (!password || !password.value || password.value.length < 8) {
        alert('Password must be at least 8 characters');
        return false;
    }

    if (confirm && password.value !== confirm.value) {
        alert('Passwords do not match');
        return false;
    }

    return true;
}

// --- AI + Razorpay integrations ---

const API_BASE = window.API_BASE || '/api';

let sessionCache = { loaded: false, authenticated: false, email: null, is_premium: false };

async function fetchSession() {
    try {
        const res = await fetch(`${API_BASE}/session`, { credentials: 'same-origin' });
        if (res.ok) {
            const data = await res.json();
            sessionCache = { ...sessionCache, ...data, loaded: true, authenticated: !!data.authenticated };
            return sessionCache;
        }
    } catch (err) {
        console.error('session fetch failed', err);
    }
    sessionCache = { ...sessionCache, loaded: true, authenticated: false };
    return sessionCache;
}

function isAuthenticated() {
    return !!sessionCache.authenticated;
}

async function ensureSessionLoaded() {
    if (!sessionCache.loaded) await fetchSession();
    return sessionCache;
}

async function generateAI(prompt) {
    try {
        const res = await fetch(`${API_BASE}/openai/generate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'same-origin',
            body: JSON.stringify({prompt})
        });
        const data = await res.json();
        if (res.ok) return data.result;
        throw new Error(data.error || 'AI error');
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getRazorpayKey() {
    const res = await fetch(`${API_BASE}/config`, { credentials: 'same-origin' });
    const data = await res.json();
    return data.razorpay_key_id;
}

async function createOrder(amount) {
    const res = await fetch(`${API_BASE}/payments/create`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({amount})
    });
    const data = await res.json();
    if (!res.ok) {
        const msg = data.error || data.msg || res.statusText || 'Order creation failed';
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    return data.order;
}

async function verifyPayment(details) {
    const res = await fetch(`${API_BASE}/payments/verify`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify(details)
    });
    const data = await res.json();
    if (!res.ok) {
        const msg = data.error || data.msg || res.statusText || 'Payment verification failed';
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    return data;
}

document.addEventListener('DOMContentLoaded', () => {
    ensureSessionLoaded();

    const genBtn = document.getElementById('ai-generate');
    const clearBtn = document.getElementById('ai-clear');
    const promptEl = document.getElementById('ai-prompt');
    const resultEl = document.getElementById('ai-result');

    async function logout() {
        try {
            await fetch('/logout', { method: 'POST', credentials: 'same-origin' });
        } finally {
            window.location.href = '/';
        }
    }

    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateForm(loginForm)) return;
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            try {
                const res = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'same-origin',
                    body: JSON.stringify({email, password})
                });
                const data = await res.json();
                if (!res.ok) { alert(data.error || 'Login failed'); return; }
                window.location.href = '/dashboard';
            } catch (e) {
                console.error(e);
                alert('Login error');
            }
        });
    }

    // Register form handler
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateForm(registerForm)) return;
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;
            try {
                const res = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'same-origin',
                    body: JSON.stringify({email, password})
                });
                const data = await res.json();
                if (!res.ok) { alert(data.error || 'Registration failed'); return; }
                window.location.href = '/dashboard';
            } catch (e) {
                console.error(e);
                alert('Registration error');
            }
        });
    }

    // AI actions
    if (genBtn && promptEl && resultEl) {
        genBtn.addEventListener('click', async () => {
            const prompt = promptEl.value.trim();
            if (!prompt) return alert('Please enter a prompt');
            genBtn.disabled = true;
            genBtn.textContent = 'Generating...';
            try {
                const text = await generateAI(prompt);
                resultEl.textContent = text;
                resultEl.classList.remove('hidden');
            } catch (e) {
                alert('Error generating content: ' + (e.message || e));
            } finally {
                genBtn.disabled = false;
                genBtn.textContent = 'Generate';
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                promptEl.value = '';
                resultEl.textContent = '';
                resultEl.classList.add('hidden');
            });
        }
    }

    // Payment actions
    const buyBtn = document.getElementById('buy-premium');
    if (buyBtn) {
        ensureSessionLoaded().then((state) => {
            if (!state.authenticated) {
                buyBtn.classList.add('opacity-60', 'cursor-not-allowed');
                buyBtn.title = 'Please login to purchase';
            }
        });

        buyBtn.addEventListener('click', async () => {
            await ensureSessionLoaded();
            if (!isAuthenticated()) {
                if (confirm('You must be logged in to purchase. Go to login page?')) {
                    window.location.href = '/login';
                }
                return;
            }
            if (sessionCache.is_premium) {
                alert('You already have premium access.');
                return;
            }
            const amount = Number(buyBtn.dataset.amount) || 99;
            try {
                const statusEl = document.getElementById('payment-status');
                if (statusEl) statusEl.textContent = 'Initiating payment...';
                const key = await getRazorpayKey();
                if (!key) {
                    if (statusEl) statusEl.textContent = 'Payment unavailable: server not configured';
                    alert('Payment not available: Razorpay public key not configured on the server.');
                    return;
                }

                if (statusEl) statusEl.textContent = 'Creating order...';
                let order;
                try {
                    order = await createOrder(amount);
                } catch (err) {
                    if (statusEl) statusEl.textContent = 'Order creation failed';
                    if (err.status === 401 || (err.message && err.message.toLowerCase().includes('authorization'))) {
                        if (confirm('You must be logged in to purchase. Go to login page?')) window.location.href = '/login';
                        return;
                    }
                    alert('Could not create order: ' + (err.message || err));
                    return;
                }

                if (statusEl) statusEl.textContent = 'Opening checkout...';
                const options = {
                    key,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'ExamForge Pro',
                    description: 'Premium Upgrade',
                    order_id: order.id,
                    handler: async function (response) {
                        try {
                            const verify = await verifyPayment(response);
                            if (verify.status === 'ok') {
                                alert('Payment successful! Thank you.');
                                sessionCache.is_premium = true;
                                window.location.reload();
                            } else {
                                alert('Payment verification failed.');
                            }
                        } catch (e) {
                            console.error('Error verifying payment', e);
                            alert('Error verifying payment.');
                        }
                    },
                    prefill: { name: '', email: '' },
                    theme: { color: '#38bdf8' }
                };
                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function (resp) {
                    console.error('Payment failed event', resp);
                    alert('Payment failed: ' + (resp.error && resp.error.description));
                });
                rzp.open();
            } catch (e) {
                console.error('Payment initiation failed', e);
                alert('Payment initiation failed: ' + (e.message || e));
            }
        });
    }

    // Expose logout for nav component or other parts
    window.appLogout = logout;
});






















































































































































































































































































        