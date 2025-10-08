import { useState, useEffect } from 'react';
import { getMemberPreferredRoles } from '../api/PreferredRoleApi';
import { getMemberAssignedRole, getAllMemberAssignedRolesByMeeting } from '../api/AssignedRoleApi';
import { getAllMeetingRoleCombineByMeeting } from '../api/MeetingRoleApi';
import { getAllMemberAvailabilityByMeetingId } from '../api/AvailableMembersApi';
import { getAllAssignedEvaluatorsByMeeting } from '../api/AssignEvaluatorApi';

// Simple in-memory cache for meeting data per (meetingId,userId)
const MEETING_DATA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const meetingDataCache = new Map(); // key: `${meetingId}::${userId}` -> { timestamp, value }
const makeKey = (meetingId, userId) => `${meetingId}::${userId}`;

const useMeetingData = (meetingId, userId, members) => {
  const [meetingData, setMeetingData] = useState({
    loading: true,
    error: null,
    preferredRoles: [],
    assignedRoles: [],
    availableRoles: [],
    availabilityStatus: -1,
    assignedEvaluators: [],
    assignedSpeakers: [],
  });

  useEffect(() => {
    if (!meetingId || !userId) {
      setMeetingData(prev => ({ ...prev, loading: false }));
      return;
    }

    // Serve cached data immediately if available and fresh (stale-while-revalidate)
    const key = makeKey(meetingId, userId);
    const cached = meetingDataCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < MEETING_DATA_CACHE_TTL) {
      setMeetingData({ loading: false, ...cached.value });
    }

    const fetchMeetingDetails = async () => {
      try {
        const requests = [
          getMemberPreferredRoles(userId, meetingId),
          getMemberAssignedRole(userId, meetingId),
          getAllMeetingRoleCombineByMeeting(meetingId),
          getAllMemberAssignedRolesByMeeting(meetingId),
          getAllMemberAvailabilityByMeetingId(meetingId),
          getAllAssignedEvaluatorsByMeeting(meetingId),
        ];

        const [ 
          preferredRes,
          assignedRes,
          rolesRes,
          allAssignedRes,
          availRes,
          evaluatorAssignmentsRes
        ] = await Promise.all(requests.map(p => p.catch(e => e)));

        // Process preferred roles
        const preferredRoles = preferredRes?.data?.data || (Array.isArray(preferredRes?.data) ? preferredRes.data : []);

        // Process assigned roles for the current user
        const assignedRoles = assignedRes?.data?.data || (Array.isArray(assignedRes?.data) ? assignedRes.data : []);

        // Process available roles and calculate counts
        const rolesData = rolesRes?.data?.data || [];
        const allAssignedData = allAssignedRes?.data?.data || [];
        const roleCounts = {};
        rolesData.forEach(role => {
          roleCounts[role.roleName] = role.roleCount || 1;
        });
        allAssignedData.forEach(assignment => {
          const roleName = assignment.roleName || assignment.role?.roleName;
          if (roleName && roleCounts[roleName] > 0) {
            roleCounts[roleName] -= 1;
          }
        });
        const availableRoles = rolesData.map(role => ({
          ...role,
          availableCount: roleCounts[role.roleName] || 0
        }));

        // Process availability status
        const allForMeeting = availRes?.data?.data || [];
        const record = allForMeeting.find(a => String(a.userId || a.memberId || a.user?.userId) === String(userId));
        const availabilityStatus = record ? Number(record.status ?? -1) : -1;

        // Process evaluator and speaker assignments
        const allAssignments = evaluatorAssignmentsRes?.data?.data || [];
        const assignedEvaluators = allAssignments
          .filter(a => String(a.speakerId) === String(userId))
          .map(item => {
            const member = members.find(m => String(m.userId) === String(item.evaluatorId));
            const name = member?.userName || [member?.firstName, member?.lastName].filter(Boolean).join(' ');
            return name ? `${item.evaluatorId} - ${name}` : `${item.evaluatorId}`;
          });

        const assignedSpeakers = allAssignments
          .filter(a => String(a.evaluatorId) === String(userId))
          .map(item => {
            const member = members.find(m => String(m.userId) === String(item.speakerId));
            const name = member?.userName || [member?.firstName, member?.lastName].filter(Boolean).join(' ');
            return name ? `${item.speakerId} - ${name}` : `${item.speakerId}`;
          });

        const payload = {
          error: null,
          preferredRoles,
          assignedRoles,
          availableRoles,
          availabilityStatus,
          assignedEvaluators,
          assignedSpeakers,
        };
        setMeetingData({ loading: false, ...payload });
        meetingDataCache.set(key, { timestamp: Date.now(), value: payload });

      } catch (err) {
        setMeetingData({
          loading: false,
          error: err.message || 'Failed to load meeting details',
          preferredRoles: [],
          assignedRoles: [],
          availableRoles: [],
          availabilityStatus: -1,
          assignedEvaluators: [],
          assignedSpeakers: [],
        });
      }
    };

    fetchMeetingDetails();
  }, [meetingId, userId, members]);

  return meetingData;
};

export default useMeetingData;
