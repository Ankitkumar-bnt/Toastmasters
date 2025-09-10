import axios from 'axios';

const API_BASE_URL = '/api/meetings';

export const addMeeting = async (meetingData) => {
  return axios.post(`${API_BASE_URL}/addMeeting`, meetingData);
};

export const getAllMeetings = async (limit = null) => {
  const url = limit ? `${API_BASE_URL}/getAllMeetings?limit=${limit}` : `${API_BASE_URL}/getAllMeetings`;
  return axios.get(url);
};

export const getAllUpcomingMeetings = async () => {
  return axios.get(`${API_BASE_URL}/getAllMeetings?upcoming=true&limit=1000`);
};

export const getMeetingById = async (meetingId) => {
  return axios.get(`${API_BASE_URL}/getMeetingById/${meetingId}`);
};

export const updateMeeting = async (meetingId, meetingData) => {
  return axios.patch(`${API_BASE_URL}/updateMeeting/${meetingId}`, meetingData);
};

export const deleteMeeting = async (meetingId) => {
  return axios.delete(`${API_BASE_URL}/deleteMeeting/${meetingId}`);
};

export const getMeetingByTheme = async (meetingTheme) => {
  const encodedTheme = encodeURIComponent(meetingTheme);
  return axios.get(`${API_BASE_URL}/getMeetingByTheme/${encodedTheme}`);
};

export const setMemberAvailability = async (meetingId, memberId, availability) => {
  // Placeholder: adjust path/body when backend endpoint is provided
  return axios.post(`${API_BASE_URL}/${meetingId}/availability`, {
    memberId,
    availability
  });
};