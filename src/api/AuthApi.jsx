import axios from 'axios';

const AUTH_BASE_URL = '/api/loginUser';

export const login = async (email, password) => {
  const url = `${AUTH_BASE_URL}/login`;
  const form = new URLSearchParams();
  form.append('userEmail', email);
  form.append('password', password);
  try {
    const res = await axios.post(url, form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res;
  } catch (err) {
    console.error('Login API error:', err?.response || err);
    throw err;
  }
};

export const logout = async (userRequestDTO, userId) => {
  try {
    // Call the logout API
    const url = `${AUTH_BASE_URL}/logout/${userId}`;
    console.log('Calling logout API:', url, 'with data:', userRequestDTO);
    
    const response = await axios.post(url, userRequestDTO);
    console.log('Logout API response:', response);
    
    // Clear local storage after successful logout
    localStorage.removeItem('tm_current_user');
  } catch (error) {
    console.error('Logout API error:', error);
    console.error('Error response:', error.response);
    
    // Even if API call fails, clear local storage to ensure user is logged out
    localStorage.removeItem('tm_current_user');
    throw error;
  }
};


