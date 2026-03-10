const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  async get(endpoint) {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log(`Fetching: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error [${response.status}]:`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
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
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
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
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
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
      const response = await fetch(fullUrl, {
        method: 'DELETE',
      });
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
