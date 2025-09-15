import axios from 'axios';

const BASE_URL = 'http://localhost:8888/meetingAwards';

// Get Gem of Month data
export const getGemOfMonth = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/gemOfTheMonth`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gem of month data:', error);
    throw error;
  }
};
