const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth header if token exists
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
};

// Helper to get fetch options
const getFetchOptions = (method, body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
};

export const api = {
  async get(endpoint) {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log(`Fetching: ${fullUrl}`);
      
      const response = await fetch(fullUrl, getFetchOptions('GET'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error [${response.status}]:`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`Fetch error on ${endpoint}:`, error);
      throw new Error(`Failed to fetch: ${error.message}`);
    }
  },

  async post(endpoint, data) {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(fullUrl, getFetchOptions('POST', data));
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`POST error on ${endpoint}:`, error);
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(fullUrl, getFetchOptions('PUT', data));
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`PUT error on ${endpoint}:`, error);
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(fullUrl, getFetchOptions('DELETE'));
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`DELETE error on ${endpoint}:`, error);
      throw error;
    }
  },
};
