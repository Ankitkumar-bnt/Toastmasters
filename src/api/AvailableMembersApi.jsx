import axios from 'axios';

const API_BASE_URL = 'http://localhost:8888/availableMembers';

export const markAvailability = async (availability, userId, meetingId) => {
	return axios.post(
		`${API_BASE_URL}/markAvailability/${availability}/${userId}/${meetingId}`
	);
};

export const getAllMemberAvailability = async () => {
	return axios.get(`${API_BASE_URL}/getAllMemberAvailability`);
};

export const getAvailabilityById = async (userId) => {
  return axios.get(`${API_BASE_URL}/getAvailabilityById/${userId}`);
};

export default {
	markAvailability,
	getAllMemberAvailability,
	getAvailabilityById,
};
