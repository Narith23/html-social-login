const CONFIG = {
    GOOGLE_CLIENT_ID: '271243758363-mke96cblrv8j8nm76ivf105uunkk57v3.apps.googleusercontent.com',
    API_URL: 'http://127.0.0.1:8080/api/v1/cam/auth/social-login',
    DEVICE_DATA: {
        deviceId: "device-uuid-123",
        deviceType: "WEB",
        deviceName: navigator.userAgent,
        latitude: 11.5564,
        longitude: 104.9282,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locationLabel: "Phnom Penh, Cambodia"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const loginForm = document.getElementById('loginForm');
    const facebookBtn = document.getElementById('facebookLogin');
    const githubBtn = document.getElementById('githubLogin');

    // Initialize Google Identity Services
    initializeGoogleLogin();

    // Event Listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleEmailLogin);
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => handlePlaceholderLogin('facebook'));
    }

    if (githubBtn) {
        githubBtn.addEventListener('click', () => handlePlaceholderLogin('github'));
    }
}

function initializeGoogleLogin() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: CONFIG.GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse
        });

        renderGoogleButton();
        google.accounts.id.prompt(); // One Tap
    } else {
        setTimeout(initializeGoogleLogin, 100);
    }
}

function renderGoogleButton() {
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
}

function handleGoogleResponse(response) {
    console.log("GSI ID Token received");
    displayTokenResponse(response.credential);
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("JWT Parsing failed:", e);
        return null;
    }
}

function displayTokenResponse(idToken) {
    const card = document.querySelector('.login-card');
    const decoded = parseJwt(idToken);

    card.innerHTML = `
        <div class="text-center mb-4 fade-in">
            <div class="mb-3">
                <i class="bi bi-shield-check text-success" style="font-size: 3rem;"></i>
            </div>
            <h3 class="fw-bold mb-1">Google Token Received</h3>
            <p class="text-muted small">The token was not sent to the API.</p>
        </div>

        <div class="decoded-info mb-4">
            <h6 class="fw-bold text-uppercase small text-muted mb-3">User Profile (Decoded)</h6>
            <div class="d-flex align-items-center p-3 bg-light rounded-3 mb-3 border">
                ${decoded?.picture ? `<img src="${decoded.picture}" class="rounded-circle me-3" width="48" height="48" alt="Profile">` : '<i class="bi bi-person-circle me-3" style="font-size: 2.5rem;"></i>'}
                <div class="text-start">
                    <div class="fw-600">${decoded?.name || 'Unknown Name'}</div>
                    <div class="text-muted small">${decoded?.email || 'No email provided'}</div>
                </div>
            </div>
        </div>

        <div class="token-well mb-4">
            <h6 class="fw-bold text-uppercase small text-muted mb-2">Raw ID Token</h6>
            <div class="token-container p-3 rounded-3 border bg-dark text-white position-relative">
                <code class="small text-break">${idToken}</code>
                <button class="btn btn-sm btn-outline-light position-absolute top-0 end-0 m-2" onclick="copyToClipboard('${idToken}')">
                    <i class="bi bi-copy"></i>
                </button>
            </div>
        </div>

        <div class="d-grid">
            <button class="btn btn-primary" onclick="location.reload()">Back to Login</button>
        </div>
    `;
}

window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Token copied to clipboard!');
    });
};

async function performSocialLogin(provider, idToken) {
    const payload = {
        provider,
        idToken,
        device: CONFIG.DEVICE_DATA
    };

    showLoadingState();

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const data = await response.json();
        onLoginSuccess(provider, data.user?.name || 'User');

    } catch (error) {
        console.error('Social login failed:', error);
        resetUIWithError(error.message);
    }
}

function handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    onLoginSuccess('Email', email.split('@')[0]);
}

function handlePlaceholderLogin(provider) {
    console.log(`${provider} login placeholder`);
    onLoginSuccess(provider, `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`);
}

function showLoadingState() {
    const card = document.querySelector('.login-card');
    card.classList.add('loading');
}

function onLoginSuccess(provider, userName) {
    const card = document.querySelector('.login-card');
    card.innerHTML = `
        <div class="text-center py-5 fade-in">
            <div class="mb-4">
                <i class="bi bi-check-circle-fill text-success bounce" style="font-size: 4rem;"></i>
            </div>
            <h2 class="fw-bold mb-3">Welcome, ${userName}!</h2>
            <p class="text-muted mb-4">Signed in via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.</p>
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted small">Redirecting...</p>
        </div>
    `;

    setTimeout(() => {
        // window.location.href = '/dashboard';
        console.log("Success redirect simulated");
    }, 2000);
}

function resetUIWithError(message) {
    const card = document.querySelector('.login-card');
    card.classList.remove('loading');
    alert(`Login Failed: ${message}\n\nPlease check if your backend server is running and your Google Client ID is configured correctly.`);
}