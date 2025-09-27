import axios from 'axios';

const API_BASE_URL = '/api/availableMembers';

export const markAvailability = async (availability, userId, meetingId) => {
  const a = Number(availability);
  const u = Number(userId);
  const m = Number(meetingId);
  return axios.post(
    `${API_BASE_URL}/markAvailability/${a}/${u}/${m}`,
    null,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );
};

export const getAllMemberAvailability = async () => {
	return axios.get(`${API_BASE_URL}/getAllMemberAvailability`);
};

/**
 * Get all availability records for a specific user
 * @param {number} userId - The ID of the user
 * @returns {Promise} Axios response with the user's availability records
 */
export const getAvailabilityById = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getAvailabilityById/${userId}`);
    console.log('getAvailabilityById response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getAvailabilityById:', error);
    throw error;
  }
};

export const getAllMemberAvailabilityByMeetingId = async (meetingId) => {
  return axios.get(`${API_BASE_URL}/getAllMemberAvailabilityByMeetingId/${meetingId}`);
};

export default {
	markAvailability,
	getAllMemberAvailability,
	getAvailabilityById,
	getAllMemberAvailabilityByMeetingId,
};
