const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT = 10000;

const parseError = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (payload.errors?.length) {
    return payload.errors.map((error) => error.msg).join(', ');
  }
  return payload.message || 'Request failed. Please try again.';
};

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem('staysimple_token');
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
};

export const authApi = {
  login: (body) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  register: (body) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  me: () => apiRequest('/auth/me'),
};

export const listingsApi = {
  search: ({ city, minPrice, maxPrice } = {}) => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    const query = params.toString();
    return apiRequest(`/listings${query ? `?${query}` : ''}`);
  },
  get: (id) => apiRequest(`/listings/${id}`),
  create: (body) =>
    apiRequest('/listings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const bookingsApi = {
  create: (body) =>
    apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  user: () => apiRequest('/bookings/user'),
  host: () => apiRequest('/bookings/host'),
  update: (id, status) =>
    apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

export const usersApi = {
  all: () => apiRequest('/users'),
};
