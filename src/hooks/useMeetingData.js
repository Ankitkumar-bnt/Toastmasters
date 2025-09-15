import { useState, useEffect } from 'react';
import { getMemberPreferredRoles } from '../api/PreferredRoleApi';
import { getMemberAssignedRole, getAllMemberAssignedRolesByMeeting } from '../api/AssignedRoleApi';
import { getAllMeetingRoleCombineByMeeting } from '../api/MeetingRoleApi';
import { getAllMemberAvailabilityByMeetingId } from '../api/AvailableMembersApi';
import { getAllAssignedEvaluatorsByMeeting } from '../api/AssignEvaluatorApi';

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

        setMeetingData({
          loading: false,
          error: null,
          preferredRoles,
          assignedRoles,
          availableRoles,
          availabilityStatus,
          assignedEvaluators,
          assignedSpeakers,
        });

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
