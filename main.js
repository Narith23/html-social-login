document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const facebookBtn = document.getElementById('facebookLogin');
    const githubBtn = document.getElementById('githubLogin');

    const GOOGLE_CLIENT_ID = '271243758363-mke96cblrv8j8nm76ivf105uunkk57v3.apps.googleusercontent.com';
    const API_URL = 'http://127.0.0.1:8080/api/v1/cam/auth/social-login';

    // Initialize Google Identity Services
    function initializeGoogleLogin() {
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse
            });

            // Render the official Google button
            const container = document.getElementById('googleBtnContainer');
            if (container) {
                google.accounts.id.renderButton(container, {
                    theme: "outline",
                    size: "large",
                    width: container.offsetWidth,
                    text: "continue_with",
                    shape: "rectangular"
                });
            }

            // Optional: Enable One Tap
            google.accounts.id.prompt();
        } else {
            // Retry if script not loaded yet
            setTimeout(initializeGoogleLogin, 100);
        }
    }

    initializeGoogleLogin();

    // Handle Google login response
    function handleCredentialResponse(response) {
        console.log("GOOGLE ID TOKEN RECEIVED:", response.credential);
        performSocialLogin('google', response.credential);
    }

    // Send token to backend
    async function performSocialLogin(provider, idToken) {
        const deviceData = {
            deviceId: "device-uuid-123",
            deviceType: "WEB",
            deviceName: navigator.userAgent,
            latitude: 11.5564,
            longitude: 104.9282,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locationLabel: "Phnom Penh, Cambodia"
        };

        const payload = { provider, idToken, device: deviceData };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Login successful:', data);
            onLoginSuccess(provider, { name: data.user?.name || 'User' });

        } catch (error) {
            console.error('Login failed:', error);
            alert(`Login failed: ${error.message}. Make sure your backend at ${API_URL} is running.`);
        }
    }

    // Update UI on successful login
    function onLoginSuccess(provider, data = {}) {
        const card = document.querySelector('.login-card');
        card.innerHTML = `
            <div class="text-center py-5">
                <div class="mb-4">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                </div>
                <h2 class="fw-bold mb-3">Welcome, ${data.name}!</h2>
                <p class="text-muted mb-4">Signed in via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.</p>
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted small">Redirecting...</p>
            </div>
        `;

        setTimeout(() => {
            alert(`Token received and processed for ${provider}.`);
            // window.location.href = '/dashboard';
        }, 1500);
    }

    // Email login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            onLoginSuccess('Email', { name: email.split('@')[0] });
        });
    }

    // Facebook / GitHub placeholders
    facebookBtn.addEventListener('click', () => {
        console.log('Facebook Login not implemented.');
        onLoginSuccess('facebook', { name: 'Facebook User' });
    });

    githubBtn.addEventListener('click', () => {
        console.log('GitHub Login not implemented.');
        onLoginSuccess('github', { name: 'GitHub User' });
    });
});