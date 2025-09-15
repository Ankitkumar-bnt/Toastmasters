import axios from 'axios';

const BASE_URL = 'http://localhost:8888';

// Add a meeting winner
export const addMeetingWinner = async (winnerData) => {
  try {
    const response = await axios.post(`${BASE_URL}/meetingWinner/addMeetingWinner`, winnerData);
    return response.data;
  } catch (error) {
    console.error('Error adding meeting winner:', error);
    throw error;
  }
};

// Get all meeting winners by meeting ID
export const getMeetingWinnersByMeeting = async (meetingId) => {
  try {
    const response = await axios.get(`${BASE_URL}/meetingWinner/getAllMeetingWinnerByMeeting/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meeting winners:', error);
    throw error;
  }
};

// Update a meeting winner
export const updateMeetingWinner = async (userId, meetingId, winnerData) => {
  try {
    const response = await axios.put(`${BASE_URL}/meetingWinner/updateMeetingWinnerByUserAndMeeting/${userId}/${meetingId}`, winnerData);
    return response.data;
  } catch (error) {
    console.error('Error updating meeting winner:', error);
    throw error;
  }
};

// Delete a meeting winner
export const deleteMeetingWinner = async (userId, meetingId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/meetingWinner/deleteMeetingWinnerByUserAndMeeting/${userId}/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting meeting winner:', error);
    throw error;
  }
};

// Get all meeting winners
export const getAllMeetingWinners = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/meetingWinner/getAllMeetingWinner`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all meeting winners:', error);
    throw error;
  }
};

// Get all meeting winners by user ID
export const getMeetingWinnersByUser = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/meetingWinner/getAllMeetingWinnerByUser/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meeting winners by user:', error);
    throw error;
  }
};
