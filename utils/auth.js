// utils/auth.js

// Check if user is logged in
export function isLoggedIn() {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        console.log('Token from localStorage:', token); // Add this log
        return !!token;
    }
    return false;
}

// Get user data
export function getUserData() {
    if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('userData');
        console.log('User data from localStorage:', userData); // Add this log
        return userData ? JSON.parse(userData) : null;
    }
    return null;
}

// Get auth token for API calls
export function getToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken');
    }
    return null;
}

// Check authentication by verifying token with server
export async function checkAuth() {
    try {
        const token = getToken();
        console.log('Checking auth with token:', token); // Add this log
        
        if (!token) {
            console.log('No token found');
            return false;
        }

        const response = await fetch('/api/auth/check', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Auth check response status:', response.status); // Add this log
        
        const data = await response.json();
        console.log('Auth check response data:', data); // Add this log
        
        return data.valid;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}