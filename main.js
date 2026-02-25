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

let googleTokenClient;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const loginForm = document.getElementById('loginForm');
    const facebookBtn = document.getElementById('facebookLogin');
    const githubBtn = document.getElementById('githubLogin');
    const customGoogleBtn = document.getElementById('customGoogleBtn');

    // Initialize Google Identity Services
    initializeGoogleLogin();

    // Event Listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleEmailLogin);
    }

    if (customGoogleBtn) {
        customGoogleBtn.addEventListener('click', handleGoogleLoginClick);
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => handlePlaceholderLogin('facebook'));
    }

    if (githubBtn) {
        githubBtn.addEventListener('click', () => handlePlaceholderLogin('github'));
    }
}

function initializeGoogleLogin() {
    console.log("Initializing Google Identity Services...");

    // Initialize the token client for manual triggering
    googleTokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        scope: 'openid profile email',
        callback: (tokenResponse) => {
            hideProcessing();
            handleGoogleResponse(tokenResponse);
        },
    });

    // Also initialize for ID token (GSI) if needed
    google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
    });
}

function handleGoogleLoginClick() {
    showProcessing();
    console.log("Requesting Google Access Token...");

    // Request access token (this triggers the popup)
    googleTokenClient.requestAccessToken();
}

function showProcessing() {
    const overlay = document.getElementById('processingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideProcessing() {
    const overlay = document.getElementById('processingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function handleGoogleResponse(response) {
    console.log("Google response received:");
    console.log(response);

    const responseContainer = document.getElementById('responseContainer');
    const responseText = document.getElementById('responseText');

    if (responseContainer && responseText) {
        responseContainer.classList.add('active');
        responseText.textContent = JSON.stringify(response, null, 2);

        // Scroll to response
        responseContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    alert(`Email login simulated for: ${email}`);
}

function handlePlaceholderLogin(provider) {
    console.log(`${provider} login placeholder`);
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login feature coming soon!`);
}