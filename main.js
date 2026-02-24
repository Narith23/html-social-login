document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const googleBtn = document.getElementById('googleLogin');
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
                google.accounts.id.renderButton(
                    container,
                    {
                        theme: "outline",
                        size: "large",
                        width: container.offsetWidth,
                        text: "continue_with",
                        shape: "rectangular"
                    }
                );
            }

            // Optional: Enable Google One Tap
            google.accounts.id.prompt();
        } else {
            // Retry if script not loaded yet
            setTimeout(initializeGoogleLogin, 100);
        }
    }

    initializeGoogleLogin();

    function handleCredentialResponse(response) {
        console.log("------------------------------------------");
        console.log("GOOGLE ID TOKEN RECEIVED:");
        console.log(response.credential);
        console.log("------------------------------------------");
        performSocialLogin('google', response.credential);
    }

    async function performSocialLogin(provider, idToken) {
        const deviceData = {
            deviceId: "device-uuid-123", // Ideally generated or fetched from storage
            deviceType: "WEB",
            deviceName: navigator.userAgent,
            latitude: 11.5564,
            longitude: 104.9282,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locationLabel: "Phnom Penh, Cambodia"
        };

        const payload = {
            provider: provider,
            idToken: idToken,
            device: deviceData
        };

        try {
            console.log(`Sending login request to ${API_URL}...`);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                },
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

    // Simulated successful UI update
    function onLoginSuccess(provider, data = {}) {
        const card = document.querySelector('.login-card');
        card.innerHTML = `
            <div class="text-center py-5">
                <div class="mb-4">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                </div>
                <h2 class="fw-bold mb-3">Welcome, ${data.name}!</h2>
                <p class="text-muted mb-4">You have successfully signed in via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.</p>
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted small">Session established. Redirecting...</p>
            </div>
        `;

        setTimeout(() => {
            alert(`Token received and processed for ${provider}. Backend call successful!`);
            // window.location.href = '/dashboard';
        }, 1500);
    }

    // Event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            onLoginSuccess('Email', { name: email.split('@')[0] });
        });
    }

    googleBtn.addEventListener('click', () => {
        // Trigger the Google Identity Services popup
        google.accounts.id.requestCode();
        // Note: For id_token auth, we use google.accounts.id.prompt() or the button render
        // rendered button is often better, but here we trigger the browser's native flow
        google.accounts.id.prompt();
    });

    facebookBtn.addEventListener('click', () => {
        console.log('Facebook Login not fully implemented in this demo.');
        onLoginSuccess('facebook', { name: 'Facebook User' });
    });

    githubBtn.addEventListener('click', () => {
        console.log('GitHub Login not fully implemented in this demo.');
        onLoginSuccess('github', { name: 'GitHub User' });
    });
});
