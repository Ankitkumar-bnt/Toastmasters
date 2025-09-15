import axios from 'axios';

const API_BASE_URL = '/api/agenda';

/**
 * ===============================
 * AgendaController APIs
 * ===============================
 */
export const addAgendaRows = async (agendaRows) => {
  try {
    return await axios.post(`${API_BASE_URL}/addAgendaRows`, agendaRows);
  } catch (error) {
    console.error('Add Agenda Rows API error:', error?.response || error);
    throw error;
  }
};

export const getAllAgendaRows = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/getAllAgendaRows`);
  } catch (error) {
    console.error('Get All Agenda Rows API error:', error?.response || error);
    throw error;
  }
};

export const getAgendaRowsByMeeting = async (meetingId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getAgendaRowsByMeeting/${meetingId}`);
  } catch (error) {
    console.error('Get Agenda Rows By Meeting API error:', error?.response || error);
    throw error;
  }
};

export const getAgenda = async (meetingId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getAgenda/${meetingId}`);
  } catch (error) {
    console.error('Get Agenda API error:', error?.response || error);
    throw error;
  }
};

export const getAgendaRow = async (agendaId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getAgendaRow/${agendaId}`);
  } catch (error) {
    console.error('Get Agenda Row API error:', error?.response || error);
    throw error;
  }
};

export const updateAgendaRow = async (agendaId, agendaRow) => {
  try {
    return await axios.put(`${API_BASE_URL}/updateAgendaRow/${agendaId}`, agendaRow);
  } catch (error) {
    console.error('Update Agenda Row API error:', error?.response || error);
    throw error;
  }
};

export const deleteAgendaRow = async (agendaId) => {
  try {
    return await axios.delete(`${API_BASE_URL}/deleteAgendaRow/${agendaId}`);
  } catch (error) {
    console.error('Delete Agenda Row API error:', error?.response || error);
    throw error;
  }
};

/**
 * ===============================
 * AbbreviationController APIs
 * ===============================
 */
export const addAbbreviation = async (data) => {
  try {
    return await axios.post(`${API_BASE_URL}/addAbbreviation`, data);
  } catch (error) {
    console.error('Add Abbreviation API error:', error?.response || error);
    throw error;
  }
};

export const getAllAbbreviations = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/getAllAbbreviations`);
  } catch (error) {
    console.error('Get All Abbreviations API error:', error?.response || error);
    throw error;
  }
};

export const getAbbreviationsByName = async (abbreviation) => {
  try {
    return await axios.get(`${API_BASE_URL}/getAbbreviationsByName/${abbreviation}`);
  } catch (error) {
    console.error('Get Abbreviation By Name API error:', error?.response || error);
    throw error;
  }
};

export const getAbbreviationsById = async (abbreviationId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getAbbreviationsById/${abbreviationId}`);
  } catch (error) {
    console.error('Get Abbreviation By Id API error:', error?.response || error);
    throw error;
  }
};

export const updateAbbreviationsById = async (abbreviationId, data) => {
  try {
    return await axios.put(`${API_BASE_URL}/updateAbbreviationsById/${abbreviationId}`, data);
  } catch (error) {
    console.error('Update Abbreviation By Id API error:', error?.response || error);
    throw error;
  }
};

export const deleteAbbreviationsById = async (abbreviationId) => {
  try {
    return await axios.delete(`${API_BASE_URL}/deleteAbbreviationsById/${abbreviationId}`);
  } catch (error) {
    console.error('Delete Abbreviation By Id API error:', error?.response || error);
    throw error;
  }
};

/**
 * ===============================
 * AgendaStaticInfoController APIs
 * ===============================
 */
export const addStaticInfo = async (data) => {
  try {
    return await axios.post(`${API_BASE_URL}/addStaticInfo`, data);
  } catch (error) {
    console.error('Add Static Info API error:', error?.response || error);
    throw error;
  }
};

export const getAllStaticInfo = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/getAllStaticInfo`);
  } catch (error) {
    console.error('Get All Static Info API error:', error?.response || error);
    throw error;
  }
};

export const getAllStaticInfoByInfoKeyOrInfoValue = async (keyOrValue) => {
  try {
    return await axios.get(`${API_BASE_URL}/getAllStaticInfoByInfoKeyOrInfoValue/${keyOrValue}`);
  } catch (error) {
    console.error('Get Static Info By Key/Value API error:', error?.response || error);
    throw error;
  }
};

export const getStaticInfoById = async (staticInfoId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getStaticInfoById/${staticInfoId}`);
  } catch (error) {
    console.error('Get Static Info By Id API error:', error?.response || error);
    throw error;
  }
};

export const updateStaticInfoById = async (staticInfoId, data) => {
  try {
    return await axios.put(`${API_BASE_URL}/updateStaticInfoById/${staticInfoId}`, data);
  } catch (error) {
    console.error('Update Static Info By Id API error:', error?.response || error);
    throw error;
  }
};

export const deleteStaticInfoById = async (staticInfoId) => {
  try {
    return await axios.delete(`${API_BASE_URL}/deleteStaticInfoById/${staticInfoId}`);
  } catch (error) {
    console.error('Delete Static Info By Id API error:', error?.response || error);
    throw error;
  }
};

/**
 * ===============================
 * ClubOfficerController APIs
 * ===============================
 */
export const addClubOfficer = async (data) => {
  try {
    return await axios.post(`${API_BASE_URL}/addClubOfficer`, data);
  } catch (error) {
    console.error('Add Club Officer API error:', error?.response || error);
    throw error;
  }
};

export const getAllClubOfficer = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/getAllClubOfficer`);
  } catch (error) {
    console.error('Get All Club Officer API error:', error?.response || error);
    throw error;
  }
};

export const getClubOfficerById = async (officerId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getClubOfficerById/${officerId}`);
  } catch (error) {
    console.error('Get Club Officer By Id API error:', error?.response || error);
    throw error;
  }
};

export const updateClubOfficerById = async (officerId, data) => {
  try {
    return await axios.put(`${API_BASE_URL}/updateClubOfficerById/${officerId}`, data);
  } catch (error) {
    console.error('Update Club Officer By Id API error:', error?.response || error);
    throw error;
  }
};

export const deleteClubOfficerById = async (officerId) => {
  try {
    return await axios.delete(`${API_BASE_URL}/deleteClubOfficerById/${officerId}`);
  } catch (error) {
    console.error('Delete Club Officer By Id API error:', error?.response || error);
    throw error;
  }
};

/**
 * ===============================
 * GrammarianController APIs
 * ===============================
 */
export const addWordsForMeeting = async (data) => {
  try {
    return await axios.post(`${API_BASE_URL}/addWordsForMeeting`, data);
  } catch (error) {
    console.error('Add Words For Meeting API error:', error?.response || error);
    throw error;
  }
};

export const getAllWordsData = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/getAllWordsData`);
  } catch (error) {
    console.error('Get All Words Data API error:', error?.response || error);
    throw error;
  }
};

export const getWordsDataByUserAndMeeting = async (userId, meetingId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getWordsDataByUserAndMeeting/${userId}/${meetingId}`);
  } catch (error) {
    console.error('Get Words Data By User & Meeting API error:', error?.response || error);
    throw error;
  }
};

export const updateWordsDataByUserAndMeeting = async (userId, meetingId, data) => {
  try {
    return await axios.put(`${API_BASE_URL}/updateWordsDataByMeeting/${meetingId}/${data.wordType}`, data);
  } catch (error) {
    console.error('Update Words Data By Meeting API error:', error?.response || error);
    throw error;
  }
};

export const deleteWordsDataByUserAndMeeting = async (userId, meetingId) => {
  try {
    return await axios.delete(`${API_BASE_URL}/deleteWordsDataByMeeting/${meetingId}`);
  } catch (error) {
    console.error('Delete Words Data By Meeting API error:', error?.response || error);
    throw error;
  }
};

export const getWordsDataByMeeting = async (meetingId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getWordsDataByMeeting/${meetingId}`);
  } catch (error) {
    console.error('Get Words Data By Meeting API error:', error?.response || error);
    throw error;
  }
};

export const getWordsDataByUser = async (userId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getWordsDataByUser/${userId}`);
  } catch (error) {
    console.error('Get Words Data By User API error:', error?.response || error);
    throw error;
  }
};

/**
 * ===============================
 * SpeakerSpeechController APIs
 * ===============================
 */
export const addSpeakerSpeech = async (data) => {
  try {
    return await axios.post(`${API_BASE_URL}/addSpeakerSpeech`, data);
  } catch (error) {
    console.error('Add Speaker Speech API error:', error?.response || error);
    throw error;
  }
};

export const getAllSpeakerSpeech = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/getAllSpeakerSpeech`);
  } catch (error) {
    console.error('Get All Speaker Speech API error:', error?.response || error);
    throw error;
  }
};

export const getSpeakerSpeechByUserAndMeeting = async (userId, meetingId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getSpeakerSpeechByUserAndMeeting/${userId}/${meetingId}`);
  } catch (error) {
    console.error('Get Speaker Speech By User & Meeting API error:', error?.response || error);
    throw error;
  }
};

export const getSpeakerSpeechesByMeeting = async (meetingId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getSpeakerSpeechesByMeeting/${meetingId}`);
  } catch (error) {
    // Treat 404 as "no data" rather than an exception to reduce console noise
    if (error?.response?.status === 404) {
      // Return a minimal axios-like shape that callers already handle
      return { data: [] };
    }
    console.warn('Get Speaker Speeches By Meeting API error:', error?.response || error);
    throw error;
  }
};

export const getSpeakerSpeechesByUser = async (userId) => {
  try {
    return await axios.get(`${API_BASE_URL}/getSpeakerSpeechesByUser/${userId}`);
  } catch (error) {
    console.error('Get Speaker Speeches By User API error:', error?.response || error);
    throw error;
  }
};

export const updateSpeakerSpeechByUserAndMeeting = async (userId, meetingId, data) => {
  try {
    return await axios.put(`${API_BASE_URL}/updateSpeakerSpeechByUserAndMeeting/${userId}/${meetingId}`, data);
  } catch (error) {
    console.error('Update Speaker Speech By User & Meeting API error:', error?.response || error);
    throw error;
  }
};

export const deleteSpeakerSpeechByUserAndMeeting = async (userId, meetingId) => {
  try {
    return await axios.delete(`${API_BASE_URL}/deleteSpeakerSpeechByUserAndMeeting/${userId}/${meetingId}`);
  } catch (error) {
    console.error('Delete Speaker Speech By User & Meeting API error:', error?.response || error);
    throw error;
  }
};

/**
 * ===============================
 * Copy Agenda APIs
 * ===============================
 */
export const copyAgendaByMeeting = async (fromMeetingId, toMeetingId) => {
  try {
    return await axios.post(`${API_BASE_URL}/copyAgendaByMeeting/${fromMeetingId}/${toMeetingId}`);
  } catch (error) {
    console.error('Copy Agenda By Meeting API error:', error?.response || error);
    throw error;
  }
};

/**
 * Publish/Unpublish Agenda for a Meeting
 * Pass status as 'published' to set true; anything else will set false.
 */
export const isAgendaPublished = async (meetingId, status) => {
  try {
    return await axios.post(`${API_BASE_URL}/isAgendaPublished/${meetingId}/${status}`);
  } catch (error) {
    console.error('Is Agenda Published API error:', error?.response || error);
    throw error;
  }
};
