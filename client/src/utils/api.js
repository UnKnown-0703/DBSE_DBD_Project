// Centralized API Base URL configuration
export const getApiBaseUrl = () => {
  // 1. User manual override via localStorage (allows instant testing or custom tunnel URL)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('erp_backend_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  }

  // 2. Vite environment variable (set during deployment or in .env)
  if (import.meta.env && import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
  }

  // 3. Fallback: if running in local browser, use local 5000
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://127.0.0.1:5000';
  }

  // 4. Default fallback
  return 'http://127.0.0.1:5000';
};

export const API_BASE_URL = getApiBaseUrl();

export const setApiBaseUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('erp_backend_url', url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem('erp_backend_url');
    }
    window.location.reload();
  }
};
