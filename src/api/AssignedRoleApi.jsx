import axios from 'axios';

const BASE_URL = 'http://localhost:8888';

// Add member assigned roles
export const addMemberAssignedRole = async (userId, meetingId, assignedRoleList) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/addMemberAssignedRole/${userId}/${meetingId}`,
      assignedRoleList
    );
    return response.data;
  } catch (error) {
    console.error('Error adding assigned roles:', error);
    throw error;
  }
};

// Get member assigned roles
export const getMemberAssignedRole = async (userId, meetingId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/getMemberAssignedRole/${userId}/${meetingId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned roles:', error);
    throw error;
  }
};

// Delete member assigned roles
export const deleteMemberAssignedRole = async (userId, meetingId, deleteRoles) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/deleteAssignedRole/${userId}/${meetingId}`,
      { data: deleteRoles }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting assigned roles:', error);
    throw error;
  }
};
