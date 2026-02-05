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

// --- OpenAI + Razorpay integrations ---

const API_BASE = window.API_BASE || 'http://127.0.0.1:5000/api';

async function generateAI(prompt) {
    try {
        const res = await fetch(`${API_BASE}/openai/generate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({prompt})
        });
        const data = await res.json();
        if (res.ok) return data.result;
        throw new Error(data.error || 'OpenAI error');
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getRazorpayKey() {
    const res = await fetch(`${API_BASE}/config`);
    const data = await res.json();
    return data.razorpay_key_id;
}

async function getAuthHeaders() {
    const headers = {'Content-Type': 'application/json'};
    const token = localStorage.getItem('accessToken');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

async function createOrder(amount) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/payments/create`, {
        method: 'POST',
        headers,
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
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/payments/verify`, {
        method: 'POST',
        headers,
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
    const genBtn = document.getElementById('ai-generate');
    const clearBtn = document.getElementById('ai-clear');
    const promptEl = document.getElementById('ai-prompt');
    const resultEl = document.getElementById('ai-result');

    function isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    }

    function logout() {
        localStorage.removeItem('accessToken');
        // Ensure UI updates (navbar reads localStorage on connect)
        window.location.href = 'index.html';
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
                    body: JSON.stringify({email, password})
                });
                const data = await res.json();
                if (!res.ok) { alert(data.error || 'Login failed'); return; }
                localStorage.setItem('accessToken', data.access_token);
                // reload to update navbar and state
                window.location.href = 'dashboard.html';
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
                    body: JSON.stringify({email, password})
                });
                const data = await res.json();
                if (!res.ok) { alert(data.error || 'Registration failed'); return; }
                localStorage.setItem('accessToken', data.access_token);
                window.location.href = 'dashboard.html';
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
        // Visually indicate that login is required when not authorized
        if (!isAuthenticated()) {
            buyBtn.classList.add('opacity-60', 'cursor-not-allowed');
            buyBtn.title = 'Please login to purchase';
        }

        buyBtn.addEventListener('click', async () => {
            console.log('Buy button clicked');
            if (!isAuthenticated()) {
                if (confirm('You must be logged in to purchase. Go to login page?')) {
                    window.location.href = 'login.html';
                }
                return;
            }
            const amount = Number(buyBtn.dataset.amount) || 99;
            try {
                const statusEl = document.getElementById('payment-status');
                if (statusEl) statusEl.textContent = 'Initiating payment...';
                console.log('Fetching razorpay key...');
                const key = await getRazorpayKey();
                if (!key) {
                    console.error('Razorpay key not configured on server');
                    if (statusEl) statusEl.textContent = 'Payment unavailable: server not configured';
                    alert('Payment not available: Razorpay public key not configured on the server.');
                    return;
                }

                console.log('Creating order on server...');
                if (statusEl) statusEl.textContent = 'Creating order...';
                let order;
                try {
                    order = await createOrder(amount);
                } catch (err) {
                    console.error('Order creation failed', err);
                    if (statusEl) statusEl.textContent = 'Order creation failed';
                    // If unauthorized (401), prompt to login
                    if (err.status === 401 || (err.message && err.message.toLowerCase().includes('authorization'))) {
                        if (confirm('You must be logged in to purchase. Go to login page?')) window.location.href = 'login.html';
                        return;
                    }
                    alert('Could not create order: ' + (err.message || err));
                    return;
                }

                console.log('Opening Razorpay checkout for order', order.id);
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