import axios from 'axios';

const BASE_URL = '/api/meetingAwards';

// Get Gem of Month data (returns an array of GemOfMonthDTO)
export const getGemOfMonth = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/gemOfTheMonth`);
    // Spring ResponseMessage wraps data under .data
    return response?.data?.data || [];
  } catch (error) {
    console.error('Error fetching gem of month data:', error);
    throw error;
  }
};
