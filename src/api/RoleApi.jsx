import axios from 'axios';

const BASE_URL = '/api/roles';

// Add a new role
export const addRole = async (roleData) => {
  try {
    const response = await axios.post(`${BASE_URL}/addRole`, roleData);
    return response.data;
  } catch (error) {
    console.error('Error adding role:', error);
    throw error;
  }
};

// Get all roles
export const getAllRoles = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/getAllRoles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all roles:', error);
    throw error;
  }
};

// Get role by ID
export const getRoleById = async (roleId) => {
  try {
    const response = await axios.get(`${BASE_URL}/getRole/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching role by ID:', error);
    throw error;
  }
};

// Update role
export const updateRole = async (roleId, roleData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/updateRole/${roleId}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

// Delete role
export const deleteRole = async (roleId) => {
  try {
    console.log('Attempting to delete role with ID:', roleId);
    const response = await axios.delete(`${BASE_URL}/deleteRole/${roleId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Delete role response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting role:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    throw error;
  }
};
