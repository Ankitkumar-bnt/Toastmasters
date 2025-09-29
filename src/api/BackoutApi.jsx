import axios from "axios";

const PRIMARY_API_URL = "/api/backout";
const FALLBACK_API_URL = "/backout";

const withFallback = async (requestFn) => {
  try {
    return await requestFn(PRIMARY_API_URL);
  } catch (err) {
    // Retry with fallback base path if primary fails with 404 (dev server not restarted / proxy not applied)
    if (err?.response?.status === 404) {
      return await requestFn(FALLBACK_API_URL);
    }
    throw err;
  }
};

export const getAllBackouts = async () => {
  return await withFallback((base) => axios.get(`${base}/getAllBackouts`));
};

export const getBackoutsByUser = async (userId) => {
  return await withFallback((base) => axios.get(`${base}/getBackoutsByUser/${userId}`));
};

export const getBackoutsByMeeting = async (meetingId) => {
  // Note: ensure your backend mapping is /getBackoutsByMeeting/{meetingId}
  return await withFallback((base) => axios.get(`${base}/getBackoutsByMeeting/${meetingId}`));
};

export default {
  getAllBackouts,
  getBackoutsByUser,
  getBackoutsByMeeting,
};


