import axios from 'axios';

const BASE_URL = '/api/agenda';

// DTO shape assumption based on backend: {
//   word: string,
//   meaning: string,
//   example: string,
//   wordType: 'WOD' | 'POD',
//   userId: number,
//   meetingId: number
// }
export const addWordsForMeeting = async (dto) => {
  const response = await axios.post(`${BASE_URL}/addWordsForMeeting`, dto, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const getAllWordsData = async () => {
  const response = await axios.get(`${BASE_URL}/getAllWordsData`);
  return response.data;
};

export const getWordsDataByMeeting = async (meetingId) => {
  const response = await axios.get(`${BASE_URL}/getWordsDataByMeeting/${meetingId}`);
  return response.data;
};

export const updateWordsDataByMeeting = async (meetingId, wordType, dto) => {
  const response = await axios.put(`${BASE_URL}/updateWordsDataByMeeting/${meetingId}/${wordType}`, dto, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const deleteWordsDataByMeeting = async (meetingId) => {
  const response = await axios.delete(`${BASE_URL}/deleteWordsDataByMeeting/${meetingId}`);
  return response.data;
};
