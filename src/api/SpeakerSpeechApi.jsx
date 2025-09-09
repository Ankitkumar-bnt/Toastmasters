import axios from 'axios';

const BASE_URL = 'http://localhost:8888/agenda';

// DTO shape assumption based on backend: {
//   pathwaysTrack: string,
//   level: number,
//   projectNo: number,
//   maxSpeechTime: number,
//   minSpeechTime: number,
//   title: string,
//   objective: string,
//   userId: number,
//   meetingId: number
// }
export const addSpeakerSpeech = async (dto) => {
  const response = await axios.post(`${BASE_URL}/addSpeakerSpeech`, dto, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const getAllSpeakerSpeech = async () => {
  const response = await axios.get(`${BASE_URL}/getAllSpeakerSpeech`);
  return response.data;
};

export const getSpeakerSpeechByMeeting = async (meetingId) => {
  try {
    const response = await axios.get(`${BASE_URL}/getSpeakerSpeechByMeeting/${meetingId}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      // Normalize to empty list for callers that expect arrays
      return [];
    }
    throw error;
  }
};

export const updateSpeakerSpeechByMeeting = async (meetingId, dto) => {
  const response = await axios.put(`${BASE_URL}/updateSpeakerSpeechByMeeting/${meetingId}`, dto, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const deleteSpeakerSpeechByMeeting = async (meetingId) => {
  const response = await axios.delete(`${BASE_URL}/deleteSpeakerSpeechByMeeting/${meetingId}`);
  return response.data;
};
