import axios from 'axios';

// Backend controller is mapped at @RequestMapping("/meeting")
// Frontend uses a base '/api' path for proxying to backend
const BASE_URL = '/api/meeting';

// POST: add/update/delete evaluator assignments in one go
// Expects a list of { id?, speakerId, evaluatorId, meetingId }
export const assignEvaluators = async (assignments) => {
  return axios.post(`${BASE_URL}/assignEvaluators`, assignments, {
    headers: { 'Content-Type': 'application/json' }
  });
};

// GET: all evaluator assignments for a meeting
export const getAllAssignedEvaluatorsByMeeting = async (meetingId) => {
  return axios.get(`${BASE_URL}/getAllAssignedEvaluatorsByMeeting/${meetingId}`);
};

// Optionally expose other query helpers if needed by UI later
export const getAllAssignedEvaluators = async () => {
  return axios.get(`${BASE_URL}/getAllAssignedEvaluators`);
};

// GET: evaluator assignments for a specific speaker and meeting
export const getAllAssignedEvaluatorsBySpeakerAndMeeting = async (speakerId, meetingId) => {
  return axios.get(`${BASE_URL}/getAllAssignedEvaluatorsBySpeakerAndMeeting/${speakerId}/${meetingId}`);
};

// GET: assignments for a specific evaluator and meeting
export const getAllAssignedEvaluatorsByEvaluatorAndMeeting = async (evaluatorId, meetingId) => {
  return axios.get(`${BASE_URL}/getAllAssignedEvaluatorsByEvaluatorAndMeeting/${evaluatorId}/${meetingId}`);
};

// DELETE: delete a specific evaluator-speaker pair by tuple IDs
export const deleteAssignedEvaluatorById = async (evaluatorId, meetingId, speakerId) => {
  return axios.delete(`${BASE_URL}/deleteAssignedEvaluatorById/${evaluatorId}/${meetingId}/${speakerId}`);
};
