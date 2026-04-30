import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

/**
 * Setup CSRF token for axios requests
 * Priority: meta tag > cookie > global
 */
function setupCsrfToken() {
    // First, try to get token from meta tag
    let token = document.head.querySelector('meta[name="csrf-token"]');
    
    if (token && token.content) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        window.axios.defaults.headers.common['X-XSRF-TOKEN'] = token.content;
        window.csrf_token = token.content;
        console.log('[CSRF] Token loaded from meta tag:', token.content.substring(0, 20) + '...');
        return;
    }
    
    // Fallback to XSRF token from cookie
    const cookies = document.cookie.split(';');
    const xsrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    if (xsrfCookie) {
        const cookieToken = decodeURIComponent(xsrfCookie.split('=')[1]);
        window.axios.defaults.headers.common['X-XSRF-TOKEN'] = cookieToken;
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = cookieToken;
        window.csrf_token = cookieToken;
        console.log('[CSRF] Token loaded from cookie:', cookieToken.substring(0, 20) + '...');
        return;
    }
    
    // Last resort: try to find in window or global scope
    if (window.csrf_token) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = window.csrf_token;
        window.axios.defaults.headers.common['X-XSRF-TOKEN'] = window.csrf_token;
        console.log('[CSRF] Token already set in window');
    } else {
        console.warn('[CSRF] No CSRF token found!');
    }
}

// Setup CSRF token immediately
setupCsrfToken();

// Also setup a function to update token dynamically if needed
window.setupCsrfToken = setupCsrfToken;

// For Inertia: setup CSRF token in headers for form submissions
// This ensures Inertia Link component with method="post" includes CSRF token
if (typeof document !== 'undefined') {
    // Listen for beforeunload to ensure token stays fresh
    window.addEventListener('beforeunload', setupCsrfToken);
    console.log('[Bootstrap] CSRF setup completed');
}
