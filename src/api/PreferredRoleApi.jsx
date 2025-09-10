import axios from 'axios';

const BASE_URL = '/api';

// Add member preferred roles
export const addMemberPreferredRole = async (userId, meetingId, preferredRoleList) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/addMemberPreferredRole/${userId}/${meetingId}`,
      preferredRoleList
    );
    return response.data;
  } catch (error) {
    console.error('Error adding preferred roles:', error);
    throw error;
  }
};

// Get member preferred roles
export const getMemberPreferredRoles = async (userId, meetingId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/getMemberPreferredRoles/${userId}/${meetingId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching preferred roles:', error);
    throw error;
  }
};

// Delete member preferred roles
export const deleteMemberPreferredRole = async (userId, meetingId, deleteRoles) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/deletePreferredRole/${userId}/${meetingId}`,
      { data: deleteRoles }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting preferred roles:', error);
    throw error;
  }
};
