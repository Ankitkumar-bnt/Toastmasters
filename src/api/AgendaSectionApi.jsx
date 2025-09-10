import axios from 'axios';

const BASE_URL = '/api/agenda';

// AgendaSection API client based on AgendaSectionController
// DTO assumption: { sectionName: string }

export const addAgendaSection = async (dto) => {
  const res = await axios.post(`${BASE_URL}/addAgendaSection`, dto, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

export const getAllAgendaSections = async () => {
  const res = await axios.get(`${BASE_URL}/getAllAgendaSections`);
  return res.data;
};

export const getAgendaSectionById = async (id) => {
  const res = await axios.get(`${BASE_URL}/getAgendaSectionById/${id}`);
  return res.data;
};

export const updateAgendaSection = async (id, dto) => {
  const res = await axios.put(`${BASE_URL}/updateAgendaSection/${id}`, dto, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

export const deleteAgendaSection = async (id) => {
  const res = await axios.delete(`${BASE_URL}/deleteAgendaSection/${id}`);
  return res.data;
};
