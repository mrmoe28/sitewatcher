// API Configuration
// Switch between local server and Vercel deployment

export const API_CONFIG = {
  // Use local server that bypasses Vercel issues
  BASE_URL: 'http://localhost:3001',
  
  // Alternative: Use Vercel deployment (currently has import issues)
  // BASE_URL: '/api/analyzer',
  
  // For ngrok (requires setup): https://your-ngrok-url.ngrok-free.app
  // BASE_URL: 'https://abc123.ngrok-free.app',
};

export const getApiUrl = (endpoint: string) => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // If using localhost, add /api prefix
  if (API_CONFIG.BASE_URL.includes('localhost')) {
    return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
  }
  
  // For Vercel or ngrok, use as-is
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};