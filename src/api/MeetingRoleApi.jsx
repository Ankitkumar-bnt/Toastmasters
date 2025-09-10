import axios from 'axios';

// Controller has no class-level @RequestMapping, so endpoints are at API root
const BASE_URL = '/api';

export const addMeetingRoles = async (meetingId, rolesMap) => {
  // rolesMap should be an object map of { [roleName:string]: number }
  return axios.post(`${BASE_URL}/addMeetingRoles/${meetingId}`, rolesMap);
};

export const getAllMeetingRole = async () => {
  return axios.get(`${BASE_URL}/getAllMeetingRole`);
};

export const getAllMeetingRoleByMeetingId = async (meetingId) => {
  return axios.get(`${BASE_URL}/getAllMeetingRoleByMeetingId/${meetingId}`);
};

export const getAllMeetingRoleByMeetingTheme = async (meetingTheme) => {
  return axios.get(`${BASE_URL}/getAllMeetingRoleByMeetingTheme/${meetingTheme}`);
};

export const getAllMeetingRoleCombineByMeeting = async (meetingId) => {
  return axios.get(`${BASE_URL}/getAllMeetingRoleCombineByMeeting/${meetingId}`);
};

export const getLast3MeetingRoles = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/getLast3MeetingRoles/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error in getLast3MeetingRoles:', error);
    throw error;
  }
};
