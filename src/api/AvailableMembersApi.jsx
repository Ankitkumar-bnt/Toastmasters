import axios from 'axios';

const API_BASE_URL = '/api/availableMembers';

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

export const getAllMemberAvailabilityByMeetingId = async (meetingId) => {
  return axios.get(`${API_BASE_URL}/getAllMemberAvailabilityByMeetingId/${meetingId}`);
};

export default {
	markAvailability,
	getAllMemberAvailability,
	getAvailabilityById,
	getAllMemberAvailabilityByMeetingId,
};
