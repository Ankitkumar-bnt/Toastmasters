import axios from 'axios';

const BASE_URL = '/api/meetingAwards';

// New API per backend changes
// GET: /gemsOfTheLastMonth -> List<GemOfMonthDTO>
export const gemsOfTheLastMonth = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/gemsOfTheLastMonth`);
    return response?.data?.data || [];
  } catch (error) {
    console.error('Error fetching gems of the last month:', error);
    throw error;
  }
};

// GET: /getAllGemOfMonth -> List<GemOfMonthDTO>
export const getAllGemOfMonth = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/getAllGemOfMonth`);
    return response?.data?.data || [];
  } catch (error) {
    console.error('Error fetching all Gem of Month:', error);
    throw error;
  }
};

// GET: /listAllLastMonthMembersWithCount -> List<GemOfMonthDTO> (candidates with dayCount)
export const listAllLastMonthMembersWithCount = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/listAllLastMonthMembersWithCount`);
    return response?.data?.data || [];
  } catch (error) {
    console.error('Error fetching last month members with count:', error);
    throw error;
  }
};

// POST: /selectGemOfMonth -> GemOfMonthDTO (creates or replaces last month's winner)
// body: { month: LocalDate (yyyy-MM-dd), userId: number, userName: string, dayCount: number }
export const selectGemOfMonth = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/selectGemOfMonth`, payload);
    return response?.data?.data;
  } catch (error) {
    console.error('Error selecting gem of month:', error);
    throw error;
  }
};
