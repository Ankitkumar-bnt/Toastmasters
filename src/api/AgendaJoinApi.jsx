import axios from 'axios';

const API_BASE_URL = 'http://localhost:8888/agenda';

/**
 * Get agenda data including all related information for a specific meeting
 * @param {number} meetingId - The ID of the meeting
 * @returns {Promise} - Promise containing AgendaJoinDTO with all agenda related data
 */
export const getAgenda = async (meetingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getAgenda/${meetingId}`);
    return response;
  } catch (error) {
    console.error('Get Agenda API error:', error?.response || error);
    throw error;
  }
};
