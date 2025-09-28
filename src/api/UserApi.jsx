import axios from "axios";

const API_URL = "/api/user";

export const getAllMembers = async () => {
  return await axios.get(`${API_URL}/getAllMembers`);
};

export const addMember = async (user) => {
  return await axios.post(`${API_URL}/addMember`, user);
};

export const updateMember = async (updatedData) => {
  return await axios.patch(`${API_URL}/updateMember/${updatedData.userId}`, updatedData);
};

export const deleteUserById = async (userId) => {
  return await axios.delete(`${API_URL}/deleteMember/${userId}`);
};

export const getUserById = async (userId) => {
  return await axios.get(`${API_URL}/getUserById/${userId}`);
};

export const getAllGuest = async () => {
  return await axios.get(`${API_URL}/getAllGuest`);
};

export const addAvailabilityOfGuest = async (userId, meetingId) => {
  return await axios.post(`${API_URL}/addAvailabilityOfGuest/${userId}/${meetingId}`);
};